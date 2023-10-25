import gmpy2 as gmpy

class pedersen_vector_commitment:
    def __init__(self, p, q, g, h):
        self.p = gmpy.mpz(p)
        self.q = gmpy.mpz(q)
        temp = []
        for i in range(len(g)):
            temp.append(gmpy.mpz(g[i]))
        self.g = temp
        self.h = gmpy.mpz(h)
    
    def generateCommitment(self, vector, r):
        if len(vector) != len(self.g):
            raise ValueError("Size of vector does not match")

        c = gmpy.powmod(self.h, r, self.p)
        for i in range(len(self.g)):
            if(gmpy.mpz(vector[i]) < 0):
                inverse = gmpy.invert(self.g[i], self.p)
                c = gmpy.mul(c, gmpy.powmod(inverse,gmpy.mul(gmpy.mpz(-1), vector[i]), self.p))
            else :
                c = gmpy.mul(c, gmpy.powmod(self.g[i], vector[i], self.p))
            
        c = c % self.p
        return c

    #def getRandomZq():
        #bits = self.q.bitLength()
        #while(True):
            #r = gmpy.mpz(random(help.getRandomInt(2, bits)));
            #if(r.compare(self.q) == -1) return r;

    def get_setup_values(self):
        p = self.p
        q = self.q
        g = self.g
        h = self.h
        return p, q, g, h      
 
    def get_p(self) :
        return self.p

    def get_q(self) :
        return self.q    

    def get_g(self) :
        return self.g

    def get_h(self) :
        return self.h
        
