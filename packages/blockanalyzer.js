
/*
    POLICIY, GPL STUFF 
*/


/**
 * @file blockanalyzer.js
 * @author Cristian Chirivì <c.chirivi@zerodivision.it || chircristiandev@gmail.com>
 * @date 2019
 */


'use strict'


const Web3 = require("Web3");
const Web3PromiEvent = require('web3-core-promievent');


class BlockAnalyzer {





    constructor(constructorObj) {

        //TODO: Controls about constructorObj

        //TODO: web3 provider setting parameters

        // HttpProvider, WebsocketProvider, IpcProvider
        this.web3 = new Web3();
        this.web3.setProvider(constructorObj.web3.url);
        this.promiEvent = Web3PromiEvent();

    }


    discoverDeposit() {

        this.web3.eth.getBlockNumber()
            .then(blocknumber => {

                this.promiEvent.eventEmitter.emit('blocknumber', blocknumber);

                // Now we'll get the block from the previous got blocknumber
                this.web3.eth.getBlock(blocknumber)
                    .then(blockobj => {

                        this.promiEvent.eventEmitter.emit('blockobj', blockobj);

                        blockobj['transactions'].forEach(transactionhash => {

                            
                            this.web3.eth.getTransaction(transactionhash).then( txobj => {
                                this.promiEvent.eventEmitter.emit('transaction', txobj);
                            }).catch(err => console.log(err));

                        });



                    }).catch(err => console.log(err));


            }).catch(err => console.log(err));

        return this.promiEvent.eventEmitter;

    }

}


module.exports = BlockAnalyzer