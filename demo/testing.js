const BlockAnalyzer = require("../packages/blockanalyzer.js");
const Web3 = require("Web3");

var web3 = new Web3();

// https://mainnet.infura.io/v3/22ce6fb0a1454ab3a9600cc0943da06c

let constructorObj = {

    web3: {
        url: "http://127.0.0.1:8545"
    }
}

web3.setProvider(constructorObj.web3.url);

var wallet = web3.eth.accounts.wallet;

console.log(wallet);

let blockanalyzer = new BlockAnalyzer(constructorObj);

blockanalyzer.discoverDeposit()
.on("transaction", console.log);
