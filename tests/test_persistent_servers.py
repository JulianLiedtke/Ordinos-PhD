import json
import logging
import time
import unittest
from time import time


from src.crypto.paillier_abb import PaillierABB
from src.election.authentication_server.authentication import Authentication
from src.election.election_authority import ElectionAuthority
from src.election.single_vote.single_vote_election_system import \
    SingleVoteElection
from src.election.trustee.trustee import init_trustees
from src.protocols.sublinear import SubLinearProtocolSuite
from src.util.logging import setup_logging
from src.util.point_vote import PointVote
from src.election.votes.vote import ConstituencyVote
from src.election.votes.one_candidate_vote import OneCandidateVote

# not a representative test was only used to better understand how systems work together and in which format data needs to be saved
log = logging.getLogger(__name__)
"""start bb and trustee server before testing with python start_bb_server.py && python start_trustee_server.py"""


class BasicElectionEncTest(unittest.TestCase):

    def setUp(self):
        setup_logging()
        abbs = PaillierABB.gen_trustee_abbs(16, 2, 2, SubLinearProtocolSuite)
        self.trustee_gen = lambda bulletin_board: init_trustees(
            bulletin_board, abbs, [i for i, _ in enumerate(abbs)])
        self.startTime = time()

    def tearDown(self):
        t = time() - self.startTime
        log.info("%s: %.3f" % (self.id(), t))

    def test_persistent_election(self):

        with open("examples/configs/AllConfigs.json") as json_file:
            json_data = json.load(json_file)

        self.authentication = Authentication()
        self.authentication.createElection(
            json_data["Checkbox2-3_Borda1-1-0"]["election_settings"])
        votes = OneCandidateVote.generate_random_votes(4, 3, 1)
        votes = json.dumps(votes, default=lambda o: o.__dict__,
                           sort_keys=True, indent=4)
        # test writing vote data
        file_path = 'data/ballots/test_ballot.json'
        with open(file_path, 'w+') as f:
            json.dump(votes, f)
            f.close()
        # test reading back vote data
        file_path = 'data/ballots/test_ballot.json'
        with open(file_path, 'r') as f:
            votes = json.load(f)
            f.close()

    def _init_election(self, n_cand):
        return ElectionAuthority(self.trustee_gen, SingleVoteElection(n_cand), local_bulletin_board=True)


if __name__ == '__main__':
    unittest.main()
# todo automate test cases
'''
    Test cases which are currently successfully tested:
        Prerequisite: 1.Start all server, make sure there are no files left from past elections (files in the folder auth_tokens, ballots, config, hashes, trustees and secrets)
                      2. create election with two voters, two parties, checkbox with one vote and borda with one winner 
        Glossary: AS=Authentication Server, BB=Bulletinboard Server, TR= Trustee Server, X=crashed, V=voted
        AS | BB | TR | Voter1 | Voter2
        X  |    |    |        |
           | X  |    |        |
           |    | X  |        |
        X  | X  |    |        |
           | X  | X  |        |
        X  |    | X  |        |
        X  |    |    |   V    |
           | X  |    |   V    |
           |    | X  |   V    |
        X  |    |    |   V    |   V
           | X  |    |   V    |   V
           |    | X  |   V    |   V
'''
