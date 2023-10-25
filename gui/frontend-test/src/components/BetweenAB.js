var bigInt = require("big-integer");
var randomBigInt = require("random-bigint");
const crypto = require("crypto");

import help from "src/components/HelpFunctions";
import OneOutOf2 from "src/components/OneOutOf2";
import Paillier from "./Paillier";
/**
 * Proof that a cipherText encrypts a plaintext between a and b
 
 * @param {Int} a //lower bound of the plaintext
 * @param {Int} b //upper bound of the plaintext
 * @param {bigInt} n //public key
 * @param {bigInt} voterId 
 * @param {bigInt} v //random number used to compute cipher
 * @param {bigInt} bits //legth for random numbers
 * @param {Array} choices
 * @param {Array} ciphers
 */
function proof_BetweenAB(a, b, n, choices, ciphers, v, voterId, bits) {
  var sum = 0;
  choices.forEach(ch => {
    sum += ch;
  });
  if((a > sum) || (b < sum)){
    console.log("not in intervall")
    //for testing
    sum = b;
  }
  var alternative = help.getRandomInt(a,(b + 1));
  while(alternative == sum){
    alternative = help.getRandomInt(a,(b + 1));
  }
  var n_squared = bigInt(n).pow(2);
  var ciphertext = bigInt(1);
  
  ciphers.forEach(c => {
    ciphertext = bigInt(ciphertext).multiply(c).mod(n_squared);
  });
  var v_gesamt = bigInt(1);
  v.forEach(v_einzel => {
    v_gesamt = bigInt(v_gesamt).multiply(v_einzel).mod(n_squared);
  });

  var sequence = help.getRandomInt(0,2);
  if(sequence == 1){
    var proof = OneOutOf2.proof_1OutOf2(sum, alternative, n, ciphertext, v_gesamt, voterId, bits);
    proof.push(sum);
    proof.push(alternative);
  }else{
    var proof = OneOutOf2.proof_1OutOf2(alternative,sum,  n, ciphertext, v_gesamt, voterId, bits);
    proof.push(alternative);
    proof.push(sum);
  }
  
  return proof
}




  /**
 * Verify that a proof proofs a 0 or 1
 *
 * @param {bigInt} n
 * @param {bigInt} ciphers
 * @param {bigInt} a_1
 * @param {bigInt} e_1
 * @param {bigInt} z_1
 * @param {bigInt} a_2
 * @param {bigInt} e_2
 * @param {bigInt} z_2
 */
function verify_BetweenAB(first, second, n, ciphers, a_1, e_1, z_1, a_2, e_2, z_2, voterId) {
  //a b from proof or from config
  //or just first second
  var n_squared = bigInt(n).pow(2);
  
  var ciphertext = bigInt(1);
  ciphers.forEach(c => {
    ciphertext = bigInt(ciphertext).multiply(c).mod(n_squared);
  });
  return OneOutOf2.verify_1OutOf2(first, second, n, ciphertext, a_1, e_1, z_1, a_2, e_2, z_2, voterId) 
   
}

export default { proof_BetweenAB, verify_BetweenAB };