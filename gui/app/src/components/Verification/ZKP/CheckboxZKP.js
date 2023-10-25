var bigInt = require("big-integer");

import random from 'crypto-random-bigint';
import help from "src/components/HelpFunctions";
import CryptoJS from "crypto-js";

/**
 * Generates a ZKP that proves that one out of two plaintexts is encrypted by the cipher
 * Implements the 1-out-of-2 ns’th power protocol from https://www.brics.dk/RS/00/45/BRICS-RS-00-45.pdf
 *
 * @param {Int} firstPlaintext first plaintext
 * @param {Int} secondPlaintext second plaintext
 * @param {String} cipher cipher of the encrypted vote
 * @param {String} publicKey public key
 * @param {String} randomPaillierNumber random number that was used during encryption of the cipher
 * @param {Array.<String>} randomProofNumbers random numbers that are used in the proof
 * @param {int} bits bits of the public key
 * @param {String} voterSecret voter secret
 * 
 * @returns {Array.<String>} proof
 */
function generateProof(firstPlaintext, secondPlaintext, cipher, publicKey, randomPaillierNumber, randomProofNumbers, voterSecret) {  
    //conversions to bigInt
    publicKey = bigInt(publicKey);
    var publicKeySquared = bigInt(publicKey).pow(2);
    randomPaillierNumber = bigInt(randomPaillierNumber);
    cipher = bigInt(cipher);
    var bits = publicKey.bitLength();

    //compute u1 and u2. u1 and u2 are the input for the 1-out-of-2 n^s'th power protocol
    var gi1 = publicKey.add(1).modPow(firstPlaintext, publicKeySquared);
    var inverseGi1 = gi1.modInv(publicKeySquared);
    var u1 = cipher.multiply(inverseGi1).mod(publicKeySquared);

    var gi2 = publicKey.add(1).modPow(secondPlaintext, publicKeySquared);
    var inverseGi2 = gi2.modInv(publicKeySquared);
    var u2 = cipher.multiply(inverseGi2).mod(publicKeySquared);

    //if u1 is not equal to randomPaillierNumber^publicKey swap u1 and u2. 
    //This is done, because we need a v1, such that u1=E(0, v1)=v1^n^s mod n^(s+1)
    //v1 is equal to randomPaillierNumber, if firstPlaintext is equal to the decrypted cipher (originally plaintext)
    var swaped = false;
    if(u1.notEquals(randomPaillierNumber.modPow(publicKey, publicKeySquared))) {
        var temp = u1;
        u1 = u2;
        u2 = temp;
        swaped = true;
    }

    //P chooses r1 at random in Z^*_n
    //var r1 = help.getRandomNumber(publicKey);
    var r1 = bigInt(randomProofNumbers[0]);

    //P invokes M on input n, u2 to get a conversation a2, e2, z2
    var conversation = honestVerifierSimulator(publicKey, publicKeySquared, u2, randomProofNumbers, bits);
    var a2 = conversation[0];
    var e2 = conversation[1];
    var z2 = conversation[2];

    //P sends a1 = r1^n^s mod n^(s+1), a2 to V
    var a1 = r1.modPow(publicKey, publicKeySquared);

    //V chooses s, a random t bit number, and sends s to P. 
    //Since we want an interactive Protocol we compute s with a hash function.
    var hashedSecret = CryptoJS.SHA512(CryptoJS.enc.Hex.parse(voterSecret)).toString(CryptoJS.enc.Hex);
    var commitment = "";
    var publicParametes = "";
    if(swaped) {
        commitment = a2.toString() + "§" + a1.toString();
        publicParametes = u2.toString() + "$" + u1.toString() + "$" + publicKey.toString();
    } else {
        commitment = a1.toString() + "§" + a2.toString();
        publicParametes = u1.toString() + "$" + u2.toString() + "$" + publicKey.toString();
    }
    var s = bigInt(CryptoJS.SHA512(hashedSecret + "|" + publicParametes + "|" + commitment).toString(CryptoJS.enc.Hex), 16);

    //P computes e1 = s − e2 mod 2^t and z1 = r1*v1^e1 mod n. P then sends e1, z1, e2, z2 to V
    var e1 = s.subtract(e2).mod(bigInt(2).pow(Math.floor(bits / 2)));
    if(e1.isNegative()) { //it is possible for e1 to be negative, because of the way 'big-integer' handels the mod operation
        e1 = e1.add(bigInt(2).pow(Math.floor(bits / 2)));
    }
    var z1 = r1.multiply(randomPaillierNumber.modPow(e1, publicKey)).mod(publicKey);

    var proof = [a1.toString(), e1.toString(), z1.toString(), a2.toString(), e2.toString(), z2.toString()];

    //if we swapped u1 and u2 we also need to swap (a1,e1,z1) and (a2,e2,z2)
    if(swaped) {
        proof = [proof[3], proof[4], proof[5], proof[0], proof[1], proof[2]]
    }

    return proof;
}

