import random from 'crypto-random-bigint';
var bigInt = require("big-integer");

export class SafePrimes {
    /**
     * Generates 2 primes p, q with p = 2q + 1
     * The constructor will only generate new Primes on its first initialization.
     * After that the constructor will return an object with the same primes generatet the fist time.
     * @param {int} bits bit length of the prime p
     * @returns {SafePrimes} SafePrimes object
     */
    constructor(bits) {
        if(SafePrimes._instance) {
            return SafePrimes._instance;
        }
        SafePrimes._instance = this;

        //For testing purposes the class just returns fixed primes where p has bit length 1025
        this.p = bigInt("179769313486231590772930519078902473361797697894230657273430081157732675805500963132708477322407536021120113879871393357658789768814416622492847430639474124377767893424865485276302219601246094119453082952085005768838150682342462881473913110540827237163350510684586298239947245938479716304835356329624227998859");
        this.q = this.p.subtract(1).divide(2);
        /*while(true) {
            var p = bigInt(2).pow(bits - 1).add(bigInt(random(bits - 1)));
            if(p.isProbablePrime()) {
                var q = ((p.subtract(1)).divide(2));
                if(q.isProbablePrime()) {
                    this.p = p;
                    this.q = q;
                    break;
                }
            }
        }*/
    }

    /**
     * Returns prime p with p = 2q + 1
     * @returns {bigInt} p
     */
    getP() {
        return this.p;
    }

    /**
     * Returns prime q with p = 2q + 1
     * @returns {bigInt} q
     */
    getQ() {
        return this.q;
    }
}