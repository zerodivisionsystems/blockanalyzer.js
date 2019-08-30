
/*
    POLICIY, GPL STUFF 
*/


/**
 * @file blockanalyzer.js
 * @author Cristian Chirivì <c.chirivi@zerodivision.it || chircristiandev@gmail.com>
 * @date 2019
 */


'use strict'


const Web3 = require('Web3');
const Web3PromiEvent = require('web3-core-promievent');


class BlockAnalyzer {





    constructor(constructorObj) {

        //TODO: Controls about constructorObj

        //TODO: web3 provider setting parameters

        // HttpProvider, WebsocketProvider, IpcProvider
        this.web3 = new Web3();
        this.web3.setProvider(constructorObj.web3.url);
        this.generalEvent = Web3PromiEvent();
        this.promiEvent = Web3PromiEvent();
        this.addresses = null;

    }


    loadAccounts(){

        return new Promise((resolve, reject) => {

            this.web3.eth.getAccounts().then((accounts) => {

                this.addresses = accounts;
                resolve();

            }).catch((error) => { reject(error) })
        });
        
    }


    newBlockEvent(timeout){

        let blocknumber = 0;
        let interval = null;

        interval = setInterval( () => {
            this.web3.eth.getBlock("latest").then(blockobj => {
                

                if(blockobj.number == 0){
                    console.log("Not sync");
                    clearInterval(interval);
                    this.promiEvent.eventEmitter.emit('error',
                        'you provider is not synced (blocknumber is equal to 0), use instead lastNodeBlockEvent() method');

                }

                if(blockobj.number > blocknumber) {

                    console.log(blockobj);

                    blocknumber = blockobj.number;

                    this.promiEvent.eventEmitter.emit('newblock', blockobj);
                    this.promiEvent.resolve(blockobj);

                }
    
            })
        } , timeout);
        
        return this.promiEvent.eventEmitter;

    }


    discoverDeposit(transactionslist) {

        return new Promise((resolve, reject) => {

            transactionslist.forEach(transactionhash => {

                
                this.web3.eth.getTransaction(transactionhash).then( txobj => {


                    this.addresses.forEach(walletaddress => {
                        console.log(walletaddress);
                        if(walletaddress == txobj['to']){

                            resolve(txobj);

                        }
                    });

                }).catch(error => reject(error));

            });
    
        });

    }


    listen(){
        
        this.newBlockEvent(2000)
        .on('newblock', blockobj => {

            console.log(blockobj);

            this.loadAccounts( _ => {

                this.discoverDeposit(blockobj.transactions)
                .then( depositobj => {
                    this.generalEvent.eventEmitter.emit('newdeposit', depositobj);
                });

            });

        })
        .on('error', error => {
            // TODO: handle not sync error with the usage of a new function lastNodeBlockEvent()
            this.generalEvent.eventEmitter.emit('error', error);
        })

        return this.generalEvent.eventEmitter;

    }

}


module.exports = BlockAnalyzer