# Blockchain Intern Assignment – Week 1: Vault Smart Contract

Dự án này triển khai một Smart Contract Vault cho phép người dùng gửi và rút token ERC20, với các chức năng quản trị cơ bản.

## Tổng quan dự án

Dự án được xây dựng bằng Hardhat và TypeScript. Nó bao gồm:
- `Vault.sol`: Contract chính quản lý tiền gửi của người dùng.
- `MockToken.sol`: Token ERC20 giả lập để test.
- Script triển khai tự động.

## Cài đặt

1. Clone repository.
2. Cài đặt dependencies:
   ```bash
   npm install
   ```

## Cấu hình môi trường

Tạo file `.env` từ file mẫu `.env.example` và điền thông tin của bạn:

```bash
cp .env.example .env
```

- `BSC_TESTNET_RPC`: URL RPC của BSC Testnet (mặc định đã có).
- `PRIVATE_KEY`: Private key của ví deploy (đảm bảo ví có tBNB).
- `BSCSCAN_API_KEY`: API Key từ BscScan để verify contract.

## Compile

Để biên dịch các contract:

```bash
npx hardhat compile
```

## Testing

Dự án bao gồm các test case cơ bản cho Vault contract.

```bash
npx hardhat test
```

## Triển khai

### Local Hardhat Network

```bash
npx hardhat run scripts/deploy.ts
```

### BSC Testnet

```bash
npx hardhat run scripts/deploy.ts --network bscTestnet
```

## Địa chỉ Contract (Đã Deploy)

- **MockToken**: `0xAf816c5611283850BaBdAFCC93BEA82266239540`
- **Vault**: `0xeC6b3B898d6b03C52b9f66B898974de51546843c`

## Xác thực Contract (Verify)

Sau khi deploy lên BSC Testnet, bạn có thể xác thực contract bằng lệnh sau:

```bash
npx hardhat verify --network bscTestnet <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

Ví dụ verify Vault:
```bash
npx hardhat verify --network bscTestnet <VAULT_ADDRESS> <MOCK_TOKEN_ADDRESS>
```

## Logic Contract

- **Deposit**: Người dùng gửi token vào Vault. Yêu cầu `approve` trước.
- **Withdraw**: Người dùng rút token về ví.
- **Pause/Unpause**: Owner có thể tạm dừng contract trong trường hợp khẩn cấp.
- **Emergency Withdraw**: Owner có thể rút toàn bộ token trong contract về ví owner.