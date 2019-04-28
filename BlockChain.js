/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/

const SHA256 = require('crypto-js/sha256');
const hex2ascii = require('hex2ascii');
const LevelSandbox = require('./LevelSandbox.js');
const Block = require('./Block.js');

class Blockchain {

    constructor() {
        this.db = new LevelSandbox.LevelSandbox();
        this.generateGenesisBlock();
    }

    // Helper method to create a Genesis Block (always with height= 0)
    // You have to options, because the method will always execute when you create your blockchain
    // you will need to set this up statically or instead you can verify if the height !== 0 then you
    // will not create the genesis block
    generateGenesisBlock() {
        let self = this;
        let block = new Block.Block("First Block in the chain - Genesis block");
        self.getBlockHeight().then((count) => {
            if (count == 0) {
                block.height = count;
                block.time = new Date().getTime().toString().slice(0, -3);
                block.hash = SHA256(JSON.stringify(block)).toString();
                self.db.addLevelDBData(block.height, JSON.stringify(block).toString()).then((result) => {
                    console.log(`Genesis block created:\n ${result}`);
                }).catch((err) => {
                    console.log(err);
                });
            }
        }).catch((err) => {
            console.log(err);
        });
    }

    // Get block height, it is a helper method that return the height of the blockchain
    getBlockHeight() {
        return this.db.getBlocksCount();
    }

    // Add new block
    addBlock(block) {
        let self = this;
        return new Promise(function (resolve, reject) {
            self.getBlockHeight().then((count) => {
                block.height = count;
                block.time = new Date().getTime().toString().slice(0, -3);
                self.getBlock(block.height - 1).then((previousBlock) => {
                    block.previousBlockHash = previousBlock.hash;
                    block.hash = SHA256(JSON.stringify(block)).toString();
                    self.db.addLevelDBData(block.height, JSON.stringify(block).toString()).then((result) => {
                        resolve(result);
                    }).catch((err) => {
                        reject(err);
                    });
                }).catch((err) => {
                    reject(err);
                });
            }).catch((err) => {
                reject(err);
            });
        });

    }

    // Get Block By Height
    async getBlockByHeight(height) {
        let block = await this.db.getLevelDBData(height);
        if (typeof(block) !== "undefined") {
            if (block.height !== 0) {
                block.body.star.storyDecoded = hex2ascii(block.body.star.story);
            }
            return block;
        } 
        return "ERROR: Block does not exist!"
    }

    // Get Block By Hash
    async getBlockByHash(hash) {
        let block = await this.db.getBlocksByHash(hash);
        if (typeof(block) !== "undefined") {
            if (block.height !== 0) {
                block.body.star.storyDecoded = hex2ascii(block.body.star.story);
            }
            return block;
        } 
        return "ERROR: Block does not exist!"
    }

    async getBlocksByAddress(address){
        let blocks = await this.db.getBlocksByAddress(address);
        if (blocks.length>0) {
            blocks.forEach(block => {
                block.body.star.storyDecoded = hex2ascii(block.body.star.story);
            });
            return blocks;
        }
        return "ERROR: No blocks exist with the given address!"
    }

    // Validate if Block is being tampered by Block Height
    validateBlock(height) {
        let self = this;
        return new Promise(function (resolve, reject) {
            self.getBlock(height).then((block) => {
                let hash = block.hash;
                block.hash = "";
                let generateHash = SHA256(JSON.stringify(block)).toString();
                if (hash === generateHash) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            }).catch((err) => {
                reject(err);
            });
        });
    }

    // Validate Blockchain
    // this function will return a promise with value of the invales blockes promises
    async validateChain() {
        let self = this;
        let invalidPromises = []; // an array of invaled blocks promises
        let previousBlockHash = "";
        await self.getBlockHeight().then(async (length) => {
            for (let index = 0; index < length; index++) {
                await self.getBlock(index).then((block) => {
                    self.validateBlock(index).then((value) => {
                        if (!value && block.hash !== previousBlockHash) { // Check if this block is vaild and the "hash" of the block equal the "previousBlockHash" of the previous block (validate block and validate link between them)
                            invalidPromises.push(Promise.resolve(`invalid block #: ${index}`));
                        }
                        previousBlockHash = block.hash;
                    }).catch((err) => {
                        console.log(err);
                    });
                }).catch((err) => {
                    console.log(err);
                });
            }
        }).catch((err) => {
            console.log(err);
        });

        return Promise.all(invalidPromises);
    }

    // Utility Method to Tamper a Block for Test Validation
    // This method is for testing purpose
    _modifyBlock(height, block) {
        let self = this;
        return new Promise((resolve, reject) => {
            self.db.addLevelDBData(height, JSON.stringify(block).toString()).then((blockModified) => {
                resolve(blockModified);
            }).catch((err) => {
                console.log(err);
                reject(err);
            });
        });
    }

}

module.exports.Blockchain = Blockchain;