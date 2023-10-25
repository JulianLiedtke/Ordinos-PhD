import hashlib
import gmpy2 as gmpy
import logging

log = logging.getLogger(__name__)


def verify_checkbox_proof(plaintext1, plaintext2, pk, cipher, proof, bits, hashed_voter_secret):
    """
    Verify that the provided proof either proof that plaintext1 or plaintext2 was encrypted

    plaintext1 : int
        Possible Plaintext
    plaintext2 : int
        Possible Plaintext
    pk : PublicPaillierKey
        Public key of encryption
    cipher : PaillierCiphertext
        cipher
    proof : Array
        Proof to be checked       
    bits : int
        bits of the pk
    hashed_voter_secret : String
        To reproduce challenge    
    """

    if (len(proof) != 6):
        return False

    #converstion to Multiple-precision Integers
    a1 = gmpy.mpz(proof[0])
    e1 = gmpy.mpz(proof[1])
    z1 = gmpy.mpz(proof[2])
    a2 = gmpy.mpz(proof[3])
    e2 = gmpy.mpz(proof[4])
    z2 = gmpy.mpz(proof[5])
    cipher = gmpy.mpz(cipher.val)
    
    #compute u1 and u2
    gi1 = gmpy.powmod((1 + pk.n), plaintext1, pk.n_sq)
    inverse_gi1 = gmpy.invert(gi1, pk.n_sq)
    u1 = (cipher * inverse_gi1) % pk.n_sq
    
    gi2 = gmpy.powmod((1 + pk.n), plaintext2, pk.n_sq)
    inverse_gi2 = gmpy.invert(gi2, pk.n_sq)
    u2 = (cipher * inverse_gi2) % pk.n_sq

    #V checks that s = e1 + e2 mod 2^t
    commitment = str(a1) + "§" + str(a2)
    public_parametes = str(u1) + "$" + str(u2) + "$" + str(pk.n)
    s = hashlib.sha512(str(str(hashed_voter_secret) + "|" + public_parametes + "|" + commitment).encode('UTF-8')).hexdigest()
    s = gmpy.mpz(str(s), base=16)

    s_modulo = gmpy.mpz(pow(2, int(bits / 2)))
    s_test = gmpy.mpz((e1 + e2) % s_modulo)
    if not s.digits() == s_test.digits():
        return False

    #V checks that E(0, z1) = a1*u1^e1 mod n^(s+1). In this case E(0, z1) = z1^n^s mod n^(s+1)
    z1n = gmpy.powmod(z1, pk.n, pk.n_sq)
    temp1 = gmpy.powmod(u1, e1, pk.n_sq)
    z1n_test = ((a1 % pk.n_sq) * temp1) % pk.n_sq
    if not z1n.digits() == z1n_test.digits():
        return False

    #V checks that E(0, z2) = a2*u2^e2 mod n^(s+1)
    z2n = gmpy.powmod(z2, pk.n, pk.n_sq)
    temp2 = gmpy.powmod(u2, e2, pk.n_sq)
    z2n_test = ((a2 % pk.n_sq) * temp2) % pk.n_sq
    if not z2n.digits() == z2n_test.digits():
        return False

    #V checks that u1, u2, a1, a2, z1, z2 are relatively prime to n
    if(gmpy.gcd(u1, pk.n) != 1 or gmpy.gcd(u2, pk.n) != 1 or gmpy.gcd(a1, pk.n) != 1 or gmpy.gcd(a2, pk.n) != 1 or gmpy.gcd(z1, pk.n) != 1 or gmpy.gcd(z2, pk.n) != 1):
        return False

    return True  