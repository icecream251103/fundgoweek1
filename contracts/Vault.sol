// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract Vault {
    address public owner;
    IERC20 public immutable token;
    bool public paused;
    mapping(address => uint256) public balances;

    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event Paused(bool paused);
    event EmergencyWithdrawn(address indexed owner, uint256 amount);

    error NotOwner();
    error PausedError();
    error InvalidAmount();
    error InsufficientBalance();

    constructor(address _token) {
        require(_token != address(0), "Invalid token address");
        owner = msg.sender;
        token = IERC20(_token);
    }

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    modifier whenNotPaused() {
        if (paused) revert PausedError();
        _;
    }

    function deposit(uint256 amount) external whenNotPaused {
        if (amount == 0) revert InvalidAmount();
        
        bool success = token.transferFrom(msg.sender, address(this), amount);
        require(success, "Transfer failed");
        
        balances[msg.sender] += amount;
        emit Deposited(msg.sender, amount);
    }

    function withdraw(uint256 amount) external whenNotPaused {
        if (balances[msg.sender] < amount) revert InsufficientBalance();
        
        balances[msg.sender] -= amount;
        
        bool success = token.transfer(msg.sender, amount);
        require(success, "Transfer failed");
        
        emit Withdrawn(msg.sender, amount);
    }

    function setPaused(bool _paused) external onlyOwner {
        paused = _paused;
        emit Paused(_paused);
    }

    function emergencyWithdraw() external onlyOwner {
        uint256 contractBalance = token.balanceOf(address(this));
        bool success = token.transfer(owner, contractBalance);
        require(success, "Transfer failed");
        emit EmergencyWithdrawn(owner, contractBalance);
    }
}