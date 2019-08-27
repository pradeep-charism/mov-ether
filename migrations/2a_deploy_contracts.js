const MovEtherEternalStorage = artifacts.require('./MovEtherEternalStorage.sol');

module.exports = async function (deployer, network, accounts) {
    const adminWallet = accounts[3];
    let _token;
    await deployer.deploy(MovEtherEternalStorage)
        .then(instance => {
            _token = instance.address;
            console.log ("Ether Mart coin is created at address", _token);
        });
 };