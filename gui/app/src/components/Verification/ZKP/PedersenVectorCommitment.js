import help from "src/components/HelpFunctions";
import random from 'crypto-random-bigint';
var bigInt = require("big-integer");

export class PedersenVectorCommitment {
    /**
     * Initilazies a PedersenVectorCommitment instance
     * @param {String} p prime p with p = 2q + 1
     * @param {String} q prime q with p = 2q + 1
     * @param {Array.<String>} g generators of cyclic group with order q
     * @param {String} h h
     */
    constructor(p, q, g, h) {
        this.p = bigInt(p);
        this.q = bigInt(q);
        var temp = new Array(g.length);
        for(var i = 0; i < g.length; i++) {
            temp[i] = bigInt(g[i]);
        }
        this.g = temp;
        this.h = bigInt(h);
    }

    /**
     * computes the commitment of a vector
     * @param {Array.<bigInt>} vector values for which the commitment is computet
     * @param {bigInt} r random number from Z_q used in the commitment
     * @returns {bigInt} commitment
     */
    generateCommitment(vector, r) {
        if(vector.length != this.g.length) {
            throw new Error("Size of vector does not match");
        }

        //TODO: make sure mod p ist right
        var c = this.h.modPow(r, this.p);
        for(var i = 0; i < this.g.length; i++) {
            if(bigInt(vector[i]).isNegative()) {
                var inverse = this.g[i].modInv(this.p);
                c = c.multiply(inverse.modPow(bigInt(-1).multiply(vector[i]), this.p));
            } else {
                c = c.multiply(this.g[i].modPow(vector[i], this.p));
            }
        }
        c = c.mod(this.p); //TODO: make sure mod p ist right, also if it is use mod p in all operations
    
        return c;
    }

    /**
     * gets a random elment from Z_q
     * @returns random element from Z_q
     */
    getRandomZq(){
        var bits = this.q.bitLength();
        while(true){
            var r = bigInt(random(help.getRandomInt(2, bits)));
            if(r.compare(this.q) == -1) return r;
        }
    }

    /**
     * gets the setup values of the commitment scheme
     * @returns setup values of the commitment scheme //TODO: return type
     */
    getSetupValues() {
        var p = this.p;
        var q = this.q;
        var g = this.g;
        var h = this.h;
        return  {p, q, g, h};
    }

    /**
     * gets prime p
     * @returns {bigInt} prime p with p = 2q + 1
     */
    getP() {
        return this.p;
    }

    /**
     * gets prime q
     * @returns {bigInt} prime q with p = 2q + 1
     */
    getQ() {
        return this.q;
    }

    /**
     * gets the generators used in the commitment scheme
     * @returns {Array.<bigInt>} generators
     */
    getG() {
        return this.g;
    }

    /**
     * gets h
     * @returns {bigInt} h
     */
    getH() {
        return this.h;
    }
}