import help from "src/components/HelpFunctions";
import random from 'crypto-random-bigint';
var bigInt = require("big-integer");

//TODO: Imporant: generation of the setup paramerts need to be done by a trusted third party or through MPC
//This Implementation is only for testing purposes

/**
 * generates the setup parameters for the pedersen vector commitment 
 * @param {bigInt} p prime p with p = 2q + 1
 * @param {bigInt} q prime q with p = 2q + 1
 * @param {int} size size of the vector commitment
 * @returns {{g: bigInt, h: bigInt}} g and h the setup parameters for the pedersen commitment
 */
function generateVectorCommitmentParameters(p, q, size) {
    var g = new Array(size);
    for(var i = 0; i < size; i++) {
        g[i] = getRandomGenerator(p, q);
    }
    var a = getRandomZq(q);
    var h = g[0].modPow(a, p);

    return {g, h};
}

/**
 * computes a generator of cyclic group with order q
 * @param {bigInt} p prime p with p = 2q + 1
 * @param {bigInt} q prime q with p = 2q + 1
 * @returns {bigInt} generator of cyclic group with order q
 */
function getRandomGenerator(p, q) {
    var bits = p.bitLength();
    while(true) {
        var g = bigInt(1);
        do {
            g = bigInt(random(help.getRandomInt(1, bits)));
        } while (g.compare(p) != -1) //0=equals, 1=h>(p), -1=h<(p)

        //g is a generator of cyclic group with order q, if h^q mod p == 1
        if(g.modPow(q, p).equals(bigInt(1))) { 
            return g;
        }
    }
}

/**
 * gets a random elment from Z_q
 * @param {bigInt} q prime q
 * @returns {bigInt} random element from Z_q
 */
function getRandomZq(q) {
    var bits = q.bitLength();
    while(true){
        var r = bigInt(random(help.getRandomInt(2, bits)));
        if(r.compare(q) == -1) return r; //0=equals, 1=h>(p), -1=h<(p)
    }
}

export default {generateVectorCommitmentParameters};