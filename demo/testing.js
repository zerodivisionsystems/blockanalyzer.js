const BlockAnalyzer = require("../packages/blockanalyzer.js");
const Web3 = require("Web3");


// https://mainnet.infura.io/v3/22ce6fb0a1454ab3a9600cc0943da06c

let constructorObj = {

    web3: {
        url: "http://127.0.0.1:8545",
        password: "cento mani e cento occhi"
    }
}


let blockanalyzer = new BlockAnalyzer(constructorObj);

blockanalyzer.listen()
.on('newdeposit', console.log)
.on('error', console.log)