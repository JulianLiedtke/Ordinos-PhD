const bigintCryptoUtils = require("bigint-crypto-utils");
const bigInt = require("big-integer");
const randomBigInt = require("random-bigint");

import help from "src/components/HelpFunctions";
/**
 * Generate Private/Public Keypair for Paillier encryption
 * with certain number of bits for the prime numbers.
 * Keys will have twice the length
 *
 * @static
 * @param {int} bits
 * @return {object}
 */
async function keyGen(bits) {
  // Generate primes p and q
  var p, q;
  await bigintCryptoUtils.prime(bits).then(value => {
    p = value;
  });
  await bigintCryptoUtils.prime(bits).then(value => {
    q = value;
  });

  var keys = {
    public: null,
    private: null
  };

  keys.public = (p * q).toString();
  keys.private = ((p - 1n) * (q - 1n)).toString();

  // var keys = {
  //   public:
  //     "19324514823630781995795919235045908680244760495658422082722211854560963009928980816700996574043546207743854806705283166688902743980060074423695668843488144405838724269877604947200127672960450160635066837743932900927721631958085122958250329660702996433204326625367545126552271263797270934928391393761309734641494916688041438863006234490806140277751601031234249659772027826674125412076705131709649681921679631424955062483270186120903191628819366686866430870597686244796631169365832127712459043522309649340429969887001991652779740930394733732849281057333693155333078854864033007899341974223199608081624523504695901190539",
  //   private:
  //     "19324514823630781995795919235045908680244760495658422082722211854560963009928980816700996574043546207743854806705283166688902743980060074423695668843488144405838724269877604947200127672960450160635066837743932900927721631958085122958250329660702996433204326625367545126552271263797270934928391393761309734641213501495559522298851949944533528794362680273247435192567406958928672117169110467306685372209738378784151032174851519921051430279992486499658434571741077652818494565326231094268130094507627345415430013090826907609990317181629447282235588190201089849370398434457874876446583118339603663324211131498829143905760"
  // };

  return keys;
}

/**
 * Encrypt number plainNumber with Paillier publickey
 *
 * @static
 * @param {String} publicKey publicKey
 * @param {String} plainNumber
 * @param {String} randomNonce
 * @return {String}
 */
function encrypt(publicKey, plainNumber, randomNonce) {
  publicKey = bigInt(publicKey);
  randomNonce = bigInt(randomNonce);

  // publicKey**2
  var n_squared = publicKey.pow(2);

  // c1 = (1+publicKey)**plainNumber mod publicKey**2
  var c1 = publicKey.add(1).modPow(plainNumber, n_squared);

  // c2 = randomNonce**publicKey mod publicKey**2
  var c2 = randomNonce.modPow(publicKey, n_squared);

  var c = c1.multiply(c2);

  c = c.mod(n_squared);

  return c.toString();
}

/**
 * Decrypt number plainNumber with Paillier privateKey
 *
 * @static
 * @param {String} publicKey publicKey
 * @param {String} privateKey privateKey
 * @param {String} cipherNumber cipherText
 * @return {String}
 */
function decrypt(publicKey, privateKey, cipherNumber) {
  publicKey = bigInt(publicKey);
  cipherNumber = bigInt(cipherNumber);

  // publicKey**2
  var n_squared = publicKey.pow(2);

  // plainNumber = (cipherNumber**privateKey mod publicKey**2) - 1
  var plainNumber = cipherNumber.modPow(privateKey, n_squared).subtract(1);

  // plainNumber = plainNumber /publicKey
  plainNumber = plainNumber.divide(publicKey);

  // plainNumber = plainNumber * privateKey**-1
  plainNumber = plainNumber.multiply(bigInt(privateKey).modInv(publicKey));

  // plainNumber = plainNumber mod publicKey
  plainNumber = plainNumber.mod(publicKey);

  return plainNumber.toString();
}

export default { keyGen, encrypt, decrypt};
