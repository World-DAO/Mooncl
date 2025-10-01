import { ethers } from "hardhat";

function ensurePrivateKey(): string {
  const key = process.env.PRIVATE_KEY;
  if (!key || key.trim() === "") {
    throw new Error("PRIVATE_KEY env var is required");
  }
  return key.trim();
}

function getAddressEnv(name: string, fallback: string): string {
  const value = process.env[name];
  if (!value || value.trim() === "") {
    return fallback;
  }
  return ethers.getAddress(value);
}

function getUintBigIntEnv(name: string, fallback: bigint): bigint {
  const value = process.env[name];
  if (!value || value.trim() === "") {
    return fallback;
  }
  const raw = value.trim();
  if (raw.startsWith("0x") || raw.startsWith("0X")) {
    return BigInt(raw);
  }
  if (raw.includes(".")) {
    return ethers.parseEther(raw);
  }
  return BigInt(raw);
}

async function main() {
  const privateKey = ensurePrivateKey();
  const provider = ethers.provider;
  const signer = new ethers.Wallet(privateKey, provider);
  const deployer = await signer.getAddress();

  const nftName = process.env.NFT_NAME ?? "MOONCL";
  const nftSymbol = process.env.NFT_SYMBOL ?? "MOONCL";

  const feeRecipient = getAddressEnv("LAUNCHPAD_FEE_RECIPIENT", deployer);
  const feeBps = getUintBigIntEnv("LAUNCHPAD_FEE_BPS", 100n);

  const mintFee = getUintBigIntEnv("MINT_FEE", ethers.parseEther("0.001"));
  const mintFeeRecipient = getAddressEnv("MINT_FEE_RECIPIENT", deployer);

  const priceSetter = getAddressEnv("PRICE_SETTER", deployer);

  console.log(`Deploying contracts with ${deployer}`);

  const AiTextNFT = await ethers.getContractFactory("AiTextNFT", signer);
  const aiText = await AiTextNFT.deploy(nftName, nftSymbol);
  await aiText.waitForDeployment();

  const AiLaunchpad = await ethers.getContractFactory("AiLaunchpad", signer);
  const launchpad = await AiLaunchpad.deploy(await aiText.getAddress(), feeRecipient, feeBps);
  await launchpad.waitForDeployment();

  const launchpadAddress = await launchpad.getAddress();

  const txMarket = await aiText.setMarket(launchpadAddress);
  await txMarket.wait();

  if (mintFee > 0n || mintFeeRecipient !== ethers.ZeroAddress) {
    const txMintFee = await aiText.setMintFee(mintFee, mintFeeRecipient);
    await txMintFee.wait();
  }

  if (priceSetter !== deployer) {
    const txPriceSetter = await aiText.setPriceSetter(priceSetter);
    await txPriceSetter.wait();
  }

  console.log("AiTextNFT deployed at", await aiText.getAddress());
  console.log("AiLaunchpad deployed at", launchpadAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
