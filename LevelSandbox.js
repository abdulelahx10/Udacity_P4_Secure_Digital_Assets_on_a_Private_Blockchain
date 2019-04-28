/* ===== Persist data with LevelDB ==================
|  Learn more: level: https://github.com/Level/level |
/===================================================*/

const level = require('level');
const chainDB = './chaindata';

class LevelSandbox {

    constructor() {
        this.db = level(chainDB);
    }

    // Get data from levelDB with key (Promise)
    getLevelDBData(key) {
        let self = this;
        return new Promise(function (resolve, reject) {
            self.db.get(key, (err, value) => {
                if (err) {
                    if (err.type == 'NotFoundError') {
                        console.log('No block found', err);
                        resolve(undefined);
                    } else {
                        console.log('Block ' + key + ' get failed', err);
                        reject(err);
                    }
                } else {
                    resolve(JSON.parse(value));
                }
            });
        });
    }

    // Add data to levelDB with key and value (Promise)
    addLevelDBData(key, value) {
        let self = this;
        return new Promise(function (resolve, reject) {
            self.db.put(key, value, function (err) {
                if (err) {
                    console.log('Block ' + key + ' submission failed', err);
                    reject(err);
                }
                resolve(value);
            });
        });
    }

    // Method that return the height
    getBlocksCount() {
        let self = this;
        return new Promise(function (resolve, reject) {
            let i = 0;
            self.db.createReadStream()
                .on('data', function (data) {
                    // Count each object inserted
                    i++;
                })
                .on('error', function (err) {
                    // reject with error
                    console.log('Unable to read data stream!', err);
                    reject(err);
                })
                .on('close', function () {
                    //console.log('Block #' + i);
                    resolve(i);
                });
        });
    }

    getBlocksByHash(hash) {
        let self = this;
        return new Promise(function (resolve, reject) {
            self.db.createReadStream()
                .on('data', function (data) {
                    var block = JSON.parse(data.value);
                    if (block.hash === hash) {
                        resolve(block);
                    }
                })
                .on('error', function (err) {
                    // reject with error
                    console.log('Unable to read data stream!', err);
                    reject(err);
                })
                .on('close', function () {
                    resolve(undefined);
                });
        });
    }

    getBlocksByAddress(address) {
        let self = this;
        let blocks = [];
        return new Promise(function (resolve, reject) {
            self.db.createReadStream()
                .on('data', function (data) {
                    var block = JSON.parse(data.value);
                    if (block.height !== 0 && block.body.address === address) {
                        blocks.push(block);
                    }
                })
                .on('error', function (err) {
                    // reject with error
                    console.log('Unable to read data stream!', err);
                    reject(err);
                })
                .on('close', function () {
                    resolve(blocks);
                });
        });
    }


}

module.exports.LevelSandbox = LevelSandbox;