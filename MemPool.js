const bitcoinMessage = require('bitcoinjs-message');
const BlockChain = require('./Blockchain.js');
const TIME_REQUEST_WINDOW_TIME = 5*60*1000; // 5 minutes
const TIME_REQUEST_VALID_WINDOW_TIME = 30*60*1000; // 30 minutes

class MemPool {

    constructor() {
        this.mempool = {};
        this.mempoolValid = {};
        this.timeoutRequests = {};
        this.timeoutRequestsValid = {};
    }

    addRequestValidation(address){
        let self = this;
        if (typeof(this.mempoolValid[address]) !== "undefined") {
            return "ERROR: Address is already valid in mempool"; // maybe return the object instead?
        }
        else if(typeof(self.mempool[address]) !== "undefined"){
            let timeElapse = (new Date().getTime().toString().slice(0,-3)) - self.mempool[address].requestTimeStamp;
            let timeLeft = (TIME_REQUEST_WINDOW_TIME/1000) - timeElapse;
            self.mempool[address].validationWindow = timeLeft;
            return self.mempool[address];
        }
        else{
            let timeStamp = new Date().getTime().toString().slice(0,-3);
            let req = {
                walletAddress: address,
                requestTimeStamp: timeStamp,
                message: `${address}:${timeStamp}:starRegistry`,
                validationWindow: TIME_REQUEST_WINDOW_TIME/1000
            };
            self.mempool[address] = req;
            self.timeoutRequests[address] = setTimeout(function(){ delete self.mempool[address] }, TIME_REQUEST_WINDOW_TIME );
            return req;
        }
    }

    validateRequestByWallet(payload){
        let self = this;
        if (typeof(this.mempoolValid[payload.address]) !== "undefined") {
            return "ERROR: Address is already valid in mempool"; // maybe return the object instead?
        }
        else if(typeof(self.mempool[payload.address]) !== "undefined"){ // if address is in the mempool that mean time window didn't expired becuase if it did then it will get removed automatically
            let isValid = bitcoinMessage.verify(self.mempool[payload.address].message, payload.address, payload.signature);
            if (isValid) {
                let result = {
                    registerStar: true,
                    status: {
                        address: payload.address,
                        requestTimeStamp: self.mempool[payload.address].requestTimeStamp,
                        message: self.mempool[payload.address].message,
                        validationWindow: self.mempool[payload.address].validationWindow,
                        messageSignature: isValid
                    }
                }
                clearTimeout(self.timeoutRequests[payload.address]);
                delete self.mempool[payload.address];
                self.mempoolValid[payload.address] = result;
                self.timeoutRequestsValid[payload.address] = setTimeout(function(){ delete self.mempoolValid[payload.address] }, TIME_REQUEST_VALID_WINDOW_TIME );
                return result;
            }
            return "ERROR: message Signature is invalid"
        }
        else{
            return "ERROR: Either there's no request validation for this address or request has been expired";
        }
    }

    async addBlock(payload){
        let self = this;
        if (typeof(this.mempoolValid[payload.address]) !== "undefined") {
            let block = new Block.Block(payload);
            block.body.star.story = Buffer.from(payload.star.story).toString('hex');
            let blockProm = await BlockChain.addBlock(block);
            clearTimeout(self.timeoutRequestsValid[payload.address]);
            delete self.mempoolValid[payload.address];
            return blockProm;
        }
        return "ERROR: Address is not valid in the mempool";
    }
}

module.exports.MemPool = MemPool;