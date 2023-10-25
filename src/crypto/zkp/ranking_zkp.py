import hashlib
import gmpy2 as gmpy
import json
import logging

from src.crypto.zkp.pedersen_vector_commitment import pedersen_vector_commitment

log = logging.getLogger(__name__)

def verify_ranking_proof(abb, points_distrubution, number_of_candidates, hashed_voter_secret, commitment_setup, commitment_setup_permutation_argument, ciphers, proof):
    """
    verify that the provided cipher is a permutation of the points_distrubution.
    If that is the case the provided vote is valid

    abb : abb
        abb object
    points_distrubution : Array
        point distrubution of the ranking ballot
    number_of_candidates : int
        amount of candidates
    hashed_voter_secret : string
        hashed secret of the voter
    commitment_setup : JSON
        commitment setup paramerters
    commitment_setup_permutation_argument : JSON
        commitment setup paramerters
    ciphers : Array
        ciphers of the voters choices
    proof : JSON
        zkp
    """
    
    #check if every value exists to avoid crash
    if not check_if_all_attributes_contained(proof):
        return False
    
    max_votes = max(points_distrubution)

    #cast values to mpz
    max_votes = gmpy.mpz(max_votes)
    for i in range(len(ciphers)):
        ciphers[i] = gmpy.mpz(ciphers[i])
    C_R = gmpy.mpz(proof["C_R"])
    c = gmpy.mpz(proof["c"])
    c_r = gmpy.mpz(proof["c_r"])
    R_blackbox = gmpy.mpz(proof["RBlackbox"])
    r_blackbox = gmpy.mpz(proof["rBlackbox"])
    c_d = gmpy.mpz(proof["c_d"])
    c_delta = gmpy.mpz(proof["c_delta"])
    c_a = gmpy.mpz(proof["c_a"])
    z_blackbox = gmpy.mpz(proof["zBlackbox"])
    z_delta_blackbox = gmpy.mpz(proof["z_deltaBlackbox"])
    a_blackbox = proof["aBlackbox"].split(",")
    f_blackbox = proof["fBlackbox"].split(",")
    f_delta_blackbox = proof["f_deltaBlackbox"].split(",")
    for i in range(len(a_blackbox)):
        a_blackbox[i] = gmpy.mpz(a_blackbox[i])
    for i in range(len(f_blackbox)):
        f_blackbox[i] = gmpy.mpz(f_blackbox[i])
    for i in range(len(f_delta_blackbox)):
        f_delta_blackbox[i] = gmpy.mpz(f_delta_blackbox[i])

    #calculate cipher
    #we need to compute a new cipher with the plaintext sum(i=0, numberOfCandidates-1)vote[i]*M^i for the zkp 
    #where vote[i] is the amount of votes candidate i recived and M is the max amount of votes a candidate can recive.
    #we need to do it in this way so that we can also compute a cipher with this plaintext in the backend
    #since we only send each vote encrypted by iteself to the backend
    new_ciphers = []
    for i in range(0, len(ciphers)):
        cipher = gmpy.mpz(ciphers[i])
        exponent = gmpy.mpz(max_votes) ** i
        new_ciphers.append(gmpy.powmod(cipher, exponent, abb.pk.n_sq))
    cipher = gmpy.mpz(1)
    for new_cipher in new_ciphers:
        cipher = (cipher * new_cipher) % abb.pk.n_sq

    #setup commitments
    p = commitment_setup["p"]
    q = commitment_setup["q"]
    g = commitment_setup["g"]
    h = commitment_setup["h"]
    local_pedersen_vector_commitment = pedersen_vector_commitment(p, q, g, h)
    p = commitment_setup_permutation_argument["p"]
    q = commitment_setup_permutation_argument["q"]
    g = commitment_setup_permutation_argument["g"]
    h = commitment_setup_permutation_argument["h"]
    pedersen_vector_commitment_permutation_argument = pedersen_vector_commitment(p, q, g, h)

    #fill up pointsDistrubution with 0 if there are fewer ranks than candidates
    for i in range(len(points_distrubution), number_of_candidates):
        points_distrubution.append(0)

    #compute challange
    f_blackbox_string = str(f_blackbox[0])
    for i in range(1, len(f_blackbox)):
        f_blackbox_string = f_blackbox_string + "&" + str(f_blackbox[i])
    f_delta_blackbox_string = str(f_delta_blackbox[0])
    for i in range(1, len(f_delta_blackbox)):
        f_delta_blackbox_string = f_delta_blackbox_string + "&" + str(f_delta_blackbox[i])
    permutation_argument_string = str(c_d)+ "§" + str(c_delta) + "§" + str(c_a) + "§" + f_blackbox_string + "§" + str(z_blackbox) + "§" + f_delta_blackbox_string + "§" + str(z_delta_blackbox)
    e = gmpy.mpz(hashlib.sha512(str(str(cipher) + "|" + str(C_R) + "|" + str(c) + "|" + str(c_r) + "|" + str(permutation_argument_string) + "|" + str(hashed_voter_secret)).encode('UTF-8')).hexdigest(), base=16)

    #check if permutation argument is valid
    shuffle = permutation_verification(c, f_blackbox, z_blackbox, f_delta_blackbox, z_delta_blackbox, c_d, c_delta, c_a, points_distrubution, number_of_candidates, hashed_voter_secret, local_pedersen_vector_commitment, pedersen_vector_commitment_permutation_argument)   #TODO: args

    #compute V_blackbox
    V_blackbox = gmpy.mpz(0)
    for i in range(0, len(a_blackbox)):
        V_blackbox = gmpy.add(V_blackbox, gmpy.mul(a_blackbox[i], max_votes**i))

    #check if cipher^e*C_R mod public_key**2 == E(V_blackbox, R_blackbox)
    if not (gmpy.mul(gmpy.powmod(cipher, e, abb.pk.n_sq), C_R) % abb.pk.n_sq == (gmpy.mpz(abb.enc_given_r(V_blackbox, R_blackbox).val))):  
        return False

    #check if c^e*c_r mod p == com(a_blackbox, r_blackbox)
    p = local_pedersen_vector_commitment.get_p()  
    if not (gmpy.mul(gmpy.powmod(c, e, p), c_r) % p) == (local_pedersen_vector_commitment.generateCommitment(a_blackbox, r_blackbox)):
        return False  

    #check if permutation argument is valid
    if not shuffle:
        return False  
    
    return True

