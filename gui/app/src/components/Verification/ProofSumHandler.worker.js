var bigInt = require("big-integer");
import CheckboxZKP from "src/components/Verification/ZKP/CheckboxZKP";

/**
 * WebWorker for Paillier verification
 */
self.addEventListener("message", ({ data }) => {
  var data = JSON.parse(data);
  var proof;
  var result = true;

  var n_publicKey = data.paillier.publicKey;

  var n_squared = bigInt(n_publicKey).pow(2);

  var cipherSum = bigInt(1);

  // Multiply user choices (sum them up)
  data.bullet.choices.forEach(c => {
    cipherSum = cipherSum.multiply(c).mod(n_squared);
  });

  // Multiply trash values (sum them up)
  data.bullet.trashValues.ciphers.forEach(c => {
    cipherSum = cipherSum.multiply(c).mod(n_squared);
  });

  // Now cipherSum is the encrypted sum of all choices
  // it should be equal to maxVotes

  var randomNonceSum = bigInt(1);

  data.secretRandomNumbers.bullet.paillier.forEach(nonce => {
    randomNonceSum = randomNonceSum.multiply(nonce).mod(n_publicKey);
  });

  data.secretRandomNumbers.trashValues.paillier.forEach(nonce => {
    randomNonceSum = randomNonceSum.multiply(nonce).mod(n_publicKey);
  });

  proof = CheckboxZKP.generateProof(
    -1,
    data.ballot.settings.maxNumberOfChoices,
    cipherSum,
    n_publicKey,
    randomNonceSum,
    data.secretRandomNumbers.proofOfSum,
    data.voterSecret
  );

  for (var i = 0; i < data.bullet.proofOfSum.length; i++) {
    if (proof[i] != data.bullet.proofOfSum[i]) {
      result = false;
      break;
    }
  }

  self.postMessage({
    done: true,
    result: result
  }); // Post 'done' update with payload
});
