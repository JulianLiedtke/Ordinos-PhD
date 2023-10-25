import logging
import os
import csv
from src.election.votes.vote import ConstituencyVote
from time import time
import json
from os.path import exists

log = logging.getLogger(__name__)

class BulletinBoard:

    def __init__(self):
        self.votes = []
        self.hashes = []
        self.election_config = None
        self.trustee_messages = {}
        self.results = {}


    def add_vote(self, vote, board_id=None):
        """
        add vote to list of votes
        | vote has to be valid
        | save vote 
        """
        self.votes.append(vote)
        if board_id is not None:
            self.save_votes(board_id)
        
        

    def add_hash(self, hash, board_id=None):
        self.hashes.append(hash)
        if board_id is not None:
            self.save_hashes(board_id)
        

    def add_auth_token(self, token, board_id):
        self.auth_token = token
        self.save_auth_token(token, board_id)
        
    def set_election_config(self, serialized_config, board_id=None):
        self.election_config = serialized_config
        if board_id is not None:
            self.save_config(serialized_config, board_id)

    def get_election_config(self):
        return self.election_config

    def get_votes(self):
        """returns list of votes"""
        return self.votes

    def add_trustee_message(self, from_id, message):
        self.trustee_messages.setdefault(from_id, []).append(message)

    def get_trustee_messages(self, from_id, last_index):
        messages = self.trustee_messages.get(from_id, [])
        return messages[int(last_index):]

    def is_hash_valid(self, h):
        return h in self.hashes

    def add_result(self, from_id, result):
        self.results[from_id] = result

    def get_results(self):
        return self.results
    
    # load votes from file after server crash, called by bb webserver 
    def load_votes(self, board_id):
        file_path = "data/ballots/ballots_"+str(board_id)+".json"
        if exists(file_path):
            with open(file_path, 'r') as f:
                self.votes = json.load(f)
                f.close()

    # saves the vote list containing all the current votes
    def save_votes(self, board_id):
        file_path = 'data/ballots/ballots_'+str(board_id)+'.json'   
        with open(file_path,'w+') as f:
            json.dump(self.votes, f)
            f.close()

    # load a election config from file after server crash, called by bb webserver
    def load_config(self,board_id):
        file_path = "data/config/bb_config_"+str(board_id)+".json"
        if exists(file_path):
            with open(file_path, 'r') as f:
                if(not os.stat(file_path).st_size == 0):
                    self.election_config = json.load(f)
                f.close()


    # save the election config which was created by the frontend and sent by authentication server
    def save_config(self, config, board_id): 
        file_path = "data/config/bb_config_"+str(board_id)+".json"
        with open(file_path, 'w+') as f:
            json.dump(config, f)
            f.close()

    # load auth tokens from file after server crash
    def load_auth_token(self,board_id):
        file_path = "data/auth_tokens/token_"+str(board_id)+".json"
        if exists(file_path):
            with open(file_path, 'r') as f:
                if(not os.stat(file_path).st_size == 0):
                    auth_token = json.load(f)
                    return auth_token
                f.close()

    #saves the auth token, which is needed for communication between authentication and bulletinboard server 
    def save_auth_token(self, token, board_id):
        file_path = 'data/auth_tokens/token_'+str(board_id)+'.json'
        with open(file_path, 'w+') as f:
            json.dump(token, f)
            f.close()


    # load the hashes list from file after server crash
    def load_hashes(self, board_id):
        file_path = 'data/hashes/hash_'+str(board_id)+'.json'
        if exists(file_path):
            with open(file_path, 'r') as f:
                self.hashes = json.load(f)
                f.close()

    # save the hashes list 
    def save_hashes(self, board_id):
        file_path = 'data/hashes/hash_'+str(board_id)+'.json'
        with open(file_path,'w+') as f:
            json.dump(self.hashes, f)
            f.close()

        
                    

                    
