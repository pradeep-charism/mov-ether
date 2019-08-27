pragma solidity ^0.5.8;

import "./SafeMath.sol";

contract MovEtherEternalStorage {
    using SafeMath for uint;

    struct Token {
        address holder;
        uint units;
    }
    mapping(address => Token) tokensLedger;
    address[] tokenHolders;
    address[16] public products;
    address payable private _adminWallet;

    constructor(address payable wallet) public payable{
        _adminWallet = wallet;
        depositCoin(msg.sender, 0);
    }

    function store(uint productId, address buyer) external returns (bool){
        products[productId] = buyer;
        return true;
    }

    function unStore(uint productId) external returns (bool){
        delete products[productId];
        return true;
    }

    function getAllProducts() external view returns (address[16]memory) {
        return products;
    }

    function depositCoin(address sender, uint tokens) public returns (bool success) {
        Token memory newToken = tokensLedger[sender];
        newToken.units = newToken.units.add(tokens);
        newToken.holder = sender;
        tokensLedger[sender] = newToken;

        if(tokensLedger[sender].holder == 0x0000000000000000000000000000000000000000){
            tokenHolders.push(sender);
        }
        return true;
    }

    function withdrawCoin(address sender, uint tokens) public returns (bool) {
        Token memory newToken = tokensLedger[sender];
        require(newToken.units != 0, 'No coin balance at the senders account');
        delete tokensLedger[sender];
        newToken.holder = sender;
        newToken.units = newToken.units.sub(tokens);
        tokensLedger[sender] = newToken;

        if(tokensLedger[_adminWallet].holder == 0x0000000000000000000000000000000000000000){
            tokenHolders.push(_adminWallet);
        }
        Token memory  token = tokensLedger[_adminWallet];
        token.holder = _adminWallet;
        token.units = token.units.add(tokens);
        tokensLedger[_adminWallet] = token;
        return true;
    }

    function buy(address from, uint tokens) public returns (bool) {
        withdrawCoin(from, tokens);
        return true;
    }

    function sell(address to, uint tokens) external returns (bool) {
        depositCoin(to, tokens);
        return true;
    }

    function getAllTokenHolders() external view returns (address[] memory, uint[] memory){
        address[] memory holders = new address[](tokenHolders.length);
        uint[]    memory units = new uint[](tokenHolders.length);
        for (uint i = 0; i < tokenHolders.length; i++) {
            Token storage token = tokensLedger[tokenHolders[i]];
            holders[i] = token.holder;
            units[i] = token.units;
        }
        return (holders, units);
    }

    function balanceOf(address tokenOwner) external view returns (uint balance) {
        return tokensLedger[tokenOwner].units;
    }

    function adminCoinBalance() external view returns (uint) {
        return tokensLedger[_adminWallet].units;
    }

}