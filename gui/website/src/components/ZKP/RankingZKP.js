import help from "src/components/HelpFunctions";
import Paillier from "src/components/Paillier";
import CryptoJS from "crypto-js";
import random from 'crypto-random-bigint';
import { PedersenVectorCommitment } from "./PedersenVectorCommitment";
var bigInt = require("big-integer");

/**
 * Generates a ZKP to prove that the votes are a permutation of the point distrubution
 * This ZKP only works if all candidates have to be placed on a different rank.
 * It wont work if it is possible to place multiple candidates on the same rank
 * Implements Part 1 from Algorithm 4.3 from https://elib.uni-stuttgart.de/bitstream/11682/11637/3/Bachelorarbeit.pdf
 * @param {string} cipher cipher of the votes with the plaintext pi(i)*M^i
 * @param {string} paillierRandomNumber random number used the encrypt the plaintext
 * @param {Array.<int>} votes amount of votes each candidate received. votes[i] holds the amount of votes that candidate i received
 * @param {int} numberOfCandidates amount of candidates
 * @param {int} maxVotes maximum amount of votes a candidate can receive
 * @param {string} voterSecret secret of the voter
 * @param {string} publicKey paillier public key
 * @param {PedersenVectorCommitment} commitment vector commitment for vectors of the size numberOfCandidates
 * @param {PedersenVectorCommitment} commitmentPermutationArgument vector commitment for vectors of the size numberOfCandidates - 1
 * 
 * @returns {{proof: JSON, randomNumbers: JSON}}
 *          proof containes all values computed for the ZKP. 
 *          randomNumbers contains all random Numbers used to compute the ZKP. 
 *          The random numbers should NOT be published. They are only for verification of the correctness of the proof in the app
 */
