var bigInt = require("big-integer");
var randomBigInt = require("random-bigint");
const crypto = require("crypto");

import help from "src/components/HelpFunctions";
import OneOutOf2 from "src/components/OneOutOf2";
import Paillier from "src/components/Paillier";

/**
 * Proof that a the sum of ciphers is in the intervall
 
 * @param {Int} lower //lower bound of the sum
 * @param {Int} upper //upper bound of the sum
 * @param {bigInt} n //public key
 * @param {Int} voterId 
 * @param {Array} randomNumberVotes //random numbers used to compute cipher
 * @param {bigInt} bits //legth for random numbers
 * @param {Array} choices
 * @param {Array} ciphers
 */
function proof_Range(lower, upper, n, choices, ciphers, randomNumberVotes, voterId, bits) {
    
    //compute actual sum
    var actualSum = 0
    choices.forEach(choice => {
        actualSum = actualSum + choice;
    });

    //sum is not in intervall
    if(actualSum < lower || actualSum  > upper){
        console.log("not in intervall")
    }
    
    var proofs = [] //all Trash proofs
    var dummyCiphers = [] // cipher of Trashvalues
    var randomNumbers = [] //randomNumbers from encryption

    //create Trash values (upper - lower)
    for (var i = 0; i < (upper - lower); i++){
        //need (upper - actual) 1's to reach upper
        if(i < (upper - actualSum)){
            var r = help.getRandomNumber(bits, n); // Get random number for Paillier
            randomNumbers.push(r.toString())

            var cipher = Paillier.encrypt(n, 1, r); // Encrypt
            var proof = OneOutOf2.proof_1OutOf2(0,1,n,cipher,r,voterId,bits)
            
            proofs.push(proof)
            dummyCiphers.push(cipher)
        }
        //0's for the rest
        else{ 
            var r = help.getRandomNumber(bits, n); // Get random number  for Paillier
            randomNumbers.push(r.toString())

            var cipher = Paillier.encrypt(n, 0, r); // Encrypt
            var proof = OneOutOf2.proof_1OutOf2(0,1,n,cipher,r,voterId,bits)
            
            proofs.push(proof)
            dummyCiphers.push(cipher)
        }
    }
    


    //n**2
    var n_squared = bigInt(n).pow(2);

    //Add votes (multiply cipher)
    var encryptedSum = bigInt(1)//encrypted sum of all values
    //vote vaulues
    ciphers.forEach(c => {
        encryptedSum = bigInt(encryptedSum).multiply(c).mod(n_squared);
    });
    //trash values
    dummyCiphers.forEach(dc => {
        encryptedSum = bigInt(encryptedSum).multiply(dc).mod(n_squared);
    });

    //Add randomNumbers from all values
    var sumRandomNumbers = bigInt(1)
    //real vote values
    randomNumberVotes.forEach(randomNumberVote => {
        sumRandomNumbers = bigInt(sumRandomNumbers).multiply(randomNumberVote).mod(n_squared);
    });
    //Trash random numbers
    randomNumbers.forEach(randomNumber => {
        sumRandomNumbers = bigInt(sumRandomNumbers).multiply(randomNumber).mod(n_squared);
    });

    //proof that sum == upper
    var expectedSumProof = OneOutOf2.proof_1OutOf2(upper, upper + 1,n,encryptedSum,sumRandomNumbers,voterId,bits)
    proofs.push(expectedSumProof)
    dummyCiphers.push(encryptedSum.toString())
    randomNumbers.push(sumRandomNumbers.toString())

    return[proofs,
    randomNumbers,//only(!) for audit
    dummyCiphers]
}

  /**
 * Verify
 * @param {Int} upper //upper bound of the sum and wanted sum
 * @param {bigInt} n //public key
 * @param {Int} voterId 
 * @param {Array} proofs//all proofs of Trash + proof that sum == upper
 * @param {Array} ciphers //all ciphers (first real then Trash values)
 */
function verify_Range(lower,upper,proofs,ciphers,n,voterId) {
    //Verify all Trash values alone; -1 because last is proof that sum == upper
    for(var i= 0; i < (upper - lower); i++){
        if(!OneOutOf2.verify_1OutOf2(1,0,n,
            ciphers[(i + (ciphers.length - proofs.length))],//first are real values need only Trash
            proofs[i][0], //Proof only for Trash
            proofs[i][1],
            proofs[i][2],
            proofs[i][3],
            proofs[i][4],
            proofs[i][5],1)){
            return false
        }      
    }

    //n**2
    var n_squared = bigInt(n).pow(2)

    //compute encrypted sum
    var encryptedSum = bigInt(1)
    //without last(this is for sum == upper)
    for(var i= 0; i < (ciphers.length - 1); i++){
        encryptedSum = bigInt(encryptedSum).multiply(ciphers[i]).mod(n_squared);
    }
    
    return OneOutOf2.verify_1OutOf2(upper,upper + 1,n,
    encryptedSum.toString(),
    proofs[proofs.length - 1][0],//last proof
    proofs[proofs.length - 1][1],
    proofs[proofs.length - 1][2],
    proofs[proofs.length - 1][3],
    proofs[proofs.length - 1][4],
    proofs[proofs.length - 1][5],
    voterId)  
}

export default { proof_Range, verify_Range };