// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "../src/AiTextNFT.sol";
import "../src/Luanchpad.sol";

contract AiLaunchpadTest is Test {
    AiTextNFT internal nft;
    AiLaunchpad internal market;

    address internal constant ALICE = address(0xA11CE);
    address internal constant BOB = address(0xB0B);
    address internal constant FEE_RECIPIENT = address(0xFEE);
    address internal constant TRADE_FEE_RECIPIENT = address(0x7A1E);

    function setUp() public {
        nft = new AiTextNFT("AI Text", "AIT");
        market = new AiLaunchpad(FEE_RECIPIENT, 500);

        nft.setMarket(address(market));
        market.allowCollection(address(nft), true);
    }

    function testMintCollectsFeeAndStoresMetadata() public {
        uint256 mintFee = 0.25 ether;
        bytes memory content = bytes("ai-powered content");
        string memory uri = "ipfs://content";

        nft.setMintFee(mintFee, FEE_RECIPIENT);

        uint256 tokenId = _mintTo(ALICE, content, uri, mintFee);

        assertEq(tokenId, 1);
        assertEq(nft.ownerOf(tokenId), ALICE);
        assertEq(nft.tokenURI(tokenId), uri);
        assertEq(nft.textHashOf(tokenId), keccak256(abi.encodePacked(address(nft), tokenId)));
        assertEq(keccak256(nft.contentOf(tokenId)), keccak256(content));
        assertEq(FEE_RECIPIENT.balance, mintFee);
    }

    function testListAndBuyTransfersNFTAndPaysFees() public {
        uint256 price = 1 ether;
        uint256 tradeFee = 0.05 ether;
        bytes memory content = bytes("listed content");
        string memory uri = "ipfs://listed";

        uint256 tokenId = _mintTo(ALICE, content, uri, 0);
        nft.setPrice(tokenId, price);

        market.setTradeFee(TRADE_FEE_RECIPIENT, tradeFee);

        vm.prank(ALICE);
        nft.setApprovalForAll(address(market), true);

        vm.prank(ALICE);
        uint256 listingId = market.listOwned(address(nft), tokenId);
        assertEq(listingId, 1);
        assertEq(nft.ownerOf(tokenId), address(market));

        vm.deal(BOB, price + tradeFee);
        uint256 sellerBalanceBefore = ALICE.balance;
        uint256 feeRecipientBalanceBefore = FEE_RECIPIENT.balance;
        uint256 tradeRecipientBalanceBefore = TRADE_FEE_RECIPIENT.balance;

        vm.prank(BOB);
        market.buy{value: price + tradeFee}(listingId);

        assertEq(nft.ownerOf(tokenId), BOB);
        (, , , , bool listingActive) = market.listings(listingId);
        assertFalse(listingActive);

        uint256 protocolFee = (price * market.feeBps()) / 10000;
        assertEq(ALICE.balance - sellerBalanceBefore, price - protocolFee);
        assertEq(FEE_RECIPIENT.balance - feeRecipientBalanceBefore, protocolFee);
        assertEq(TRADE_FEE_RECIPIENT.balance - tradeRecipientBalanceBefore, tradeFee);
    }

    function testCancelRestoresNFTToSeller() public {
        uint256 tokenId = _prepareListedToken(ALICE, 2 ether);

        vm.prank(ALICE);
        market.cancel(1);

        assertEq(nft.ownerOf(tokenId), ALICE);
        (, , , , bool activeAfterCancel) = market.listings(1);
        assertFalse(activeAfterCancel);
    }

    function testCancelByNonSellerReverts() public {
        _prepareListedToken(ALICE, 0.5 ether);

        vm.expectRevert("not seller");
        vm.prank(BOB);
        market.cancel(1);
    }

    function testNonOwnerCannotSetMarketOrAllowCollection() public {
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, ALICE));
        vm.prank(ALICE);
        nft.setMarket(address(0x1234));

        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, ALICE));
        vm.prank(ALICE);
        market.allowCollection(address(nft), true);
    }

    function testApproveOnlyMarketAllowed() public {
        uint256 tokenId = _mintTo(ALICE, bytes("approval content"), "ipfs://approval", 0);

        vm.expectRevert(bytes("approve only market"));
        vm.prank(ALICE);
        nft.approve(BOB, tokenId);

        vm.expectRevert("setApproval only market");
        vm.prank(ALICE);
        nft.setApprovalForAll(BOB, true);

        vm.prank(ALICE);
        nft.approve(address(0), tokenId);
    }

    function testOnlyMarketCanInitiateTransfers() public {
        uint256 tokenId = _mintTo(ALICE, bytes("transfer content"), "ipfs://transfer", 0);

        vm.expectRevert(AiTextNFT.OnlyMarketAllowed.selector);
        vm.prank(ALICE);
        nft.safeTransferFrom(ALICE, BOB, tokenId);
    }

    function testListOwnedRequiresAllowedCollection() public {
        market.allowCollection(address(nft), false);

        uint256 tokenId = _mintTo(ALICE, bytes("content"), "ipfs://content", 0);
        nft.setPrice(tokenId, 1 ether);

        vm.expectRevert("collection not allowed");
        vm.prank(ALICE);
        market.listOwned(address(nft), tokenId);
    }

    function _prepareListedToken(address seller, uint256 price) internal returns (uint256 tokenId) {
        tokenId = _mintTo(seller, bytes("escrow content"), "ipfs://escrow", 0);
        nft.setPrice(tokenId, price);

        vm.prank(seller);
        nft.setApprovalForAll(address(market), true);

        vm.prank(seller);
        market.listOwned(address(nft), tokenId);
        assertEq(nft.ownerOf(tokenId), address(market));
    }

    function _mintTo(
        address minter,
        bytes memory content,
        string memory uri,
        uint256 value
    ) internal returns (uint256 tokenId) {
        vm.deal(minter, value + 1 ether);
        vm.prank(minter);
        tokenId = nft.mint{value: value}(content, uri);
    }
}