function generateProof(cipher, paillierRandomNumber, votes, numberOfCandidates, maxVotes, voterSecret, publicKey, commitment, commitmentPermutationArgument) {
    //conversions to bigInt
    publicKey = bigInt(publicKey);
    maxVotes = bigInt(maxVotes);
    paillierRandomNumber = bigInt(paillierRandomNumber);
    for(var i = 0; i < votes.length; i++) {
        votes[i] = bigInt(votes[i]);
    }

    //set bit length
    var l_e = 512 //bit size of output from the hash function (we use sha-512)
    var l_s = 80; //TODO: l_s needs to be as large as possible without risking a modular wrap around. For now it is a fixed size
    var l_r = commitment.getQ().bitLength(); //max bit length of random numbers for the commitment scheme
    var l_R = publicKey.bitLength(); //max bit length of random numbers for paillier encryption

    //generate the random numbers needed for the proof
    var r = commitment.getRandomZq();
    var r_a = new Array(numberOfCandidates);
    for(var i = 0; i < numberOfCandidates; i++) {
        r_a[i] = bigInt(random(help.getRandomInt(1, 1 + l_e + l_s)));
    }
    var r_r = bigInt(random(help.getRandomInt(1, l_r + l_e + l_s))); //Why is the bit length so high? r_r has to be from Z_p for the pedersen commitment 
    var R_R = bigInt(random(help.getRandomInt(1, l_R + l_e + l_s))); //same here, R_R needs to be from Z*_n. Why is the bit length so high?

    //compute commitments
    var c = commitment.generateCommitment(votes, r);
    var c_r = commitment.generateCommitment(r_a, r_r);

    //compute permutation argument
    let {c_d, c_delta, c_a, fBlackbox, zBlackbox, f_deltaBlackbox, z_deltaBlackbox, r_d, r_delta, r_aPermutation, d, delta} = permutationArgument(c, r, votes, numberOfCandidates, voterSecret, commitment, commitmentPermutationArgument);

    //compute R_V and C_R
    var R_V = bigInt(0);
    for(var i = 0; i < numberOfCandidates; i++) {
        R_V = R_V.add(r_a[i].multiply(maxVotes.pow(i)));
    }
    var C_R =  Paillier.encrypt(publicKey, R_V.toString(), R_R.toString());

    //compute challange
    var aux = CryptoJS.SHA512(CryptoJS.enc.Hex.parse(voterSecret)).toString(CryptoJS.enc.Hex);

    var fBlackboxString = fBlackbox[0].toString();
    for(var i = 1; i < fBlackbox.length; i++){
        fBlackboxString = fBlackboxString + "&" + fBlackbox[i].toString();
    }
        
    var f_deltaBlackboxString = f_deltaBlackbox[0].toString();
    for(var i = 1; i < f_deltaBlackbox.length; i++) {
        f_deltaBlackboxString = f_deltaBlackboxString + "&" + f_deltaBlackbox[i].toString();
    }
    
    var permutationArgumentString = c_d.toString() + "§" + c_delta.toString() + "§" + c_a.toString() + "§" + fBlackboxString + "§" + zBlackbox.toString() + "§" + f_deltaBlackboxString + "§" + z_deltaBlackbox.toString();
    var e = bigInt(CryptoJS.SHA512(cipher + "|" + C_R.toString() + "|" + c.toString() + "|" + c_r.toString() + "|" + permutationArgumentString + "|" + aux).toString(CryptoJS.enc.Hex), 16);

    //hide values with blackbox
    //Important Note: RBlackbox has to be paillierRandomNumber^e * R_R mod n instead of e*paillierRandomNumber + R_R
    //This is wrong in the Bachelorarbeit. A check in the verify function would otherwiese not work
    var RBlackbox = paillierRandomNumber.modPow(e, publicKey).multiply(R_R).mod(publicKey);
    var aBlackbox = new Array(votes.length);
    for(var i = 0; i < aBlackbox.length; i++) {
        aBlackbox[i] = votes[i].multiply(e).add(r_a[i]);
    }
    var rBlackbox = e.multiply(r).add(r_r);

    //generate json objects to return
    var randomNumbers = {};
    randomNumbers.r = r.toString();
    randomNumbers.r_a = r_a.toString();
    randomNumbers.R_R = R_R.toString();
    randomNumbers.r_r = r_r.toString();
    randomNumbers.r_d = r_d.toString();
    randomNumbers.r_delta = r_delta.toString();
    randomNumbers.r_aPermutation = r_aPermutation.toString();
    randomNumbers.d = d.toString();
    randomNumbers.delta = delta.toString();

    var proof = {};
    proof.C_R = C_R.toString();
    proof.c = c.toString();
    proof.c_r = c_r.toString();
    proof.RBlackbox = RBlackbox.toString();
    proof.aBlackbox = aBlackbox.toString();
    proof.rBlackbox = rBlackbox.toString();
    proof.c_d = c_d.toString();
    proof.c_delta = c_delta.toString();
    proof.c_a = c_a.toString();
    proof.fBlackbox = fBlackbox.toString();
    proof.zBlackbox = zBlackbox.toString();
    proof.f_deltaBlackbox = f_deltaBlackbox.toString();
    proof.z_deltaBlackbox = z_deltaBlackbox.toString();
    return {proof, randomNumbers};
}

/**
 * computes the permuation argument that proves that the votes are a permutation of the point distrubution
 * Implements Part 1 from Algortihm 4.4 from https://elib.uni-stuttgart.de/bitstream/11682/11637/3/Bachelorarbeit.pdf
 * @param {bigInt} c commitment c (computet in generateProof())
 * @param {bigInt} r random value used to compute commitment c
 * @param {Array.<bigInt>} votes amount of votes each candidate received. votes[i] holds the amount of votes that candidate i received
 * @param {int} numberOfCandidates amount of candidates
 * @param {string} voterSecret secret of the voter
 * @param {PedersenVectorCommitment} commitment
 * @param {PedersenVectorCommitment} commitmentPermutationArgument vector commitment for vectors of the size numberOfCandidates - 1
 * 
 * @returns {{c_d: bigInt, c_delta: bigInt, c_a: big, fBlackbox: Array.<bigInt>, zBlackbox: bigInt, 
 *              f_deltaBlackbox: Array.<bigInt>, z_deltaBlackbox : bigInt, r_d: bigInt, r_delta: bigInt, 
 *              r_aPermutation: bigInt, d: Array.<bigInt>, delta: Array.<bigInt>}}
 *          permuation argument that proves that the votes are a permutation of the point distrubution and the random numbers used to compute the proof
 *          The random numbers should NOT be published. They are only for verification of the correctness of the proof in the app
 */
