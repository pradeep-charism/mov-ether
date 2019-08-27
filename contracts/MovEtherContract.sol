pragma solidity ^0.5.8;
import "./SafeMath.sol";
import "./CoinInterface.sol";
import "./Owned.sol";
import "./MovEtherEternalStorage.sol";

contract MovEtherContract is CoinInterface, Owned {
    using SafeMath for uint;

    string public symbol;
    string public  name;
    uint8 public decimals;
    uint _unitsToIssue;
    MovEtherEternalStorage _storage;

    bool isStopped = false;

    constructor(address payable wallet) public payable {
        require(wallet != address(0), "wallet is the zero address");

        symbol = "EMT";
        name = "Ether Mart Coins";
        decimals = 3;
        _unitsToIssue = 10 * 10**uint(decimals);
        _storage = new MovEtherEternalStorage(wallet);
    }

    modifier stoppedInEmergency {
        require(!isStopped, 'Contract paused by Admin');
        _;
    }

    modifier onlyWhenStopped {
        require(isStopped);
        _;
    }

    modifier onlyAuthorized {
        // Check for authorization of msg.sender here
        _;
    }

    function isContractStopped() external view returns (uint){
        return isStopped == true ? 1 : 0;
    }

    function stopContract() public onlyAuthorized {
        isStopped = true;
    }

    function resumeContract() public onlyAuthorized {
        isStopped = false;
    }

    event BuyEvent(
        address indexed _from,
        uint indexed _id
    );

    event SellEvent(
        address indexed _from,
        uint indexed _id
    );

    function buyProduct(uint productId) public payable stoppedInEmergency returns (uint) {
        require(msg.value != 0);
        require(productId >= 0 && productId <= 15);
       _storage.store(productId, msg.sender);
        emit BuyEvent(msg.sender, productId);
        return productId;
    }

    function sellProduct(uint productId) public payable stoppedInEmergency returns (uint) {
        require(address(this).balance != 0, 'No Ether available in store to refund.');
        require(productId >= 0 && productId <= 15);
        _storage.unStore(productId);
        msg.sender.transfer(1 ether);
        emit BuyEvent(msg.sender, productId);
        return productId;
    }

    function getProducts() public view returns (address[16]memory) {
        return _storage.getAllProducts();
    }

    function buy(uint tokens) public payable returns (bool success) {
        require(tokens != 0, 'Enter non-zero tokens');
        _storage.buy(msg.sender, tokens);
        return true;
    }

    function sell(uint tokens) public payable returns (bool success) {
        require(tokens != 0, 'Enter non-zero tokens');
        _storage.sell(msg.sender, tokens);
        return true;
    }

    function issueTokens(uint etherValue) public payable stoppedInEmergency returns (bool success) {
        require(etherValue != 0, 'Ether value cannot be 0');
        etherValue = etherValue/(10**18);
        _storage.depositCoin(msg.sender, _unitsToIssue*etherValue);
//        address(this).transfer(msg.value);
//        _adminWallet.transfer(msg.value);
    }

    function redeemTokens(uint tokens) public payable stoppedInEmergency returns (bool success) {
        require(tokens != 0, 'Enter non-zero tokens');
        uint etherValue = tokens/(_unitsToIssue);
        _storage.withdrawCoin(msg.sender, tokens);
        msg.sender.transfer(etherValue*(10**18));
        return true;
    }

    function balanceOf(address tokenOwner) public view returns (uint balance) {
        return _storage.balanceOf(tokenOwner);
    }

    function transfer(address to, uint tokens) public stoppedInEmergency returns (bool success) {
        require(to != address(0), 'Invalid address to transfer');
        _storage.transfer(msg.sender, to, tokens);
        emit Transfer(msg.sender, to, tokens);
        return true;
    }

    function getAllTokenHolders() public view returns (address[] memory, uint[] memory){
         return _storage.getAllTokenHolders();
    }

    function () external payable {
        revert();
    }
}