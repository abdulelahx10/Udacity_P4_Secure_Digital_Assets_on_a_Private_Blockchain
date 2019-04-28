const Joi = require('joi');
const Block = require('./Block.js');
const BlockChain = require('./Blockchain.js');

/**
 * Controller Definition to encapsulate routes to work with blocks
 */
class BlockController {

    /**
     * Constructor to create a new BlockController, you need to initialize here all your endpoints
     * @param {*} server 
     */
    constructor(server) {
        this.server = server;
        this.myBlockChain = new BlockChain.Blockchain();
        this.getBlockByIndex();
        this.getBlockByHash();
        this.getBlocksByAddress();
    }

    /**
     * Implement a GET Endpoint to retrieve a block by index, url: "/block/:index"
     */
    getBlockByIndex() {
        this.server.route({
            method: 'GET',
            path: '/block/{height}',
            handler:  (request, h) => {
                return this.myBlockChain.getBlockByHeight(request.params.height);
            }
        });
    }

    getBlockByHash() {
        this.server.route({
            method: 'GET',
            path: '/stars/hash/{hash}',
            handler:  (request, h) => {
                return this.myBlockChain.getBlockByHash(request.params.hash);
            }
        });
    }

    getBlocksByAddress() {
        this.server.route({
            method: 'GET',
            path: '/stars/address/{address}',
            handler:  (request, h) => {
                return this.myBlockChain.getBlocksByAddress(request.params.address);
            }
        });
    }


}

/**
 * Exporting the BlockController class
 * @param {*} server 
 */
module.exports = (server) => {
    return new BlockController(server);
}