/**
 * This Library provides AES256 En/Decryption
 */

var CryptoJS = require("crypto-js");
const aes256 = require("crypto-js/aes");

/**
 * Generate a random String. This is NOT a secure key!
 * ONLY for testing purpose
 *
 * @todo
 * @static
 * @return {string} random string
 */
function randomGen() {
  var ran = Math.random()
    .toString(36)
    .substr(2);
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