function permutationArgument(c, r, votes, numberOfCandidates, voterSecret, commitment, commitmentPermutationArgument) {
    //compute challange
    var aux = CryptoJS.SHA512(CryptoJS.enc.Hex.parse(voterSecret)).toString(CryptoJS.enc.Hex);
    var x = bigInt(CryptoJS.SHA512(c.toString() + "|" + numberOfCandidates.toString() + "|" + aux).toString(CryptoJS.enc.Hex), 16);

    //generate random numbers
    var r_d = commitmentPermutationArgument.getRandomZq();
    var r_delta = commitmentPermutationArgument.getRandomZq();
    var r_a = commitmentPermutationArgument.getRandomZq();
    var d = new Array(numberOfCandidates);
    for(var i = 0; i < numberOfCandidates; i++) {
        d[i] = commitmentPermutationArgument.getRandomZq();
    }
    var delta = new Array(numberOfCandidates);
    delta[0] = d[0];
    for(var i = 1; i < numberOfCandidates - 1; i++) {
        delta[i] = commitmentPermutationArgument.getRandomZq();
    }
    delta[numberOfCandidates - 1] = bigInt(0);

    //compute a
    var a = new Array(numberOfCandidates);
    for(var i = 0; i < numberOfCandidates; i++) {
        a[i] = bigInt(1);
        for(var j = 0; j <= i; j++) {
            a[i] = a[i].multiply(votes[j].subtract(x));
        }
    }

    //compute arrays used for the commitments
    var c_deltaArray = new Array(numberOfCandidates - 1);
    for(var i = 0; i < numberOfCandidates - 1; i++) {
        c_deltaArray[i] = bigInt(-1).multiply(delta[i]).multiply(d[i + 1]);
    }
    var c_aArray = new Array(numberOfCandidates - 1);
    for(var i = 0; i < numberOfCandidates - 1; i++) {
        c_aArray[i] = delta[i + 1].subtract(bigInt(votes[i + 1]).subtract(x).multiply(delta[i])).subtract(a[i].multiply(d[i + 1]));
    }

    //compute commitments
    //Note: in the bachelor thesis c_d is a commitment of a. This is wrong. It should be a commitment of d
    var c_d = commitment.generateCommitment(d, r_d);
    var c_delta = commitmentPermutationArgument.generateCommitment(c_deltaArray, r_delta);
    var c_a = commitmentPermutationArgument.generateCommitment(c_aArray, r_a);

    //compute second challange
    var e = bigInt(CryptoJS.SHA512(c_d.toString() + "|" + c_delta.toString() + "|" + c_a.toString()).toString(CryptoJS.enc.Hex), 16);

    //hide values with blackbox
    var fBlackbox = new Array(numberOfCandidates);
    for(var i = 0; i < numberOfCandidates; i++) {
        fBlackbox[i] = e.multiply(votes[i]).add(d[i]);
    }
    var zBlackbox = e.multiply(r).add(r_d);
    var f_deltaBlackbox = new Array(numberOfCandidates - 1);
    for(var i = 0; i < numberOfCandidates - 1; i++) {
        f_deltaBlackbox[i] = e.multiply(delta[i + 1].subtract(bigInt(votes[i + 1]).subtract(x).multiply(delta[i])).subtract(a[i].multiply(d[i + 1]))).subtract(delta[i].multiply(d[i + 1]));
    }
    var z_deltaBlackbox = e.multiply(r_a).add(r_delta);

    //renaming of r_a to avoid name collision in generateProof()
    var r_aPermutation = r_a;
    return {c_d, c_delta, c_a, fBlackbox, zBlackbox, f_deltaBlackbox, z_deltaBlackbox, r_d, r_delta, r_aPermutation, d, delta};
}