/**
 * Generates a conversation used in the zkp
 * 
 * @param {bigInt} publicKey public key
 * @param {bigInt} publicKeySquared publicKey**2
 * @param {bigInt} u 
 * @param {Array.<string>} randomProofNumbers random numbers that are used in the proof
 * @param {int} bits bits of the public key
 * 
 * @returns {Array.<bigInt>} conversation
 */
function honestVerifierSimulator(publicKey, publicKeySquared, u, randomProofNumbers, bits) {
    //choose a random z from Z^*_n
    //var z = help.getRandomNumber(publicKey);
    var z = bigInt(randomProofNumbers[1]);

    //choose a random e, a k-bit number (k = bit length of publicKey)
    //var e = bigInt(random(bits));
    var e = bigInt(randomProofNumbers[2]);

    //compute a
    var a = z.modPow(publicKey, publicKeySquared).multiply(u.modPow(e.multiply(-1), publicKeySquared)).mod(publicKeySquared);

    return [a, e, z];
}

/**
 * Verifies that a zkp is correct and proves that one out of the two plaintext was encrypted
 * 
 * @param {int} firstPlaintext first plaintext
 * @param {int} secondPlaintext second plaintext
 * @param {string} cipher cipher of the encrypted vote
 * @param {string} publicKey public key
 * @param {int} bits bits of the public key
 * @param {Array.<string>} proof zkp generated by the generateProof() method
 * @param {string} voterSecret voter secret
 * @returns {boolean} returns true if the zkp is valid, otherwise false 
 */
function verifyProof(firstPlaintext, secondPlaintext, cipher, publicKey, bits, proof, voterSecret) {
    //conversion to bigInt
    cipher = bigInt(cipher);
    publicKey = bigInt(publicKey)
    var publicKeySquared = bigInt(publicKey).pow(2);
    var a1 = bigInt(proof[0]);
    var e1 = bigInt(proof[1]);
    var z1 = bigInt(proof[2]);
    var a2 = bigInt(proof[3]);
    var e2 = bigInt(proof[4]);
    var z2 = bigInt(proof[5]);

    //compute u1 and u2, since they are needed later
    var gi1 = publicKey.add(1).modPow(firstPlaintext, publicKeySquared);
    var inverseGi1 = gi1.modInv(publicKeySquared);
    var u1 = cipher.multiply(inverseGi1).mod(publicKeySquared);

    var gi2 = publicKey.add(1).modPow(secondPlaintext, publicKeySquared);
    var inverseGi2 = gi2.modInv(publicKeySquared);
    var u2 = cipher.multiply(inverseGi2).mod(publicKeySquared);

    //V checks that s = e1 + e2 mod 2^t
    var hashedSecret = CryptoJS.SHA512(CryptoJS.enc.Hex.parse(voterSecret)).toString(CryptoJS.enc.Hex);
    var commitment = a1.toString() + "§" + a2.toString();
    var publicParametes = u1.toString() + "$" + u2.toString() + "$" + publicKey.toString();
    var s = bigInt(CryptoJS.SHA512(hashedSecret + "|" + publicParametes + "|" + commitment).toString(CryptoJS.enc.Hex), 16);
    var sTest = e1.add(e2).mod(bigInt(2).pow(Math.floor(bits / 2)));
    if(s.notEquals(sTest)) {
        return false;
    }

    //V checks that E(0, z1) = a1*u1^e1 mod n^(s+1). In this case E(0, z1) = z1^n^s mod n^(s+1)
    var z1n = z1.modPow(publicKey, publicKeySquared);
    var z1nTest = a1.multiply(u1.modPow(e1, publicKeySquared)).mod(publicKeySquared);
    if(z1n.notEquals(z1nTest)) {
        return false;
    }

    //V checks that E(0, z2) = a2*u2^e2 mod n^(s+1)
    var z2n = z2.modPow(publicKey, publicKeySquared);
    var z2nTest = a2.multiply(u2.modPow(e2, publicKeySquared)).mod(publicKeySquared);
    if(z2n.notEquals(z2nTest)) {
        return false;
    }

    //V checks that u1, u2, a1, a2, z1, z2 are relatively prime to n
    var gcdU1 = help.greatestCommonDivisor(u1, publicKey);
    var gcdU2 = help.greatestCommonDivisor(u2, publicKey);
    var gcdA1 = help.greatestCommonDivisor(a1, publicKey);
    var gcdA2 = help.greatestCommonDivisor(a2, publicKey);
    var gcdZ1 = help.greatestCommonDivisor(z1, publicKey);
    var gcdZ2 = help.greatestCommonDivisor(z2, publicKey);

    if(gcdU1 != 1 || gcdU2 != 1 || gcdA1 != 1 || gcdA2 != 1 || gcdZ1 != 1 || gcdZ2 != 1) {
        return false;
    }

    return true;
}

export default { generateProof, verifyProof };