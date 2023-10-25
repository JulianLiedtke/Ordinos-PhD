var bigInt = require("big-integer");
var randomBigInt = require("random-bigint");
const crypto = require('crypto');
var hash = crypto.createHash('sha512');

/**
 * Calls prover with u_1 = v**n mod n**2
 * 
 * @param {bigInt} n 
 * @param {bigInt} ciphertext 
 * @param {bigInt} v 
 */
function Prove(n, ciphertext, v, voterId){
  //n**2 
  var n_squared = bigInt(n).pow(2);

  ciphertext = bigInt(ciphertext)
  var key = n
  //help_ux = (1 + n)**0 mod n**2
  var help_u1 = bigInt(1n + key).modPow(bigInt(0), n_squared);
  var help_u2 = bigInt(1n + key).modPow(bigInt(1), n_squared);
  
  // u_1 = C/g**i mod n**2
  var u_1 = divisionMod(ciphertext, help_u1, n_squared);
  var u_2 = divisionMod(ciphertext, help_u2, n_squared)
  var v = bigInt(v)

  var help_u =bigInt(v).modPow(n,n_squared)

  //if u_2 equals v swap u_1 and u_2
  if(bigInt(u_1).notEquals(help_u)){
    var prove = Prover(n, u_2,u_1, v,voterId)
    return [prove[3],prove[4],prove[5],prove[0],prove[1],prove[2]]
  
    
  }else{
    var prove = Prover(n, u_1,u_2, v,voterId)
    return prove
   }
}


/**
 * Actual Prove
 * 
 * @param {bigInt} n 
 * @param {bigInt} u_1 
 * @param {bigInt} u_2 
 * @param {bigInt} v 
 */
function Prover(n, u_1,u_2, v, voterId){
  //n**2 
  var n_squared = bigInt(n).pow(2);
  
  var r = randomBigInt(2048);
  r = bigInt(r).mod(n_squared) 

  //simulate honest M
  var conversation = honestM(n,u_2)
  //a_1 = r**n mod n**2
  var a_1 = bigInt(r).modPow(n,n_squared)
  //from honest M
  var a_2 = conversation[0]
  var e_2 = conversation[1]
  var z_2 = conversation[2]
  //Hash input and first message
  hash.update([n.toString(),u_1.toString(),u_2.toString(),a_1.toString(),a_2.toString(),voterId]);
  var hex = hash.digest('hex')
  hash = crypto.createHash('sha512');
  var s = hexTobigInt(hex)

  //e_1 = s - e_2 mod 2**2048
  var e_1 = bigInt(s).subtract(e_2).mod(bigInt(2).pow(2048))
  
  //v**e_1 mod n**2
  var help_1 = bigInt(v).modPow(e_1, n_squared)
  //r mod n**2
  var help_2 = bigInt(r).mod(n_squared)
  //z_1 = r * v**e_1 mod n**2
  var z_1 = bigInt(help_2).multiply(help_1).mod(n_squared)

  return [a_1,e_1,z_1,a_2,e_2,z_2]
}

/**
 * Verifie ZKP
 * 
 * @param {bigInt} n 
 * @param {bigInt} ciphertext 
 * @param {bigInt} a_1 
 * @param {bigInt} e_1 
 * @param {bigInt} z_1 
 * @param {bigInt} a_2 
 * @param {bigInt} e_2 
 * @param {bigInt} z_2 
 */
