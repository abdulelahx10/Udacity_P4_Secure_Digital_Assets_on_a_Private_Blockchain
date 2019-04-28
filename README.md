# Project #4. Build a Private Blockchain Notary Service

This is Project 4 for UDacity BlockChain nanodegree, Blockchain to build a Star Registry Service that allows users to claim ownership of their favorite star in the night sky.

## Built With

* [hapi.js](https://hapijs.com/) - The Node.js web framework used
* [level](https://github.com/Level/level) - Dependency for simple storage
* [crypto-js](https://github.com/brix/crypto-js) - Dependency for hashing
* [joi](https://github.com/hapijs/joi) - Dependency for Object schema validation

## Endpoints
1- **POST**: validate request
```
http://localhost:8000/requestValidation
```
```
{ "address":"19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL" }
```
2- **POST**: validates message signature
```
http://localhost:8000/message-signature/validate
```
```
{
"address":"19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL",
 "signature":"H8K4+1MvyJo9tcr2YN2KejwvX1oqneyCH+fsUL1z1WBdWmswB9bijeFfOfMqK68kQ5RO6ZxhomoXQG3fkLaBl+Q="
}
```
3- **POST**: add star block
```
http://localhost:8000/block
```
```
{
    "address": "19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL",
    "star": {
                "dec": "68° 52' 56.9",
                "ra": "16h 29m 1.0s",
                "story": "Found star using https://www.google.com/sky/"
            }
}
```
4- **GET**: Get Star block by hash
```
http://localhost:8000/stars/hash:[HASH]
```
5- **GET**: Get Star block by wallet address
```
http://localhost:8000/stars/address:[ADDRESS]
```
6- **GET**: Get Star block by height
```
http://localhost:8000/block/[HEIGHT]
```

## Setup project.

To setup the project do the following:
1. Clone/Download then naviagte to the repository to your local computer.
2. Open the terminal and install the packages: `npm install`.
3. Run your application `npm start`
4. Test the Endpoints with Curl or Postman.