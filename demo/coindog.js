const BlockAnalyzer = require("../packages/blockanalyzer.js");
const Web3 = require("Web3");


// https://mainnet.infura.io/v3/22ce6fb0a1454ab3a9600cc0943da06c
// https://ropsten.infura.io/v3/22ce6fb0a1454ab3a9600cc0943da06c

let constructorObj = {

    web3: {
        url: "https://ropsten.infura.io/v3/22ce6fb0a1454ab3a9600cc0943da06c",
        block: 6357856,
        timeout: 2000,
        password: "cento mani e cento occhi"
    },
    accounts: {
        method: "keystore",
        path: ""
    }
}


let blockanalyzer = new BlockAnalyzer(constructorObj);

console.log('\n8""""8 8"""88 8  8"""8 8""""8 8"""88 8""""8 ');
console.log('8    " 8    8 8  8   8 8    8 8    8 8    " ');
console.log('8e     8    8 8e 8e  8 8e   8 8    8 8e     ');
console.log('88     8    8 88 88  8 88   8 8    8 88  ee ');
console.log('88   e 8    8 88 88  8 88   8 8    8 88   8 ');
console.log('88eee8 8eeee8 88 88  8 88eee8 8eeee8 88eee8 \n');
console.log('Description: Ethereum wallet monitoring with notification system');
console.log('@dev: Cristian Chirivì - ZeroDivisonSystems\n\n');
                                  


blockanalyzer.listen()
.on('newdeposit', (deposits) => {

    if (deposits.length == 0) {
        return; 
    }

    console.log(deposits);

})
.on('error', console.log);