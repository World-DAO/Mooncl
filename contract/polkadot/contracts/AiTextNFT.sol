// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

interface IAiLaunchpad {
    function autoListMinted(address seller, uint256 tokenId) external returns (uint256 listingId);
}

/**
 * @dev Lightweight replacement for the original ERC721 contract. It keeps the
 * same external interface and events that the backend relies on, but omits the
 * ERC721 inheritance to keep the bytecode small.
 */
contract AiTextNFT is Ownable {
    string public name;
    string public symbol;
    address public market;
    uint256 public nextId = 1;

    mapping(uint256 => string) private _contentOf;
    mapping(uint256 => uint256) public priceOf;
    mapping(uint256 => bool) public isBuyable;
    mapping(uint256 => address) private _owners;

    address public priceSetter;
    uint256 public mintFee;
    address public mintFeeRecipient;

    error NotMarket();
    error NonexistentToken();

    event MarketSet(address indexed market);
    event Minted(uint256 indexed tokenId, address indexed minter, string content);
    event PriceSetterUpdated(address indexed setter);
    event PriceSet(uint256 indexed tokenId, uint256 price);
    event MintFeeUpdated(uint256 mintFee, address indexed recipient);

    constructor(string memory name_, string memory symbol_)
        Ownable(_msgSender())
    {
        name = name_;
        symbol = symbol_;
    }

    modifier onlyMarket() {
        if (msg.sender != market) revert NotMarket();
        _;
    }

    function setMarket(address m) external onlyOwner {
        require(m != address(0), "market=0");
        market = m;
        emit MarketSet(m);
    }

    function setMintFee(uint256 fee, address recipient) external onlyOwner {
        mintFee = fee;
        mintFeeRecipient = recipient;
        emit MintFeeUpdated(fee, recipient);
    }

    function setPriceSetter(address setter) external onlyOwner {
        priceSetter = setter;
        emit PriceSetterUpdated(setter);
    }

    function mint(string calldata content)
        external
        payable
        returns (uint256 tokenId)
    {
        require(market != address(0), "market unset");
        tokenId = _mint(msg.sender, content);
        _collectMintFee();
    }

    function mintTo(address seller, string calldata content)
        external
        onlyMarket
        returns (uint256 tokenId)
    {
        tokenId = _mint(seller, content);
    }

    function setPrice(uint256 tokenId, uint256 price) external {
        _requireExists(tokenId);
        require(msg.sender == owner() || msg.sender == priceSetter, "not setter");
        priceOf[tokenId] = price;
        isBuyable[tokenId] = true;
        emit PriceSet(tokenId, price);
    }

    function contentOf(uint256 tokenId) external view returns (string memory) {
        _requireExists(tokenId);
        return _contentOf[tokenId];
    }

    function ownerOf(uint256 tokenId) external view returns (address) {
        _requireExists(tokenId);
        return _owners[tokenId];
    }

    function disableBuy(uint256 tokenId) external onlyMarket {
        _requireExists(tokenId);
        isBuyable[tokenId] = false;
    }

    function enableBuy(uint256 tokenId) external onlyMarket {
        _requireExists(tokenId);
        isBuyable[tokenId] = true;
    }

    function transferTo(address to, uint256 tokenId) external onlyMarket {
        require(to != address(0), "to=0");
        _requireExists(tokenId);
        _owners[tokenId] = to;
        priceOf[tokenId] = 0;
        isBuyable[tokenId] = false;
    }

    function _mint(address seller, string memory content) internal returns (uint256 tokenId) {
        tokenId = nextId++;
        _owners[tokenId] = seller;
        _contentOf[tokenId] = content;
        isBuyable[tokenId] = false;

        emit Minted(tokenId, msg.sender, content);
        IAiLaunchpad(market).autoListMinted(seller, tokenId);
    }

    function _collectMintFee() internal {
        if (mintFee == 0) {
            require(msg.value == 0, "no fee required");
            return;
        }
        require(msg.value == mintFee, "bad mint fee");
        address recipient = mintFeeRecipient == address(0) ? owner() : mintFeeRecipient;
        (bool ok, ) = payable(recipient).call{value: msg.value}("");
        require(ok, "fee transfer failed");
    }

    function _requireExists(uint256 tokenId) internal view {
        if (_owners[tokenId] == address(0)) revert NonexistentToken();
    }
}
