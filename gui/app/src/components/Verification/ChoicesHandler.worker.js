import bigInt from "big-integer";
import Paillier from "components/Paillier";
import CheckboxZKP from "src/components/Verification/ZKP/CheckboxZKP";
import RankingZKP from "src/components/Verification/ZKP/RankingZKP";
import {PedersenVectorCommitment} from "src/components/Verification/ZKP/PedersenVectorCommitment";

/**
 * WebWorker for Paillier verification
 */
self.addEventListener("message", ({ data }) => {
  var data = JSON.parse(data);
  if (data.choices == null && data.paillier == null) {
    self.postMessage({
      result: false
    });
    return;
  }

  var result = true; // Result of verification
  var ciphers = [];

  for (var i = data.start; i < data.end; i++) {
    var cipher = data.choices[i];
    cipher = Paillier.encrypt(
      data.paillier.publicKey,
      cipher,
      data.secretRandomNumbers.bullet.paillier[i]
    );
    ciphers.push(cipher);
    if (data.category == "Checkbox") {
      var proof = CheckboxZKP.generateProof(
        0,
        1,
        cipher,
        data.paillier.publicKey,
        data.secretRandomNumbers.bullet.paillier[i],
        data.secretRandomNumbers.bullet.proofs[i],
        data.voterSecret
      );
    }
    self.postMessage({
      done: false
    });
    // Check if computed cipher equals cipher from bullet
    if (cipher.toString() != data.bullet.choices[i]) {
      result = false;
    }
    if (data.category == "Checkbox") {
      for (var z = 0; z < proof.length; z++) {
        if (proof[z] != data.bullet.proofs[i][z]) {
          result = false;
          break;
        }
      }
    }
  }
  //TODO: only check zkp if ranking does not allow multiple candidates to be placed on the same rank
  if (data.category == "Ranking") {
    if(data.end == data.candidates.length) { //TODO: what does data.end and data.start exist?
      var publicKey = bigInt(data.paillier.publicKey);
      var publicKeySquared = bigInt(data.paillier.publicKey).pow(2);

      var commitmentSetup = data.bullet.proofs.commitmentSetup;
      var pedersenVectorCommitment = new PedersenVectorCommitment(commitmentSetup.p, commitmentSetup.q, commitmentSetup.g, commitmentSetup.h);
      var commitmentSetupPermutationArgument = data.bullet.proofs.commitmentSetupPermutationArgument;
      var pedersenVectorCommitmentPermutationArgument = new PedersenVectorCommitment(commitmentSetupPermutationArgument.p, commitmentSetupPermutationArgument.q, commitmentSetupPermutationArgument.g, commitmentSetupPermutationArgument.h);

      var maxVotes = Math.max(...data.ballot.settings.pointDistribution);

      var newCiphers = new Array(ciphers.length);
      var newRandomNumbers = new Array(ciphers.length);
      for(var i = 0; i < ciphers.length; i++) {
        newCiphers[i] = bigInt(ciphers[i]).modPow(bigInt(maxVotes).pow(i), publicKeySquared);
        newRandomNumbers[i] = bigInt(data.secretRandomNumbers.bullet.paillier[i]).modPow(bigInt(maxVotes).pow(i), publicKey);
      }
      var cipher = bigInt(1);
      var randomPaillierNumber = bigInt(1);
      for(var i = 0; i < ciphers.length; i++) {
        cipher = cipher.multiply(newCiphers[i]).mod(publicKeySquared);
        randomPaillierNumber = randomPaillierNumber.multiply(newRandomNumbers[i]).mod(publicKey);
      }
    
      var numberOfCandidates = data.candidates.length;
      var proof = RankingZKP.generateProof(cipher.toString(), randomPaillierNumber, data.choices, numberOfCandidates, maxVotes, data.voterSecret, publicKey, pedersenVectorCommitment, pedersenVectorCommitmentPermutationArgument, data.secretRandomNumbers.bullet.proofs);
      if(JSON.stringify(proof) !== JSON.stringify(data.bullet.proofs.zkp)) {
      result = false;
      }
    }
  }
  self.postMessage({
    done: true,
    result: result
  });
});
