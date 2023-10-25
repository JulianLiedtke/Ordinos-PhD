var bigInt = require("big-integer");
var randomBigInt = require("random-bigint");
const crypto = require("crypto");

import help from "src/components/HelpFunctions";
/**
 * Proof that a cipherText encrypts either firstPlaintext or secondPlaintext
 
 * Calls prover with u_1 = v_randomPaillierNumber**n_publicKey mod n_publicKey**2
 * 
 * @param {Int} firstPlaintext //firstPlaintext possible plaintext
 * @param {Int} secondPlaintext //secondPlaintext possible plaintext
 * @param {bigInt} n_publicKey //public key
 * @param {bigInt} voterId 
 * @param {bigInt} v_randomPaillierNumber //random number used to compute cipher
 * @param {Array} v_randomProofNumbers //random number used to compute proofs
 * @param {bigInt} bits //legth for random numbers
 * @param {String} cipherText
 */
function proof_1OutOf2(
  firstPlaintext,
  secondPlaintext,
  n_publicKey,
  ciphertext,
  v_randomPaillierNumber,
  v_randomProofNumbers,
  voterId,
  bits
) {
  console.log("1")
  n_publicKey = bigInt(n_publicKey);
  v_randomPaillierNumber = bigInt(v_randomPaillierNumber);
  v_randomProofNumbers = [
    bigInt(v_randomProofNumbers[0]),
    bigInt(v_randomProofNumbers[1]),
    bigInt(v_randomProofNumbers[2])
  ];

  //n_publicKey**2
  var n_squared = bigInt(n_publicKey).pow(2);
  ciphertext = bigInt(ciphertext);
  console.log("2")
  //g**i = (1 + n_publicKey)**firstPlaintext mod n_publicKey**2
  var gi_first = bigInt(1)
    .add(n_publicKey)
    .modPow(bigInt(firstPlaintext), n_squared);
  //Inverse of g**i because C/g**i mod n_publicKey**2 = C * (g**i)**-1
  var result1_euclid = gi_first.modInv(n_squared);
  //u_1 = = C * (g**i)**-1
  var u_1 = ciphertext.multiply(result1_euclid.mod(n_squared)).mod(n_squared);
  console.log("3")
  //g**i = (1 + n_publicKey)**secondPlaintext mod n_publicKey**2
  var gi_second = bigInt(1)
    .add(n_publicKey)
    .modPow(bigInt(secondPlaintext), n_squared);
  //Inverse of g**i because C/g**i mod n_publicKey**2 = C * (g**i)**-1
  var result2_euclid = gi_second.modInv(n_squared);
  //u_2 = C/g**i mod n_publicKey**2 = C * (g**i)**-1
  var u_2 = ciphertext.multiply(result2_euclid.mod(n_squared)).mod(n_squared);
  console.log("4")
  //if u_1 not equals v_randomPaillierNumber**n_publicKey swap u_1 and u_2
  if (u_1.notEquals(v_randomPaillierNumber.modPow(n_publicKey, n_squared))) {
    var prove = Prover(
      n_publicKey,
      u_2,
      u_1,
      v_randomPaillierNumber,
      v_randomProofNumbers,
      voterId,
      bits
    );
    return [prove[3], prove[4], prove[5], prove[0], prove[1], prove[2]];
  } else {
    var prove = Prover(
      n_publicKey,
      u_1,
      u_2,
      v_randomPaillierNumber,
      v_randomProofNumbers,
      voterId,
      bits
    );
    return prove;
  }
}

/**
 * Actual Prove
 *
 * @param {bigInt} n_publicKey //public key
 * @param {bigInt} u_1 //true v_randomPaillierNumber**n_publicKey
 * @param {bigInt} u_2 //v_randomPaillierNumber**n_publicKey for other value
 * @param {bigInt} v_randomPaillierNumber //random number used to compute cipher
 * @param {Array} v_randomProofNumbers //random numbers used to compute proofs
 */
function Prover(
  n_publicKey,
  u_1,
  u_2,
  v_randomPaillierNumber,
  v_randomProofNumbers,
  voterId,
  bits
) {
  console.log("wtf")
  //n_publicKey**2
  var n_squared = bigInt(n_publicKey).pow(2);

  //simulate honest M
  var conversation = honestM(n_publicKey, u_2, bits, v_randomProofNumbers);

  //a_1 = r**n_publicKey mod n_publicKey**2
  var a_1 = v_randomProofNumbers[0].modPow(n_publicKey, n_squared);

  //from honest M
  var a_2 = conversation;
  var e_2 = v_randomProofNumbers[2];
  var z_2 = v_randomProofNumbers[1];

  console.log("asdsg")
  var voterId_byte = bigInt(help.text2Binary(voterId).replace(/\s+/g, ''))
  
  console.log("n", n_publicKey)
  console.log("u_1", u_1)
  console.log("u_2", u_2)
  console.log("a_1", a_1)
  console.log("a_2", a_2)
  console.log("byte", voterId_byte)
  


  //Hash input and firstPlaintext message
  var hash = crypto.createHash("sha512");
  hash.update(
    n_publicKey
      .xor(u_1)
      .xor(u_2)
      .xor(a_1)
      .xor(a_2)
      .xor(voterId_byte)
      .toString()
  );

  var hex = hash.digest("hex");
  
  console.log("hex ", hex)
  var s = help.hexTobigInt(hex);
  
  console.log("s ", s)
  //e_1 = s - e_2 mod 2**2048
  var e_1 = s.subtract(e_2).mod(bigInt(2).pow(bits));

  //z_1 = r * v_randomPaillierNumber**e_1 mod n_publicKey**2
  var z_1 = v_randomProofNumbers[0]
    .multiply(v_randomPaillierNumber.modPow(e_1, n_squared))
    .mod(n_squared);
  var result = [
    a_1.toString(),
    e_1.toString(),
    z_1.toString(),
    a_2.toString(),
    e_2.toString(),
    z_2.toString()
  ];

  return result;
}

