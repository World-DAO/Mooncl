// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

import "./AiTextNFT.sol";

contract AiLaunchpad is Ownable, ReentrancyGuard {
    address public immutable nft;

    address public feeRecipient;
    uint96 public feeBps; // 10000 = 100%

    struct Listing {
        address seller;
    }

    mapping(uint256 => Listing) public listings;

    event Listed(uint256 indexed listingId, uint256 indexed tokenId, uint256 price);
    event Bought(uint256 indexed listingId, uint256 indexed tokenId, address buyer);

    constructor(address nft_, address feeRecipient_, uint96 feeBps_)
        Ownable(_msgSender())
    {
        require(nft_ != address(0), "nft=0");
        nft = nft_;
        feeRecipient = feeRecipient_;
        feeBps = feeBps_;
    }

    function setFee(address recipient, uint96 bps) external onlyOwner {
        feeRecipient = recipient;
        feeBps = bps;
    }

    function buy(uint256 listingId) external payable nonReentrant {
        Listing memory listing = listings[listingId];
        require(listing.seller != address(0), "unknown listing");

        AiTextNFT token = AiTextNFT(nft);
        uint256 tokenId = listingId;
        require(token.isBuyable(tokenId), "not buyable");

        uint256 price = token.priceOf(tokenId);
        require(msg.value == price, "bad value");

        uint256 fee = (price * feeBps) / 10_000;
        if (fee > 0 && feeRecipient != address(0)) {
            (bool feeOk, ) = payable(feeRecipient).call{value: fee}("");
            require(feeOk, "fee transfer fail");
        }

        uint256 sellerProceeds = price - fee;
        (bool sellerOk, ) = payable(listing.seller).call{value: sellerProceeds}("");
        require(sellerOk, "seller transfer fail");

        address buyer = msg.sender;

        token.transferTo(buyer, tokenId);
        _delist(tokenId);
        emit Bought(listingId, tokenId, buyer);

        _list(buyer, tokenId);
    }

    function autoListMinted(address seller, uint256 tokenId)
        external
        returns (uint256 listingId)
    {
        require(msg.sender == nft, "only nft");
        listingId = _list(seller, tokenId);
    }

    receive() external payable {}

    function _list(address seller, uint256 tokenId) internal returns (uint256 listingId) {
        listings[tokenId] = Listing({seller: seller});

        AiTextNFT token = AiTextNFT(nft);
        uint256 price = token.priceOf(tokenId);
        listingId = tokenId;

        emit Listed(listingId, tokenId, price);

        token.disableBuy(tokenId);
    }

    function _delist(uint256 tokenId) internal {
        delete listings[tokenId];
        AiTextNFT(nft).disableBuy(tokenId);
    }
}
