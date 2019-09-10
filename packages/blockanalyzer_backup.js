
/*
    POLICIY, GPL STUFF 
*/


/**
 * @file blockanalyzer.js
 * @author Cristian Chirivì aka Neb <c.chirivi@zerodivision.it || chircristiandev@gmail.com>
 * @date 2019
 */


'use strict'


const Web3 = require('Web3');
const fs = require('fs');
const Web3PromiEvent = require('web3-core-promievent');


class BlockAnalyzer {


    constructor(constructorObj) {
        this.constructorObj = constructorObj;
        //TODO: Controls about constructorObj

        //TODO: web3 provider setting parameters

        // HttpProvider, WebsocketProvider, IpcProvider
        this.web3 = new Web3();
        this.web3.setProvider(this.constructorObj.web3.url);

        //this.connectionChecking();

        // PromiEvent objects declaration
        this.generalEvent = Web3PromiEvent();
        this.promiEvent = Web3PromiEvent();
        this.currentBlock = constructorObj.web3.block;

        this.interval = null;
        this.timeout = this.constructorObj.web3.timeout
        this.addresses = null;
        this.counter = 0;

    }


    connectionChecking() {
        if (!this.web3.isConnected()) {

            // show some dialog to ask the user to start a node
            console.error("Not connected!");
            return false

        } else {

            // start web3 filters, calls, etc
            console.log("ok");
            return true

        }
    }


    // Load file section


    accountLoader() {
        //TODO: Improve account loader method...
        return new Promise((resolve, reject) => {

            if (this.constructorObj.accounts.method == "node") {
                //TODO: Check argument passed
                this.loadAccountsFromNode().then(resolve).catch(reject);
            }
            if (this.constructorObj.accounts.method == "file") {
                //TODO: Check argument passed
                this.addresses = this.loadAccountsFromFile();
                resolve();
            }
            if (this.constructorObj.accounts.method == "list") {
                //TODO: Check argument passed
                this.addresses = this.constructorObj.accounts.list;
                resolve("ok");
            }

        });
    }


    loadAccountsFromNode() {

        return new Promise((resolve, reject) => {

            this.web3.eth.getAccounts().then((accounts) => {

                this.addresses = accounts;
                resolve();

            }).catch((error) => { reject(error) })
        });

    }


    loadAccountsFromFile() {
        return fs.readFileSync(this.constructorObj.accounts.path);
    }


    recoverBlocks(lastBlock) {
        return new Promise((resolve, reject) => {

            let difference = lastBlock - this.currentBlock;
            console.log("This is the difference: " + difference);
            let promises = [];

            while (difference > 0) {
                promises.push(this.web3.eth.getBlock(lastBlock - difference));

                this.currentBlock = (lastBlock - difference);
                difference = difference - 1;
            }

            Promise.all(promises).then((blockslist) => {
                console.log("Now last block:  " + this.currentBlock);
                resolve(blockslist);
            });
        });
    }


    sleep(time) {
        var stop = new Date().getTime();
        while (new Date().getTime() < stop + time) {
            ;
        }
        return 'ok';
    }


    newBlockScan() {

        this.sleep(this.timeout);
        this.web3.eth.getBlock(this.currentBlock).then(blockobj => {

            // Check if new block is generated and fully
            if(blockobj == null){
                this.newBlockScan();
            }

            // Checking sync status
            if (blockobj.number == 0) {
                console.log("Not sync");
                this.promiEvent.eventEmitter.emit('error',
                    'you provider is not synced (blocknumber is equal to 0), use instead lastNodeBlockEvent() method');

            }

            this.currentBlock = blockobj.number;

            this.promiEvent.eventEmitter.emit('newblock', blockobj);
            this.promiEvent.resolve(blockobj);

        });

        return this.promiEvent.eventEmitter;

    }


    discoverDeposit(blockobj) {


        return new Promise((resolve, reject) => {

            let promises = [];

            for (let transaction in blockobj.transactions) {

                let transactionhash = blockobj.transactions[transaction];
                promises.push(this.web3.eth.getTransaction(transactionhash));

            }

            Promise.all(promises).then((alltxobj) => {

                let deposits = [];

                for(let txobj in alltxobj){


                    for (let address in this.addresses) {

                        let walletaddress = this.addresses[address];
    
                        if (walletaddress == alltxobj[txobj]['to']) {
    
                            console.log("Ok cool... new deposit");
                            deposits.push(alltxobj.txobj);
    
                        }
    
                    }

                }

                resolve(deposits);
        
            });

        });
    }


    listen() {

        this.newBlockScan()
            .on('newblock', blocksobj => {

                this.accountLoader().then(_ => {

                    this.discoverDeposit(blocksobj)
                        .then(depositsobj => {
                            console.log("Block number: " + this.currentBlock + " scanned");
                            this.currentBlock += 1;
                            this.generalEvent.eventEmitter.emit('newdeposit', depositsobj);
                            this.listen();
                        });

                }).catch((err) => { });

            })
            .on('error', error => {
                // TODO: handle not sync error with the usage of a new function lastNodeBlockEvent()
                this.generalEvent.eventEmitter.emit('error', error);
            })

        return this.generalEvent.eventEmitter;

    }

}


module.exports = BlockAnalyzer