/**
 * Verifies that a ZKP is valid
 * Implements Part 2 from Algorithm 4.3 from https://elib.uni-stuttgart.de/bitstream/11682/11637/3/Bachelorarbeit.pdf
 * @param {int} maxVotes maximum amount of votes a candidate can receive
 * @param {string} publicKey paillier public key
 * @param {Array.<int>} pointsDistrubution point distrubution of the ranking ballot
 * @param {int} numberOfCandidates amount of candidates
 * @param {string} voterSecret secret of the voter
 * @param {PedersenVectorCommitment} commitment vector commitment for vectors of the size numberOfCandidates
 * @param {PedersenVectorCommitment} commitmentPermutationArgument vector commitment for vectors of the size numberOfCandidates - 1
 * @param {string} cipher cipher of the votes with the plaintext pi(i)*M^i
 * @param {JSON} proof JSON object that contains all values of the ZKP. These values can be computed with the generateProof() function
 * 
 * @returns {boolean} returns true if the zkp is valid, otherwise false 
 */
function verifyProof(maxVotes, publicKey, pointsDistrubution, numberOfCandidates, voterSecret, commitment, commitmentPermutationArgument, cipher, proof) {
    //get all needed values from the json object proof and convert them to bigInt
    var C_R = bigInt(proof.C_R);
    var c = bigInt(proof.c);
    var c_r = bigInt(proof.c_r);
    var RBlackbox = bigInt(proof.RBlackbox);
    var rBlackbox = bigInt(proof.rBlackbox);
    var c_d = bigInt(proof.c_d);
    var c_delta = bigInt(proof.c_delta);
    var c_a = bigInt(proof.c_a);
    var zBlackbox = bigInt(proof.zBlackbox);
    var z_deltaBlackbox = bigInt(proof.z_deltaBlackbox);
    var aBlackbox = proof.aBlackbox.split(",");
    var fBlackbox = proof.fBlackbox.split(",");
    var f_deltaBlackbox = proof.f_deltaBlackbox.split(",");
    for(var i = 0; i < aBlackbox.length; i++) {
        aBlackbox[i] = bigInt(aBlackbox[i]);
    }
    for(var i = 0; i < fBlackbox.length; i++) {
        fBlackbox[i] = bigInt(fBlackbox[i]);
    }
    for(var i = 0; i < f_deltaBlackbox.length; i++) {
        f_deltaBlackbox[i] = bigInt(f_deltaBlackbox[i]);
    }

    //conversions to bigInt
    maxVotes = bigInt(maxVotes);
    publicKey = bigInt(publicKey);
    cipher = bigInt(cipher);
    
    //fill up pointsDistrubution with 0 if there are fewer ranks than candidates
    for(var i = pointsDistrubution.length; i < numberOfCandidates; i++) {
        pointsDistrubution.push(0);
    }

    //compute challange
    var fBlackboxString = fBlackbox[0].toString();
    for(var i = 1; i < fBlackbox.length; i++){
        fBlackboxString = fBlackboxString + "&" + fBlackbox[i].toString();
    }
        
    var f_deltaBlackboxString = f_deltaBlackbox[0].toString();
    for(var i = 1; i < f_deltaBlackbox.length; i++) {
        f_deltaBlackboxString = f_deltaBlackboxString + "&" + f_deltaBlackbox[i].toString();
    }

    var aux = CryptoJS.SHA512(CryptoJS.enc.Hex.parse(voterSecret)).toString(CryptoJS.enc.Hex);
    var permutationArgumentString = c_d.toString() + "§" + c_delta.toString() + "§" + c_a.toString() + "§" + fBlackboxString + "§" + zBlackbox.toString() + "§" + f_deltaBlackboxString + "§" + z_deltaBlackbox.toString();
    var e = bigInt(CryptoJS.SHA512(cipher.toString() + "|" + C_R.toString() + "|" + c.toString() + "|" + c_r.toString() + "|" + permutationArgumentString + "|" + aux).toString(CryptoJS.enc.Hex), 16);
    //check if permutation argument is valid
    var shuffle = permutationVerification(c, fBlackbox, zBlackbox, f_deltaBlackbox, z_deltaBlackbox, c_d, c_delta, c_a, pointsDistrubution, numberOfCandidates, voterSecret, commitment, commitmentPermutationArgument);

    //compute VBlackbox
    var VBlackbox = bigInt(0);
    for(var i = 0; i < aBlackbox.length; i++) {
        VBlackbox = VBlackbox.add(aBlackbox[i].multiply(maxVotes.pow(i)));
    }

    //check if cipher^e * C_R mod publicKey**2 == E(VBlackbox, RBlackbox)
    if(cipher.modPow(e, bigInt(publicKey).pow(2)).multiply(C_R).mod(bigInt(publicKey).pow(2)).notEquals(bigInt(Paillier.encrypt(publicKey, VBlackbox.toString(), RBlackbox.toString())))) {
        return false;
    }

    //check if c^e*c_r mod p == com(aBlackbox, rBlackbox)
    var p = commitment.getP();
    if(c.modPow(e, p).multiply(c_r).mod(p).notEquals(commitment.generateCommitment(aBlackbox, rBlackbox))) {
        return false;
    }

    //check if permutation argument is valid
    if(!shuffle) {
        return false;
    }

    return true;
}

