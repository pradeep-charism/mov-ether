App = {
  web3Provider: null,
  contracts: {},

  init: async function () {
  $.getJSON('../products/store-items.json', function (data) {
        var shopsRow = $('#shopsRow');
        var shopTemplate = $('#shopTemplate');

        for (let i = 0; i < data.length; i++) {
          shopTemplate.find('.panel-title').text(data[i].name);
          shopTemplate.find('img').attr('src', data[i].picture);
          shopTemplate.find('.shop-desc').text(data[i].desc);
//          shopTemplate.find('.shop-cost').text(data[i].cost);
          shopTemplate.find('.btn-adopt').attr('data-id', data[i].id);
          shopsRow.append(shopTemplate.html());
        }
      });

    return await App.initWeb3();
  },

  initWeb3: async function () {
    App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    web3 = new Web3(App.web3Provider);
    return App.initContract();
  },

  initContract: function () {

    $.getJSON('MovEtherContract.json', function (data) {
      var ABCoinContractArtifact = data;
      App.contracts.MovEtherContract = TruffleContract(ABCoinContractArtifact);
      App.contracts.MovEtherContract.setProvider(App.web3Provider);
      return true;
    });

    return App.bindEvents();
  },

    handleBuy: function (event) {
      event.preventDefault();

      var shopId = parseInt($(event.target).data('id'));
      var buyInstance;
      web3.eth.getAccounts(function (error, accounts) {
        if (error) {
          console.log(error);
        }
        var account = accounts[0];
         var etherValue = 10000;
         console.log("Rent cost", etherValue);

        App.contracts.MovEtherContract.deployed().then(function (instance) {
          buyInstance = instance;
          return buyInstance.buy(etherValue, { from: account, data: etherValue });
        }).then(function (result) {
            alert('Item bought', `${result}`);
            console.log("Item bought:", `${result}`);
          return true;
        }).catch(function (err) {
            alert(err.message);
            console.log(err.message);
        });
      });
    },

  bindEvents: function () {
    $(document).on('click', '.btn-buy-toy', App.handleBuy);
  },

hookupMetamask: async function () {
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        await window.ethereum.enable();
      } catch (error) {
        console.error("User denied account access")
      }
    }
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }
    else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);
    return App.initContract();
  }
};

$(function () {
  $(window).load(function () {
    App.init();
  });
});
