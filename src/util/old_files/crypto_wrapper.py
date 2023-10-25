
class Cryptodata():

    def __init__(self, protocol, abb, num_bits):
        self.protocol = protocol # irv_evaluation
        self.abb = abb # PaillierABB
        self.num_bits = num_bits

    def encrypt(self, value):
        """ encrypts a plaintext with the generated public key without randomness"""
        return self.abb.enc_no_r(value)

    def encrypt_rand(self, value):
        """ encrypts a plaintext with the generated public key with randomness"""
        return self.abb.enc(value)

    def decrypt(self, y):
        """ decrypts a ciphertext"""
        return self.abb.dec(y)

    def add(self, x, y):
        """ adds two ciphertexts """
        return self.abb.eval_add_protocol(x, y)

    def sub(self, x, y):
        """ subtracts ciphertext y from ciphertext x """
        return self.abb.eval_sub_protocol(x, y)

    def mult(self, x, y):
        """ multiplies ciphertext by constant """
        return self.abb.eval_mul_protocol(x, y)

    def mult_ciphers(self, x, y):
        """ multiplies two ciphertexts """
        return self.abb.eval_mul_protocol(x, y)

    def greater_than_test(self, x, y, bitlength=None):
        """ returns an encrypted 1 iff x >= y """
        return self.abb.gt(x, y)

    def equality_test(self, x, y, bitlength=None):
        """ return an encrypted 1 iff x == y """
        return self.abb.eq(x, y)