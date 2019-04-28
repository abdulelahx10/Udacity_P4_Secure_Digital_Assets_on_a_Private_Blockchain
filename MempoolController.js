const Joi = require('joi');
const MemPool = require('./MemPool.js');

class MemPoolController{

    constructor(server) {
        this.server = server;
        this.myMemPool = new MemPool.MemPool();
        this.postRequestValidation();
        this.postValidateRequestByWallet();
        this.postNewBlock();
    }

    postRequestValidation(){
        this.server.route({
            method: 'POST',
            path: '/requestValidation',
            handler: (request, h) => {
                return this.myMemPool.addRequestValidation(request.payload.address);
            },
            options: {
                validate: {
                    payload: {
                        address: Joi.string().required()
                    }
                }
            }
        });
    }

    postValidateRequestByWallet(){
        this.server.route({
            method: 'POST',
            path: '/message-signature/validate',
            handler: (request, h) => {
                return this.myMemPool.validateRequestByWallet(request.payload);
            },
            options: {
                validate: {
                    payload: {
                        address: Joi.string().required(),
                        signature: Joi.string().required()
                    }
                }
            }
        });
    }

    postNewBlock() {
        this.server.route({
            method: 'POST',
            path: '/block',
            handler: (request, h) => {
                return this.myMemPool.addBlock(request.payload);
            },
            options: {
                validate: {
                    payload: {
                        address: Joi.string().required(),
                        star: {
                            dec: Joi.string().required(),
                            ra: Joi.string().required(),
                            story: Joi.string().required()
                        }
                    }
                }
            }
        });
    }
}

module.exports = (server) => {
    return new MemPoolController(server);
}