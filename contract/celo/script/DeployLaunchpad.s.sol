// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "forge-std/console2.sol";

import "../src/AiTextNFT.sol";
import "../src/Luanchpad.sol";

contract DeployLaunchpadScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        string memory nftName = vm.envOr("NFT_NAME", string("MOONCL"));
        string memory nftSymbol = vm.envOr("NFT_SYMBOL", string("MOONCL"));

        address feeRecipient = vm.envOr("LAUNCHPAD_FEE_RECIPIENT", deployer);
        uint96 feeBps = uint96(vm.envOr("LAUNCHPAD_FEE_BPS", uint256(100)));

        uint256 mintFee = vm.envOr("MINT_FEE", uint256(0.001 ether));
        address mintFeeRecipient = vm.envOr("MINT_FEE_RECIPIENT", deployer);

        address priceSetter = vm.envOr("PRICE_SETTER", address(0));

        vm.startBroadcast(deployerPrivateKey);

        AiTextNFT aiText = new AiTextNFT(nftName, nftSymbol);
        AiLaunchpad launchpad = new AiLaunchpad(address(aiText), feeRecipient, feeBps);

        aiText.setMarket(address(launchpad));

        if (mintFee > 0 || mintFeeRecipient != address(0)) {
            aiText.setMintFee(mintFee, mintFeeRecipient);
        }

        if (priceSetter != address(0)) {
            aiText.setPriceSetter(priceSetter);
        }

        vm.stopBroadcast();

        console2.log("AiTextNFT deployed at", address(aiText));
        console2.log("AiLaunchpad deployed at", address(launchpad));

    }
}
