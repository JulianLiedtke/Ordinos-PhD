import gmpy2 as gmpy
from src.crypto.zkp.checkbox_zkp import verify_checkbox_proof

def verify_checkbox_range(abb, lower_bound, upper_bound, ciphers, trash_ciphers, trash_proofs, sum_proof, pk, bits, hashed_voter_secret):
        """
        Verify ZKP that sum of 0 or 1 ciphers are in a given interval

        lower_bound : int
            Lower bound of sum
        upper_bound : int
            Upper bound of sum
        ciphers : Array(PaillierCiphertext)
            ciphers of the actual votes
        trash_ciphers : Array(PaillierCiphertext)
            trash ciphers    
        trash_proofs : Array(String)
            zkps for the trash_ciphers
        sum_proof : Array(String)
            zkp to prove the sum of the ciphers of the actual votes are in a given interval  
        pk : PublicPaillierKey
            Public key of encryption    
        bits : int
            bits of the pk
        hashed_voter_secret : String
            To reproduce challenge    
        """
        if(len(trash_ciphers) != (upper_bound - lower_bound)):
            return False
        #ZKP for each Trashvalue
        for i in range(0, (upper_bound - lower_bound)):
            if not (verify_checkbox_proof(0, 1, pk, trash_ciphers[i], trash_proofs[i], bits, hashed_voter_secret)):
                return False
        #sum up ciphers + trash-values
        encryptedSum = gmpy.mpz(1)
        for cipher in ciphers:
            encryptedSum = (encryptedSum * gmpy.mpz(cipher.val))  % pk.n_sq
        
        for trash_cipher in trash_ciphers:
            encryptedSum = (encryptedSum * gmpy.mpz(trash_cipher.val))  % pk.n_sq

        encryptedSum = abb.init_cipher(encryptedSum)
        
        #ZKP that sum == upperBound
        return verify_checkbox_proof(-1, upper_bound, pk, encryptedSum, sum_proof, bits, hashed_voter_secret)