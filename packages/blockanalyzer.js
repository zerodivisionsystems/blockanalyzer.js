
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
            return false

        } else {

            // start web3 filters, calls, etc
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
            if (this.constructorObj.accounts.method == "keystore") {
                //TODO: Check argument passed
                this.addresses = this.loadAccountsFromKeystore(this.constructorObj.accounts.path);
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


    loadAccountsFromKeystore() {
        return new Promise((resolve, reject) => {
            //TODO: read all folder contents
            let folder = fs.readdirSync();
        });
    }


    loadAccountsFromFile() {
        return fs.readFileSync(this.constructorObj.accounts.path);
    }


    sleep(time) {
        var stop = new Date().getTime();
        while (new Date().getTime() < stop + time) {
            ;
        }
        return 'ok';
    }


    newBlockScan() {

        return new Promise((resolve, reject) => {

            this.sleep(this.timeout);

            this.web3.eth.getBlock(this.currentBlock).then(blockobj => {

                // Check if new block is generated and fully
                if (blockobj == null) {
                    this.newBlockScan();
                }

                // Checking sync status
                if (blockobj.number == 0) {
                    reject('not synced');
                }

                this.currentBlock = blockobj.number;


                resolve(blockobj);

            });
        });

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

                for (let txobj in alltxobj) {


                    for (let address in this.addresses) {

                        let walletaddress = this.addresses[address];

                        if (walletaddress == alltxobj[txobj]['to']) {

                            deposits.push(alltxobj[txobj]);

                        }

                    }

                }

                this.currentBlock += 1;
                resolve(deposits);

            });

        });
    }


    listen() {

        this.newBlockScan().then((blockobj) => {

            this.accountLoader().then(() => {

                this.discoverDeposit(blockobj).then((depositsobj) => {
                    this.generalEvent.eventEmitter.emit('newdeposit', depositsobj);
                    this.listen();
                });

            });

        });

        return this.generalEvent.eventEmitter;

    }




}


module.exports = BlockAnalyzer