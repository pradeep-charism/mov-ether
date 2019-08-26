App = {
  web3Provider: null,
  contracts: {},

  init: async function () {
    return await App.initWeb3();
  },

  initWeb3: async function () {
    App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    web3 = new Web3(App.web3Provider);
    return App.initContract();
  },

  initContract: function () {

    $.getJSON('EMartCoinContract.json', function (data) {
      var ABCoinContractArtifact = data;
      App.contracts.EMartCoinContract = TruffleContract(ABCoinContractArtifact);
      App.contracts.EMartCoinContract.setProvider(App.web3Provider);
      return App.loadOnStartup();
    });

    return App.bindEvents();
  },


  bindEvents: function () {
    $(document).on('click', '.btn-pause', App.pauseContract);
    $(document).on('click', '.btn-resume', App.resumeContract);
  },

  loadOnStartup: function (event) {
    var abcoinInstance;
    const emCoinDeployed = App.contracts.EMartCoinContract.deployed();

    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }
      var account = accounts[0];

      var balanceWei = web3.eth.getBalance(account);
      var balance = web3.fromWei(balanceWei, 'ether');
      $('#etherBalanceGroup').find('.ether-balance').text(`${balance}`);
      console.log("etherBalance", balance);

      emCoinDeployed.then(function (instance) {
        abcoinInstance = instance;
        return abcoinInstance.balanceOf(account, { from: account });
      }).then(function (result) {
        $('#coingroup').find('.balance-at').text(`${result}`);
        console.log("Balance at", `${result}`);
        return true;
      }).catch(function (err) {
        alert(err.message);
        console.log(err.message);
      });
    });

//    web3.eth.getAccounts(function (error, accounts) {
//          if (error) {
//            console.log(error);
//          }
//          var account = accounts[0];
//          emCoinDeployed.then(function (instance) {
//            abcoinInstance = instance;
//            var x = abcoinInstance.isContractStopped({ from: account });
//            console.log(x);
//            return true;
//          }).then(function (result) {
//            console.log("Balance at", `${result}`);
//            return true;
//          }).catch(function (err) {
//            alert(err.message);
//            console.log(err.message);
//          });
//        });
  },

  pauseContract: function (event) {
  event.preventDefault();

      var abcoinInstance;
      web3.eth.getAccounts(function (error, accounts) {
        if (error) {
          console.log(error);
        }
        var account = accounts[0];
        App.contracts.EMartCoinContract.deployed().then(function (instance) {
          abcoinInstance = instance;

          return abcoinInstance.stopContract({ from: account });
        }).then(function (result) {
          console.log("Stop contract", `${result}`);
          $('#adminBtnGroup').find('.btn-pause').text('Pause').attr('disabled', true);
          $('#adminBtnGroup').find('.btn-resume').text('Resume').attr('disabled', false);
          alert("Contract successfully stopped");
          return App.loadOnStartup();
        }).catch(function (err) {
            alert(err.message);
            console.log(err.message);
        });
      });
    },

    resumeContract: function (event) {
    event.preventDefault();

      var abcoinInstance;
      web3.eth.getAccounts(function (error, accounts) {
        if (error) {
          console.log(error);
        }
        var fromAccount = accounts[0];
        App.contracts.EMartCoinContract.deployed().then(function (instance) {
          abcoinInstance = instance;
          return abcoinInstance.resumeContract({ from: fromAccount});
        }).then(function (result) {
          console.log("issueTokens", `${result}`);
          $('#adminBtnGroup').find('.btn-pause').text('Pause').attr('disabled', false);
          $('#adminBtnGroup').find('.btn-resume').text('Resume').attr('disabled', true);
          alert("Contract successfully resumed");
          return App.loadOnStartup();
        }).catch(function (err) {
            alert(err.message);
            console.log(err.message);
        });
      });
    }
};

$(function () {
  $(window).load(function () {
    App.init();
  });
});