def permutation_verification(c, f_blackbox, z_blackbox, f_delta_blackbox, z_delta_blackbox, c_d, c_delta, c_a, points_distribution, number_of_candidates, hashed_voter_secret, local_pedersen_vector_commitment, pedersen_vector_commitment_permutation_argument):
    #compute challanges
    x = gmpy.mpz(hashlib.sha512(str(str(c) + "|" + str(number_of_candidates) + "|" + str(hashed_voter_secret)).encode('UTF-8')).hexdigest(), base=16)
    e = gmpy.mpz(hashlib.sha512(str(str(c_d) + "|" + str(c_delta) + "|"  + str(c_a)).encode('UTF-8')).hexdigest(), base=16)

    #check if c^e*c_d mod p == com(f_blackbox, z_blackbox)
    p = local_pedersen_vector_commitment.get_p()  
    if not ((gmpy.mul(gmpy.powmod(c, e, p), c_d) % p).digits() == (local_pedersen_vector_commitment.generateCommitment(f_blackbox, z_blackbox)).digits()):
        return False  
    
    #check if c_a^e*c_delta mod p == com(f_delta_blackbox, z_delta_blackbox)
    if not ((gmpy.mul(gmpy.powmod(c_a, e, p), c_delta) % p).digits() == pedersen_vector_commitment_permutation_argument.generateCommitment(f_delta_blackbox, z_delta_blackbox).digits()):
        return False      

    #compute F
    F = []
    F.append(gmpy.mpz(f_blackbox[0]) - e * x)
    for i in range(1, number_of_candidates):
        F.append(gmpy.f_div(gmpy.add(gmpy.mul(F[i - 1], gmpy.sub(f_blackbox[i], gmpy.mul(e, x))), f_delta_blackbox[i - 1]), e))

    #compute product(m_i - x), i=1 to L
    product = gmpy.mpz(1)  
    for i in range(0, number_of_candidates):
        product = gmpy.mul(product, gmpy.sub(gmpy.mpz(points_distribution[i]), x))    

    #check if F_L == e*(product(m_i - x), i=1 to L)
    if(not F[number_of_candidates - 1].digits() == (gmpy.mul(e, product)).digits()):
        return False

    return True

def check_if_all_attributes_contained(proof):
    contained = True
    if not "C_R"              in proof: contained = False
    if not "c"                in proof: contained = False
    if not "c_r"              in proof: contained = False
    if not "RBlackbox"        in proof: contained = False
    if not "rBlackbox"        in proof: contained = False
    if not "c_d"              in proof: contained = False
    if not "c_delta"          in proof: contained = False
    if not "zBlackbox"        in proof: contained = False
    if not "z_deltaBlackbox"  in proof: contained = False
    if not "aBlackbox"        in proof: contained = False
    if not "fBlackbox"        in proof: contained = False
    if not "f_deltaBlackbox"  in proof: contained = False

    return contained

