import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy MockToken
  const MockToken = await ethers.getContractFactory("MockToken");
  const mockToken = await MockToken.deploy();
  await mockToken.waitForDeployment();
  const mockTokenAddress = await mockToken.getAddress();

  console.log("MockToken deployed to:", mockTokenAddress);
  console.log("MockToken Deploy Tx:", mockToken.deploymentTransaction()?.hash);

  // Deploy Vault
  const Vault = await ethers.getContractFactory("Vault");
  const vault = await Vault.deploy(mockTokenAddress);
  await vault.waitForDeployment();
  const vaultAddress = await vault.getAddress();

  console.log("Vault deployed to:", vaultAddress);
  console.log("Vault Deploy Tx:", vault.deploymentTransaction()?.hash);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});