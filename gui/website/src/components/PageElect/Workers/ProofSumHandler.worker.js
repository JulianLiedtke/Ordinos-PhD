import CheckboxZKP from "src/components/ZKP/CheckboxZKP";
import help from "src/components/HelpFunctions";
import random from 'crypto-random-bigint';

var bigInt = require("big-integer");

self.addEventListener("message", ({ data }) => {
    var data = JSON.parse(data);
    var secretRandomNumbers = []; //zero knowledge proofs

    var bits = 2048;
    var publicKey = data.paillier.publicKey;
    var publicKeySquared = bigInt(publicKey).pow(2);
    var cipherSum = bigInt(1);

    //multiply user choices (sum them up)
    data.bullet.choices.forEach(choice => {
        cipherSum = cipherSum.multiply(choice).mod(publicKeySquared);
    });

    //multiply trash values (sum them up)
    data.bullet.trashValues.ciphers.forEach(choice => {
        cipherSum = cipherSum.multiply(choice).mod(publicKeySquared);
    });
    //now cipherSum is the encrypted sum of all choices
    //it should be equal to maxVotes (because of the trash values)

    var randomNonceSum = bigInt(1);
    data.nonces.bullet.paillier.forEach(nonce => {
        randomNonceSum = randomNonceSum.multiply(nonce).mod(publicKeySquared);
    });

    data.nonces.trashValues.paillier.forEach(nonce => {
        randomNonceSum = randomNonceSum.multiply(nonce).mod(publicKeySquared);
    });

    secretRandomNumbers = [help.getRandomNumber(data.paillier.publicKey), help.getRandomNumber(data.paillier.publicKey), bigInt(random(bits)).toString()]; //r1, z, e
    var proof = CheckboxZKP.generateProof(-1, data.maxVotes, cipherSum, publicKey, randomNonceSum, secretRandomNumbers, data.voterSecret);

    self.postMessage({done: true, proof: proof, secretRandomNumbers: secretRandomNumbers}); // Post 'done' update with payload
});