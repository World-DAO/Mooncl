// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IAiLaunchpad {
    function autoListMinted(address seller, uint256 tokenId) external returns (uint256 listingId);
}

contract AiTextNFT is ERC721, Ownable {
    address public market;                 // 唯一可发起转移/可被授权的 Market
    uint256 public nextId = 1;

    mapping(uint256 => string) private _contentOf;
    mapping(uint256 => uint256) public priceOf;
    mapping(uint256 => bool)    public isBuyable;

    address public priceSetter;
    uint256 public mintFee;
    address public mintFeeRecipient;

    error NotMarket();
    error OnlyMarketAllowed();

    event MarketSet(address indexed market);
    event Minted(
        uint256 indexed tokenId,
        address indexed minter,
        string content
    );
    event PriceSetterUpdated(address indexed setter);
    event PriceSet(uint256 indexed tokenId, uint256 price);
    event MintFeeUpdated(uint256 mintFee, address indexed recipient);

    constructor(string memory name_, string memory symbol_)
        ERC721(name_, symbol_)
        Ownable(_msgSender())
    {}

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

    modifier onlyMarket() {
        if (msg.sender != market) revert NotMarket();
        _;
    }

    /// @dev 用户可自行 Mint；铸造后直接托管给 Market 并挂牌出售
    function mint(string calldata content)
        external
        payable
        returns (uint256 tokenId)
    {
        require(market != address(0), "market unset");
        string memory contentCopy = content;
        tokenId = _mintToMarket(msg.sender, contentCopy);
        _collectMintFee();
    }

    /// @dev 仅允许 Market 代为托管铸造，seller 表示委托出售人
    function mintTo(address seller, string calldata content)
        external
        onlyMarket
        returns (uint256 tokenId)
    {
        string memory contentCopy = content;
        tokenId = _mintToMarket(seller, contentCopy);
    }

    function setPrice(uint256 tokenId, uint256 price) external {
        require(_ownerOf(tokenId) != address(0), "nonexistent");
        require(msg.sender == owner() || msg.sender == priceSetter, "not setter");
        priceOf[tokenId] = price;
        isBuyable[tokenId] = true;
        emit PriceSet(tokenId, price);
    }

    function contentOf(uint256 tokenId) external view returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "nonexistent");
        return _contentOf[tokenId];
    }

    function disableBuy(uint256 tokenId) external onlyMarket {
        require(_ownerOf(tokenId) != address(0), "nonexistent");
        isBuyable[tokenId] = false;
    }

    function enableBuy(uint256 tokenId) external onlyMarket {
        require(_ownerOf(tokenId) != address(0), "nonexistent");
        isBuyable[tokenId] = true;
    }

    // ---------- 只允许把授权授予 Market ----------
    function approve(address to, uint256 tokenId) public override {
        require(to == market || to == address(0), "approve only market");
        super.approve(to, tokenId);
    }

    function setApprovalForAll(address operator, bool approved) public override {
        require(operator == market, "setApproval only market");
        super.setApprovalForAll(operator, approved);
    }

    // ---------- 强制所有转移只能由 Market 发起 ----------
    function _update(address to, uint256 tokenId, address auth)
        internal
        override
        returns (address)
    {
        address from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0) && msg.sender != market) {
            revert OnlyMarketAllowed();
        }
        return super._update(to, tokenId, auth);
    }

    function _mintToMarket(
        address seller,
        string memory content
    ) internal returns (uint256 tokenId) {
        require(market != address(0), "market unset");
        tokenId = nextId++;
        _safeMint(market, tokenId);
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
}
