import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Vault", function () {
  async function deployVaultFixture() {
    const [owner, otherAccount] = await ethers.getSigners();

    const MockToken = await ethers.getContractFactory("MockToken");
    const mockToken = await MockToken.deploy();
    const mockTokenAddress = await mockToken.getAddress();

    const Vault = await ethers.getContractFactory("Vault");
    const vault = await Vault.deploy(mockTokenAddress);
    const vaultAddress = await vault.getAddress();

    return { vault, mockToken, owner, otherAccount, vaultAddress, mockTokenAddress };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { vault, owner } = await loadFixture(deployVaultFixture);
      expect(await vault.owner()).to.equal(owner.address);
    });

    it("Should set the right token", async function () {
      const { vault, mockTokenAddress } = await loadFixture(deployVaultFixture);
      expect(await vault.token()).to.equal(mockTokenAddress);
    });
  });

  describe("Deposit", function () {
    it("Should deposit tokens successfully", async function () {
      const { vault, mockToken, owner, vaultAddress } = await loadFixture(deployVaultFixture);
      const amount = ethers.parseUnits("100", 18);

      await mockToken.approve(vaultAddress, amount);
      await expect(vault.deposit(amount))
        .to.emit(vault, "Deposited")
        .withArgs(owner.address, amount);

      expect(await vault.balances(owner.address)).to.equal(amount);
      expect(await mockToken.balanceOf(vaultAddress)).to.equal(amount);
    });

    it("Should fail if amount is 0", async function () {
      const { vault } = await loadFixture(deployVaultFixture);
      await expect(vault.deposit(0)).to.be.revertedWithCustomError(vault, "InvalidAmount");
    });

    it("Should fail if paused", async function () {
      const { vault, owner } = await loadFixture(deployVaultFixture);
      await vault.setPaused(true);
      await expect(vault.deposit(100)).to.be.revertedWithCustomError(vault, "PausedError");
    });
  });

  describe("Withdraw", function () {
    it("Should withdraw tokens successfully", async function () {
      const { vault, mockToken, owner, vaultAddress } = await loadFixture(deployVaultFixture);
      const amount = ethers.parseUnits("100", 18);

      await mockToken.approve(vaultAddress, amount);
      await vault.deposit(amount);

      await expect(vault.withdraw(amount))
        .to.emit(vault, "Withdrawn")
        .withArgs(owner.address, amount);

      expect(await vault.balances(owner.address)).to.equal(0);
      expect(await mockToken.balanceOf(vaultAddress)).to.equal(0);
    });

    it("Should fail if insufficient balance", async function () {
      const { vault } = await loadFixture(deployVaultFixture);
      await expect(vault.withdraw(100)).to.be.revertedWithCustomError(vault, "InsufficientBalance");
    });

    it("Should fail if paused", async function () {
      const { vault } = await loadFixture(deployVaultFixture);
      await vault.setPaused(true);
      await expect(vault.withdraw(100)).to.be.revertedWithCustomError(vault, "PausedError");
    });
  });

  describe("Emergency Withdraw", function () {
    it("Should allow owner to emergency withdraw", async function () {
      const { vault, mockToken, owner, vaultAddress } = await loadFixture(deployVaultFixture);
      const amount = ethers.parseUnits("100", 18);

      await mockToken.approve(vaultAddress, amount);
      await vault.deposit(amount);

      await expect(vault.emergencyWithdraw())
        .to.emit(vault, "EmergencyWithdrawn")
        .withArgs(owner.address, amount);

      expect(await mockToken.balanceOf(vaultAddress)).to.equal(0);
    });

    it("Should fail if not owner", async function () {
      const { vault, otherAccount } = await loadFixture(deployVaultFixture);
      await expect(vault.connect(otherAccount).emergencyWithdraw()).to.be.revertedWithCustomError(vault, "NotOwner");
    });
  });
});