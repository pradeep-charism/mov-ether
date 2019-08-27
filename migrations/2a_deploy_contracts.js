const MovEtherEternalStorage = artifacts.require('./MovEtherEternalStorage.sol');

module.exports = async function (deployer, network, accounts) {
    const adminWallet = accounts[2];
    let _token;
    await deployer.deploy(MovEtherEternalStorage, adminWallet)
        .then(instance => {
            _token = instance.address;
            console.log ("Ether Mart coin is created at address", _token);
        });
 };