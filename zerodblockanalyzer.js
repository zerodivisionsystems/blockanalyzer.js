const request = require('request');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

class ZerodBlockAnalyzer {
    constructor(constructorObj) {
        // API connection parameters
        this.mainserver_prot = constructorObj.api.protocol;
        this.mainserver_addr = constructorObj.api.address;
        this.mainserver_port = constructorObj.api.port;
        this.mainserver_authtoken = null;
        this.mainserver_username = constructorObj.api.username;
        this.mainserver_password = constructorObj.api.password;

        // MongoDB connection parameters
        this.dbo = null;
        this.db_url = constructorObj.database.db_url;
        this.db_name = constructorObj.database.db_name;
        this.db_collection = constructorObj.database.db_collection;
        this.db_pending = constructorObj.database.db_pending;

        // Crypto parameters
        this.coinbase = constructorObj.crypto.coinbase;
        this.currency = constructorObj.crypto.name;
    }


    mongoDBConnection() {
        return new Promise((resolve, reject) => {
            MongoClient.connect(this.db_url, {
                useNewUrlParser: true
            }, (err, db) => {

                if (err) {
                    reject("Error during mongoclient connection: " + err);
                    return
                }
                assert.equal(null, err);

                this.dbo = db.db(this.db_name);

                resolve(true);
            });
        });
    }


    secondsFromEpoch() {
        var d = new Date()
        var ms = d.getTime()
        var s = Math.floor(ms / 1000);
        return s;
    }


    getBlockObj(blocknumber, getBlockCallback) {
        return new Promise((resolve, reject) => {
            getBlockCallback(blocknumber)
                .then((blockObj) => {
                    resolve(blockObj);
                })
                .catch((error) => {
                    reject("Error during getBlockObj, check parameters! -> " + error);
                })
        });
    }


    getTxsFromBlockObj(txsObj, getTxsObj) {
        return new Promise((resolve, reject) => {

            let promises = [];
            for (let tx in txsObj) {
                promises.push(getTxsObj(txsObj[tx]));
            }

            Promise.all(promises)
                .then((txsObj) => {

                    let finalObj = [];

                    for (let tx in txsObj) {
                        if (!JSON.stringify(txsObj[tx][0]).includes("Invalid or non-wallet transaction id")) {
                            finalObj.push(txsObj[tx]);
                        }
                    }

                    resolve(finalObj);
                });

        });
    }


    addDepositInPending(depositsObj) {
        return new Promise((resolve, reject) => {

            for(let element in depositsObj){

                let depositObj = depositsObj[element];
                this.dbo.collection(this.db_pending).findOne({ [depositObj.txid]: depositObj }, (err, res) => {
                    if (err) { reject({ "msg": ["Error during the append of new withdraw into pendingWithdraw: " + err], "type": "error" }); return }
                    if(null) { resolve("ok"); return}

                    this.dbo.collection(this.db_pending).insertOne({ [depositObj.txid]: depositObj }, (err) => {
                        if (err) { reject({ "msg": ["Error during the append of new withdraw into pendingWithdraw: " + err], "type": "error" }); return }
                        resolve("ok");
                    });
                    
                });
            }

        });
    }


    discoverDeposit(txsObj) {
        return new Promise((resolve, reject) => {

            let depositTxs = [];
            for (let txObj in txsObj) {

                for (let detail in txsObj[txObj]["details"]) {

                    if (txsObj[txObj]["details"][detail]["category"] == "receive") {
                        let depositObj = {
                            amount: txsObj[txObj]["details"][detail]["amount"],
                            currency: this.currency,
                            timestamp: txsObj[txObj]["time"],
                            txid: txsObj[txObj].txid,
                            address_dest: txsObj[txObj]["details"][detail]["address"],
                            totalGasUsed: "",
                            trxObj: txsObj[txObj]
                        }

                        depositTxs.push(depositObj);
                    }

                }

            }

            resolve(depositTxs);

        });
    }

}


module.exports = ZerodBlockAnalyzer;