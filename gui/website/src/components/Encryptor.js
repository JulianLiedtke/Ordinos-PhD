/**
 * This Library provides AES256 En/Decryption
 */
import random from 'crypto-random-bigint';
var CryptoJS = require("crypto-js");
const aes256 = require("crypto-js/aes");


/**
 * Generate a random 128 Bit Number
 *
 * @static
 * @return {string} random string
 */
function randomGen() {
  //var ran = sha256(Math.random().toString()).toString();
  var ran = random(256).toString();
  return ran;
}

/**
 * Encrypt plaintext with AES256
 *
 * @static
 * @param {string} key
 * @param {string} plaintext
 * @return {string} ciphertext
 */
function encrypt(key, plaintext) {
  var cipher = aes256.encrypt(plaintext, key).toString();
  return cipher;
}

/**
 * Decrypt plaintext with AES256
 *
 * @static
 * @param {string} key
 * @param {string} cipher
 * @return {string} plaintext
 */
function decrypt(key, cipher) {
  var plaintext = aes256.decrypt(cipher, key).toString(CryptoJS.enc.Utf8);
  return plaintext;
}

export default { randomGen, encrypt, decrypt };