/**
 * Simulate honest M
 *
 * @param {bigInt} n_publicKey
 * @param {bigInt} u
 * @param {int} bits
 * @param {Array} v_randomProofNumbers
 */
function honestM(n_publicKey, u, bits, v_randomProofNumbers) {
  //n_publicKey**2
  var n_squared = bigInt(n_publicKey).pow(2);
  var z = v_randomProofNumbers[1]; //bigInt(1200001230); //test help.getRandomNumber(bits, n_squared);
  var e = v_randomProofNumbers[2]; //bigInt(123); // test randomBigInt(bits);

  //a = z_n**n_publicKey * u**-e mod n_publicKey**2
  var a = bigInt(z)
    .modPow(n_publicKey, n_squared)
    .multiply(u.modPow(bigInt(e).multiply(-1), n_squared))
    .mod(n_squared);

  return a;
}

/**
 * Verify that a proof proofs a 0 or 1
 *
 * @param {Int} firstPlaintext //firstPlaintext possible plaintext
 * @param {Int} secondPlaintext //secondPlaintext possible plaintext
 * @param {bigInt} n_publicKey
 * @param {bigInt} ciphertext
 * @param {bigInt} a_1
 * @param {bigInt} e_1
 * @param {bigInt} z_1
 * @param {bigInt} a_2
 * @param {bigInt} e_2
 * @param {bigInt} z_2
 */
function verify_1OutOf2(
  firstPlaintext,
  secondPlaintext,
  n_publicKey,
  ciphertext,
  a_1,
  e_1,
  z_1,
  a_2,
  e_2,
  z_2,
  voterId
) {
  n_publicKey = bigInt(n_publicKey);
  //n_publicKey**2
  var n_squared = bigInt(n_publicKey).pow(2);
  ciphertext = bigInt(ciphertext);

  a_1 = bigInt(a_1);
  e_1 = bigInt(e_1);
  z_1 = bigInt(z_1);
  a_2 = bigInt(a_2);
  e_2 = bigInt(e_2);
  z_2 = bigInt(z_2);

  //g**i = (1 + n_publicKey)**firstPlaintext mod n_publicKey**2
  var gi_first = bigInt(1)
    .add(n_publicKey)
    .modPow(bigInt(firstPlaintext), n_squared);
  //Inverse of g**i because C/g**i mod n_publicKey**2 = C * (g**i)**-1
  var result1_euclid = gi_first.modInv(n_squared);
  //u_1 = = C * (g**i)**-1
  var u_1 = ciphertext.multiply(result1_euclid.mod(n_squared)).mod(n_squared);

  //g**i = (1 + n_publicKey)**secondPlaintext mod n_publicKey**2
  var gi_second = bigInt(1)
    .add(n_publicKey)
    .modPow(bigInt(secondPlaintext), n_squared);
  //Inverse of g**i because C/g**i mod n_publicKey**2 = C * (g**i)**-1
  var result2_euclid = gi_second.modInv(n_squared);
  //u_2 = C/g**i mod n_publicKey**2 = C * (g**i)**-1
  var u_2 = ciphertext.multiply(result2_euclid.mod(n_squared)).mod(n_squared);

  //z_1**n_publicKey = z_1**n_publicKey mod n_publicKey**2
  var z_1n = z_1.modPow(n_publicKey, n_squared);
  //z_2**n_publicKey = z_2**n_publicKey mod n_publicKey**2
  var z_2n = z_2.modPow(n_publicKey, n_squared);

  //a_1 * u_1**e_1 mod n_publicKey**2
  var z_1_test = a_1
    .mod(n_squared)
    .multiply(u_1.modPow(e_1, n_squared))
    .mod(n_squared);
  //a_2 * u_2**e_2 mod n_publicKey**2
  var z_2_test = a_2
    .mod(n_squared)
    .multiply(u_2.modPow(e_2, n_squared))
    .mod(n_squared);

  console.log("asqaws")
  var voterId_byte = bigInt(help.text2Binary(voterId).replace(/\s+/g, ''))
  
  
  //Hash input and firstPlaintext message
  var hash2 = crypto.createHash("sha512");
  hash2.update(
    n_publicKey
      .xor(u_1)
      .xor(u_2)
      .xor(a_1)
      .xor(a_2)
      .xor(voterId_byte)
      .toString()
  );

  var hex = hash2.digest("hex");

  var s = help.hexTobigInt(hex);

  //if s == e_1 + e_2 and z_1**n_publicKey == a_1 * u_1**e_1 mod n_publicKey**2 and z_2**n_publicKey == a_2 * u_2**e_2 mod n_publicKey**2
  if (
    s.equals(e_1.add(e_2)) &&
    z_1n.compare(z_1_test) == 0 &&
    z_2n.compare(z_2_test) == 0
  ) {
    return true;
  } else {
    return false;
  }
}

export default { proof_1OutOf2, verify_1OutOf2 };
