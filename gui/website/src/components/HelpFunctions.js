/**
 * This library provides functions for the ZKPs
 */
var bigInt = require("big-integer");
import random from 'crypto-random-bigint';

/**
 * Convert Hex to bigInt
 *
 * @param {String} hex
 */
function hexTobigInt(hex) {
  var r = bigInt("0");
  for (var i = 0; i < hex.length; i++) {
    var help;
    switch (hex[i]) {
      case "a":
        help = 10;
        break;
      case "b":
        help = 11;
        break;
      case "c":
        help = 12;
        break;
      case "d":
        help = 13;
        break;
      case "e":
        help = 14;
        break;
      case "f":
        help = 15;
        break;
      default:
        help = hex[i];
        break;
    }

    r = bigInt(r).add(
      bigInt(help).multiply(bigInt("16").pow(bigInt(hex.length - i - 1)))
    );
  }
  return r;
}

/**
 * Extended euclidean algorithm
 * @param {*} a 
 * @param {*} b 
 */
function extended_euclid(a, b) {
  a = bigInt(a);
  b = bigInt(b);
  if (b.equals(bigInt(0))) {
    return [a, bigInt(1), bigInt(0)];
  }
  var erg = extended_euclid(b, a.mod(b));
  var d2 = erg[0];
  var s2 = erg[1];
  var t2 = erg[2];

  var d = d2;
  var s = t2;
  var t = s2.subtract(a.divide(b).multiply(t2));

  return [d, s, t];
}

/**
 * Get a random number randomNonce for Paillier encryption
 * @param {String} n
 * @returns {String}
 */
function getRandomNumber(n) {
  n = bigInt(n);
  var bits = n.bitLength();
  var randomNumber = 0;
  var gcd = 0;
  do {
      randomNumber = bigInt(random(getRandomInt(0, bits))); //TODO: could use bigintCryptoUtils.randBetween() for a secure random number, but has issues with the native BigInt type
      gcd = greatestCommonDivisor(n.toString(), randomNumber.toString());
  } while (gcd.notEquals(1) || randomNumber.compare(n) != -1); //0=equals, 1=randomNumber>n, -1=randomNumber<n
  return randomNumber.toString();
}

/**
 * Compute GCD
 *
 * @param {String} a
 * @param {String} b
 * @returns {bigInt}
 */
function greatestCommonDivisor(a, b) {
  a = bigInt(a);
  b = bigInt(b);
  var randomNonce;
  while (b.neq(0)) {
    randomNonce = a.mod(b);
    a = b;
    b = randomNonce;
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

/**
 * Converts String into binary code
 *
 * @param {String} string
 * @returns {String} binary code as string
 */
function text2Binary(string) {
  return string.split('').map(function (char) {
    return char.charCodeAt(0).toString(2);
  }).join(' ');
}

export default {
  extended_euclid,
  getRandomInt,
  greatestCommonDivisor,
  hexTobigInt,
  getRandomNumber,
  text2Binary
};
