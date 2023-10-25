import logging
import numpy as np
from src.crypto.abb import ABB

log = logging.getLogger(__name__)

class SainteLagueEvaluation():

    
    def hoechstzahlverfahren(abb: ABB, n_seats, vote_distribution: list, max_votes: int, max_seats:int = None):
        """
        Calculate a sainte-lague seat distribution using the method of highest numbers.
        n_seats: Number of seats to allocate, can be an integer or Pallier ciphertext. If ciphertext, then max_seats must be set.
        vote_distribution: array with the votes per party encrypted as Pallier ciphertextes
        max_votes: maximum number of votes one party can have 
        max_seats: maximum number of seats that may be distributed. Can be None, if max_votes is an int
        return: array of Pallier Ciphertextes containing the number of allocated seats for each party
        """
        if max_seats == None:
            if not(type(n_seats == int)):
                raise TypeError("Integer is expected or set max_seats.")
            max_seats = n_seats
        max_seats = int(max_seats)
        
        n_parties = len(vote_distribution)
        hoechstzahlen_modified = np.empty(n_parties * max_seats, dtype=object)
        # Berechnung der Ausgleichsfaktoren (unverschlüsselt)
        ausgleichsfaktor = []
        for k in range(max_seats):
            ausgleichsfaktor.append(1)
            for l in range(max_seats):
                if not l==k:
                    ausgleichsfaktor[k] *= 2*l +1

        log.info("precalculation finished")
         # Berechnung der modifizierten Höchstzahlen (ab hier alles verschlüsselt)
        for i in range(n_parties):
            for k in range(max_seats):
                tmp = abb._mul_const(vote_distribution[i],ausgleichsfaktor[k])
                hoechstzahlen_modified[i*max_seats + k] = tmp
  
        log.info("calculation höchstzahlen finished")
        # optimiertes Sortieren:

        a = []
        for i in range(len(hoechstzahlen_modified)):
            a.append(abb.enc_no_r(0))
        biggest_possible_number = max_votes * ausgleichsfaktor[0]
        log.info("preperation sorting finished")

        for i in range(len(hoechstzahlen_modified)):
            for j in range(i):
                if max_seats * np.floor(i/max_seats) > j or j >= i: # hier ist Vergleichsergebnis nicht bekannt
                    vergleichsbool = abb.gt(hoechstzahlen_modified[i], hoechstzahlen_modified[j], abb.get_bits_for_size(biggest_possible_number)) # 1, wenn höchstzahlen[i] >= höchstzahlen[j], sonst 0
                    neg_vergleichsbool = abb.eval_sub_protocol(1, vergleichsbool)
                    a[i] = abb.eval_add_protocol(a[i], vergleichsbool)
                    a[j] = abb.eval_add_protocol(a[j], neg_vergleichsbool)
        log.info("sorting finished")

        for i in range(n_parties):
            for j in range(0, max_seats):
                # addiere Vergleiche, die durch Anordnung im Verfahren klar sind (z.B. n_votes/1 > n_votes/3 > n_votes/5)
                a[int(i*max_seats + j)] = abb.eval_add_protocol(a[int(i*max_seats + j)], int(max_seats - 1 - j))
                    
    
                
        log.info("further comparisons added")
        # TODO: if n_seats largest numbers are ambiguous  --> random  
        # Partei bekommt Sitz, wenn a_i > n-k-1
        parteisitze = []
        for i in range(n_parties):
            parteisitze.append(abb.enc_no_r(0))
        for i in range(len(a)):
            parteisitze[int(np.floor(i/max_seats))] = abb._add_ciphertexts(parteisitze[int(np.floor(i/max_seats))], abb.gt(a[i], int(len(a)-n_seats), abb.get_bits_for_size(len(a)+1)))
       # print(parteisitze)
        log.info("number of seats calculated")
        sitze = ""
        for i in range(len(parteisitze)):
            x = abb.dec(parteisitze[i])
            sitze = sitze + str(x) + " "
        log.info("number of seats decrypted")
        log.info(str(sitze))
        return parteisitze

    def hoechstzahlverfahren_unencrypted(n_seats : int, population_distribution):
        """
        Calculate a sainte-lague seat distribution using the method of highest numbers.
        n_seats: Number of seats to allocate
        population_distribution: array with the population or similar per constituency / federal state
        return: array of integers containing the number of allocated seats for each constituency / federal state
        """
        
        n_parties = len(population_distribution)
        hoechstzahlen_modified = np.zeros(n_parties * n_seats)
        # Berechnung der Ausgleichsfaktoren
        ausgleichsfaktor = []
        for k in range(n_seats):
            ausgleichsfaktor.append(1)
            for l in range(n_seats):
                if not l==k:
                    ausgleichsfaktor[k] *= 2*l +1

        log.info("precalculation finished")
         # Berechnung der modifizierten Höchstzahlen (ab hier alles verschlüsselt)
        for i in range(n_parties):
            for k in range(n_seats):
                hoechstzahlen_modified[i*n_seats + k] = population_distribution[i] * ausgleichsfaktor[k]
  
        log.info("calculation höchstzahlen finished")
        # optimiertes Sortieren:

        a = np.zeros(len(hoechstzahlen_modified))

        for i in range(len(hoechstzahlen_modified)):
            for j in range(i):
                if hoechstzahlen_modified[i] >= hoechstzahlen_modified[j]:
                    a[i] += 1
                else:
                    a[j] += 1
        log.info("sorting finished")

        
        # TODO: if n_seats largest numbers are ambiguous  --> random  
        # Partei bekommt Sitz, wenn a_i > n-k-1
        parteisitze = np.zeros(n_parties, dtype=int)
        for i in range(len(a)):
            gt = 1 if a[i]>= len(a)-n_seats else 0
            parteisitze[int(np.floor(i/n_seats))] +=  gt
        log.info("number of seats calculated")
        return parteisitze