/**
 * Verifies that a Permutation Argument is valid
 * Implements Part 2 from Algorithm 4.4 from https://elib.uni-stuttgart.de/bitstream/11682/11637/3/Bachelorarbeit.pdf
 * @param {bigInt} c commitment
 * @param {Array.<bigInt>} fBlackbox 
 * @param {bigInt} zBlackbox blackbox value
 * @param {Array.<bigInt>} f_deltaBlackbox  
 * @param {bigInt} z_deltaBlackbox blackbox value
 * @param {bigInt} c_d commitment
 * @param {bigInt} c_delta commitment
 * @param {bigInt} c_a commitment
 * @param {Array.<int>} pointsDistrubution point distrubution of the ranking ballot
 * @param {int} numberOfCandidates amount of candidates
 * @param {string} voterSecret secret of the voter
 * @param {PedersenVectorCommitment} commitment vector commitment for vectors of the size numberOfCandidates
 * @param {PedersenVectorCommitment} commitmentPermutationArgument vector commitment for vectors of the size numberOfCandidates - 1
 * 
 * @returns {boolean} returns true if the Permutation Argument is valid, otherwise false 
 */
function permutationVerification(c, fBlackbox, zBlackbox, f_deltaBlackbox, z_deltaBlackbox, c_d, c_delta, c_a, pointsDistrubution, numberOfCandidates, voterSecret, commitment, commitmentPermutationArgument) {
    //compute challanges
    var aux = CryptoJS.SHA512(CryptoJS.enc.Hex.parse(voterSecret)).toString(CryptoJS.enc.Hex);
    var x = bigInt(CryptoJS.SHA512(c.toString() + "|" + numberOfCandidates.toString() + "|" + aux).toString(CryptoJS.enc.Hex), 16);
    var e = bigInt(CryptoJS.SHA512(c_d.toString() + "|" + c_delta.toString() + "|" + c_a.toString()).toString(CryptoJS.enc.Hex), 16);

    //check if c^e*c_d mod p == com(fBlackbox, zBlackbox)
    var p = commitment.getP();
    if(c.modPow(e, p).multiply(c_d).mod(p).notEquals(commitment.generateCommitment(fBlackbox, zBlackbox))) {
        return false;
    }

    //check if c_a^e*c_delta mod p == com(f_deltaBlackbox, z_deltaBlackbox)
    var p = commitmentPermutationArgument.getP();
    if(c_a.modPow(e, p).multiply(c_delta).mod(p).notEquals(commitmentPermutationArgument.generateCommitment(f_deltaBlackbox, z_deltaBlackbox))) {
        return false;
    }

    //compute F
    var F = new Array(numberOfCandidates);
    F[0] = bigInt(fBlackbox[0]).subtract(e.multiply(x));
    for(var i = 1; i < numberOfCandidates; i++) {
        F[i] = F[i-1].multiply(fBlackbox[i].subtract(e.multiply(x))).add(f_deltaBlackbox[i-1]).divide(e);
    }

    //compute product(m_i - x), i=1 to L
    var product = bigInt(1);
    for(var i = 0; i < numberOfCandidates; i++) {
        product = product.multiply(bigInt(pointsDistrubution[i]).subtract(x));
    }

    //check if F_L == e*(product(m_i - x), i=1 to L)
    if(F[numberOfCandidates - 1].notEquals(e.multiply(product))) {
        return false;
    }

    return true;
}

export default { generateProof, verifyProof };