function Verifie(n,ciphertext,a_1,e_1,z_1,a_2,e_2,z_2,voterId){
  //n**2
  var n_squared = bigInt(n).pow(2);
  ciphertext = bigInt(ciphertext)
  var key = n

  //help_ux = (1 + n)**0 mod n**2
  var help_u1 = bigInt(1n + key).modPow(bigInt(0), n_squared);
  var help_u2 = bigInt(1n + key).modPow(bigInt(1), n_squared);
  
  // u_1 = C/g**i mod n**2
  var u_1 = divisionMod(ciphertext, help_u1, n_squared);
  var u_2 = divisionMod(ciphertext, help_u2, n_squared)
  
  //z_1**n = z_1**n mod n**2
  var z_1n = bigInt(z_1).modPow(n,n_squared)
  //z_2**n = z_2**n mod n**2
  var z_2n = bigInt(z_2).modPow(n,n_squared)
  //u_1**e_1 mod n**2
  var z_1_help1 = bigInt(u_1).modPow(e_1,n_squared)
  //u_2**e_2 mod n**2
  var z_2_help1 = bigInt(u_2).modPow(e_2,n_squared)
  //a_1 mod n**2
  var z_1_help2 = bigInt(a_1).mod(n_squared)
  //a_2 mod n**2
  var z_2_help2 = bigInt(a_2).mod(n_squared)
  //a_1 * u_1**e_1 mod n**2
  var z_1_test = bigInt(z_1_help2).multiply(z_1_help1).mod(n_squared)
  //a_2 * u_2**e_2 mod n**2
  var z_2_test = bigInt(z_2_help2).multiply(z_2_help1).mod(n_squared) 

  
  //Hash input and first message
  var hash2 = crypto.createHash('sha512');;
  hash2.update([n.toString(),u_1.toString(),u_2.toString(),a_1.toString(),a_2.toString(),voterId]);
  var hex = hash2.digest('hex')
  hash2 = crypto.createHash('sha512');
  var s = hexTobigInt(hex)

  //if s == e_1 + e_2 and z_1**n == a_1 * u_1**e_1 mod n**2 and z_2**n == a_2 * u_2**e_2 mod n**2
  if((bigInt(s).equals(bigInt(e_1).add(e_2))) && (bigInt(z_1n).compare(z_1_test) == 0) && 
  (bigInt(z_2n).compare(z_2_test) == 0)){
    console.log("1 or 0")
  }else{
    console.log("failed")
  }
}

/**
 * Convert hex to bigInt
 * 
 * @param {bigInt} hex 
 */
function hexTobigInt(hex){
  var r = bigInt("0");
  for(var i = 1; i <= hex.length; i++){
    var help
    switch(hex[i]){
      case "a":
        help = 10
      break;
      case "b":
        help = 11
      break;
      case "c":
        help = 12
      break;
      case "d":
        help = 13
      break;
      case "e":
        help = 14
      break;
      case "f":
        help = 15
      break; 
      default:
        help = hex[i]
      break;
    }
    help = bigInt(help)
    var help2 = bigInt(hex.length - i)
    var help3 = bigInt("16").pow(help2)
    var help4 =bigInt(help).multiply(help3)
    r = bigInt(r).add(help4)

  }
  return r
}

/**
 * Simulate honest M
 * 
 * @param {bigInt} n 
 * @param {bigInt} u 
 */
function honestM(n,u){
  //n**2
  var n_squared = bigInt(n).pow("2");
  var z = getRandomNumber(2048,n_squared)
  var e = randomBigInt(2048);
  //z_n**n mod n**2
  var help_1 = bigInt(z).modPow(n,n_squared)
  //u**-e mod n**2
  var help_2 = bigInt(u).modPow(bigInt(e).multiply(-1), n_squared)
  //a = z_n**n * u**-e mod n**2
  var a = bigInt(help_1).multiply(help_2).mod(n_squared);

  return [a,e,z]
}

/**
 * For C/g**i mod n**2
 * 
 * so that C/g*i are integers
 * 
 * @param {bigInt} dividend 
 * @param {bigInt} divisor 
 * @param {bigInt} n 
 */
function divisionMod(dividend, divisor, n){
  //for divisor == 1 return dividend
  if(bigInt(divisor).equals(bigInt(1))){
    return bigInt(dividend).mod(n)
  }
  var helpDivison = bigInt(dividend).divmod(divisor,n)

  var help = bigInt(divisor).subtract(helpDivison.remainder);

  var test = bigInt(help).multiply(n).add(dividend).divmod(divisor);

  if(bigInt(test.remainder).compare(0) == 0){
    console.log("ok")
  }else{
    console.log("bad: " + test.remainder.toString())
  }

  var result = bigInt(help).multiply(n).add(dividend).divide(divisor);
  return result
}

/**
 * Get random number with gcd(n, x) = 1
 * 
 * @param {bigInt} bits 
 * @param {bigInt} n 
 */
function getRandomNumber(bits, n) {
  var ran = 0n;
  var gcd = 0;
  do {
    ran = randomBigInt(getRandomInt(0, bits));
    gcd = greatestCommonDivisor(n, ran);
  } while (gcd != 1);
  return ran;
}

/**
 * Compute GCD
 *
 * @param {number} a
 * @param {number} b
 * @returns {number}
 */
function greatestCommonDivisor(a, b) {
  var r = 0n;
  while (bigInt(b).compare(0) != 0) {
    r = bigInt(a).mod(b);
    a = b;
    b = r;
  }
  return a;
}

/**
 * Get a random number between min and max
 * Min inclusive, Max exclusive
 *
 * @param {number} min
 * @param {number} max
 */
function getRandomInt(min, max) {
  return (Math.random() * (max - min) + min) | 0;
}




export default {Prove, Prover, Verifie, randomBigInt };