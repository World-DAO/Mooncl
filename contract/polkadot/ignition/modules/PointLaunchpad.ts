import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const PointLaunchpadModule = buildModule("PointLaunchpadModule", (m) => {
  const deployer = m.getAccount(0);

  const nftName = m.getParameter("nftName", "MOONCL");
  const nftSymbol = m.getParameter("nftSymbol", "MOONCL");

  const feeRecipient = m.getParameter("feeRecipient", deployer);
  const feeBps = m.getParameter("feeBps", 100n);

  const mintFee = m.getParameter("mintFee", 1000000000000000n); // 0.001 ether
  const mintFeeRecipient = m.getParameter("mintFeeRecipient", deployer);
  const priceSetter = m.getParameter("priceSetter", deployer);

  const nft = m.contract("AiTextNFT", [nftName, nftSymbol], { from: deployer });
  const launchpad = m.contract(
    "AiLaunchpad",
    [nft, feeRecipient, feeBps],
    { from: deployer }
  );

  m.call(nft, "setMarket", [launchpad], { from: deployer });

  if (mintFee > 0n || mintFeeRecipient !== m.zeroAddress) {
    m.call(nft, "setMintFee", [mintFee, mintFeeRecipient], { from: deployer });
  }

  if (priceSetter !== deployer) {
    m.call(nft, "setPriceSetter", [priceSetter], { from: deployer });
  }

  return { nft, launchpad };
});

export default PointLaunchpadModule;
