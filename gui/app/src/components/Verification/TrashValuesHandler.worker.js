import Paillier from "components/Paillier";
import CheckboxZKP from "src/components/Verification/ZKP/CheckboxZKP";

/**
 * WebWorker for Paillier verification
 */
self.addEventListener("message", ({ data }) => {
    var data = JSON.parse(data);
    var minVotes = data.ballot.settings.minNumberOfChoices;
    var maxVotes = data.ballot.settings.maxNumberOfChoices;
    var numberOfVotedCandidates = 0;
    data.choices.forEach(choice => {
        numberOfVotedCandidates += choice;
    });

    var sumOfTrashValues = 0;
    data.plainTrashValues.forEach(value => {
        numberOfVotedCandidates += value;
    });

    var result = true;

    // Value inveriant checking
    if (
        numberOfVotedCandidates < minVotes ||
        numberOfVotedCandidates > maxVotes ||
        numberOfVotedCandidates + sumOfTrashValues != maxVotes
    ) {
        result = false;
    }

    // Iterate over all trash values
    for (var i = 0; i < maxVotes - minVotes; i++) {
        // Encrypt trash value
        var cipher = Paillier.encrypt(
            data.paillier.publicKey,
            data.plainTrashValues[i],
            data.secretRandomNumbers.trashValues.paillier[i]
        );

        // Proof trash value
        var proof = CheckboxZKP.generateProof(
            0,
            1,
            cipher,
            data.paillier.publicKey,
            data.secretRandomNumbers.trashValues.paillier[i],
            data.secretRandomNumbers.trashValues.proofs[i],
            data.voterSecret
        );
        self.postMessage({
            done: false
        }); // Post status update

        if (data.bullet.trashValues.ciphers[i] != cipher.toString()) {
            result = false;
        }

        for (var z = 0; z < proof.length; z++) {
            if (proof[z] != data.bullet.trashValues.proofs[i][z]) {
                result = false;
                break;
            }
        }
    }
    self.postMessage({
        done: true,
        result: result
    });
});
