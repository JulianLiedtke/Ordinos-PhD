import functools
import json
import os
import logging
from functools import partial
import secrets
from typing import Any, Dict
from http import HTTPStatus
from src.network.webserver import CustomBaseHTTPRequestHandler, HTTPSServer, require_auth

from src.election.bulletin_board.bulletin_board import BulletinBoard

log = logging.getLogger(__name__)


class BulletinBoardWebserver(HTTPSServer):
    """
    This class creates a HTTP server for the bulletin board. Upon creation it starts
    the web server.
    """

    def __init__(self, host='', port=9002, separate_thread=False):
        """
        Create a new bulletin board webserver which may host multiple bulletin boards at once.

        Args:
            host (str, optional): The host address of the server. Defaults to '' which binds to all interfaces.
            port (int, optional): The port on which the server is available. Defaults to 9002.
            separate_thread (bool, optional): Should the server run in a separate thread. Defaults to False.
        """
        self.bulletin_boards: Dict[Any, BulletinBoard] = {}
        super().__init__(partial(_BulletinBoardHTTPRequestHandler, self), host, port, separate_thread)
        
    def init_new_bulletin_board(self):
        """
        Adds a new bulletin board to the list of bulletin boards, with a newly generated id.

        Returns:
            int: The newly created id under which one can find the bulletin board.
        """
        new_id = self._generate_new_bulletin_board_id()
        new_bb = BulletinBoard()
        auth_token = secrets.token_urlsafe(32)
        new_bb.add_auth_token(auth_token, new_id)
        self.bulletin_boards[new_id] = new_bb  
        return new_id, new_bb.auth_token

    def _generate_new_bulletin_board_id(self):
        """
        Generate a bulletin board id which is not yet represented in the list of boards.

        Returns:
            int: A yet unused id for the next bulletin board
        """
        return len(self.bulletin_boards.keys())


class _BulletinBoardHTTPRequestHandler(CustomBaseHTTPRequestHandler):
    """
    This Class implements the request handling of the BulletinBoardWebserver.
    """

    def get_function_callback(self):
        get_function_callbacks = {
            "/api/getVotes": self.api_get_votes,
            "/api/getConfig": self.api_get_config,
            "/api/getConfigs": self.api_get_configs,
            "/api/getMessages": self.api_get_trustee_messages,
            "/api/getMessagesFull": self.api_get_all_messages,
            "/api/getResults": self.api_get_results
        }

        post_function_callbacks = {
            "/api/addVote": self.api_add_vote,
            "/api/addBulletinBoard": self.api_add_bulletin_board,
            "/api/addHash": self.api_add_hash,
            "/api/setConfig": self.api_set_config,
            "/api/addMessage": self.api_add_trustee_message,
            "/api/validHash": self.is_hash_valid,
            "/api/addResult": self.api_add_result
        }

        try:
            if self.command == "GET":
                path = self.path.split('?', 1)[0]
                return get_function_callbacks[path]
            elif self.command == "POST":
                return post_function_callbacks[self.path]
        except KeyError as exc:
            raise exc
        raise NotImplementedError

    def auth_check(self, board_id, **kwargs):
        self.restore_bb_if_not_existing(board_id)
        if "Authorization" in self.headers:
            auth_type, token = self.headers["Authorization"].split()
            bulletin_board = self.host_server.bulletin_boards[int(board_id)]
            log.debug("Authentication type %s given with tokens %.8s... and %.8s...",
                      auth_type, token, bulletin_board.auth_token)
            if auth_type == "Bearer" and secrets.compare_digest(token, bulletin_board.auth_token):
                return True
        else:
            log.debug("No Authorization given, but needed.")
        return False

    @require_auth
    def api_add_vote(self, board_id, vote):
        """
        Add a vote to the bulletin board.

        Args:
            board_id (int): The id of the bulletin board to which should be written.
            vote (str): The vote to be appended in serialized form.
        """
        self.restore_bb_if_not_existing(board_id)
        bulletin_board = self.host_server.bulletin_boards[int(board_id)]
        bulletin_board.add_vote(vote, board_id)
        self.write_headers_and_response(HTTPStatus.CREATED)

    def api_get_config(self, board_id):
        """
        Respond with with the serialized config of an election.

        Args:
            board_id (int): The id of the bulletin board whose config shall be fetched.
        """
        self.restore_bb_if_not_existing(board_id)
        bulletin_board = self.host_server.bulletin_boards[int(board_id)]
        config = bulletin_board.get_election_config()
        response = json.dumps(config).encode("utf-8")
        self.write_headers_and_response(HTTPStatus.OK, response, additional_headers=[('Access-Control-Allow-Origin', '*')])

    def api_get_configs(self):
        """
        Respond with with the all serialized election configs.
        """

        configs = []
        for bulletin_board in list(self.host_server.bulletin_boards.values()):
            configs.append(bulletin_board.get_election_config())

        response = json.dumps(configs).encode("utf-8")
        self.write_headers_and_response(HTTPStatus.OK, response, additional_headers=[('Access-Control-Allow-Origin', '*')])


    def api_get_votes(self, board_id):
        """
        Respond with a list of all tracked votes.

        Args:
            board_id (int): The id of the bulletin board whose votes shall be fetched.
        """
        self.restore_bb_if_not_existing(board_id)
        bulletin_board = self.host_server.bulletin_boards[int(board_id)]
        votes = bulletin_board.get_votes()

        response = {"votes": votes}
        response = json.dumps(response).encode("utf-8")
        self.write_headers_and_response(HTTPStatus.OK, response, additional_headers=[('Access-Control-Allow-Origin', '*')])

    def is_hash_valid(self, hash, board_id):
        self.restore_bb_if_not_existing(board_id)
        bulletin_board = self.host_server.bulletin_boards[int(board_id)]
        is_valid = bulletin_board.is_hash_valid(hash)
        response = {"is_valid": is_valid}
        response = json.dumps(response).encode("utf-8")
        self.write_headers_and_response(HTTPStatus.CREATED, response)

    @require_auth
    def api_set_config(self, board_id, config):
        """
        Sets the publicly available configuration of the election whose bulletin
        board has id board_id, so that it can be inquired from anywhere.

        Args:
            board_id (int): The id of the bulletin board whose config is to be set.
            config (str): The serialized config of the election.
        """
        self.restore_bb_if_not_existing(board_id)
        bulletin_board = self.host_server.bulletin_boards[int(board_id)]
        bulletin_board.set_election_config(config, board_id)
        self.write_headers_and_response(HTTPStatus.CREATED)

    def api_add_bulletin_board(self):
        """
        Add a new bulletin board to the list of bulletin boards.
        Responds with the new board_id assigned to this bulletin board.
        """
        new_id, auth_token = self.host_server.init_new_bulletin_board()

        response = {"board_id": new_id,
                    "token": auth_token}
        response = json.dumps(response).encode("utf-8")
        self.write_headers_and_response(HTTPStatus.CREATED, response, additional_headers=())

    @require_auth
    def api_add_hash(self, board_id, hash):
        """
        Add a hash value to the bulletin board.

        Args:
            board_id (int): The id of the bulletin board to which the hash should be added.
            hash (Any): The hash of the secret that was given to the user.
        """
        self.restore_bb_if_not_existing(board_id)
        bulletin_board = self.host_server.bulletin_boards[int(board_id)]
        bulletin_board.add_hash(hash, board_id)
        self.write_headers_and_response(HTTPStatus.CREATED)

    # @require_auth
    def api_add_trustee_message(self, board_id, from_id, message):
        """
        Add the given message from a trustee to his broadcast thread.

        Args:
            board_id (int): The id of the bulletin board to which the message should be added.
            from_id (int|str): The id of the trustee who wants to broadcast the message
            message (str): The message to be broadcast.
        """
        self.restore_bb_if_not_existing(board_id)
        bulletin_board = self.host_server.bulletin_boards[int(board_id)]
        bulletin_board.add_trustee_message(from_id, message)
        self.write_headers_and_response(HTTPStatus.CREATED, additional_headers=[('Access-Control-Allow-Origin', '*')])

    # @require_auth
    def api_get_trustee_messages(self, board_id, from_id, last_index=0):
        """
        Respond with the messages from a specific trustee on the given bulletin board.
        It only responds with the messages from last_index to the latest index.

        Args:
            board_id (int): The id of the bulletin board from which the messages should be read from.
            from_id (int|str): The id of the trustee who has published the messages.
            last_index (int, optional): The index of the first message that has to be sent. Defaults to 0.
        """
        self.restore_bb_if_not_existing(board_id)
        bulletin_board = self.host_server.bulletin_boards[int(board_id)]
        messages = bulletin_board.get_trustee_messages(from_id, last_index)

        response = {"messages": messages}
        response = json.dumps(response).encode("utf-8")
        self.write_headers_and_response(HTTPStatus.OK, response, additional_headers=[('Access-Control-Allow-Origin', '*')])

    def api_get_all_messages(self, board_id):
        """
        Respond with all the messages that were published to the given bulletin board.

        Args:
            board_id (int): The id of the bulletin board whose messages are to be fetched.
        """
        self.restore_bb_if_not_existing(board_id)
        bulletin_board = self.host_server.bulletin_boards[int(board_id)]

        response = {"messages": bulletin_board.trustee_messages}

        response = json.dumps(response).encode("utf-8")
        self.write_headers_and_response(HTTPStatus.OK, response, additional_headers=[('Access-Control-Allow-Origin', '*')])

    def api_get_results(self, board_id):
        self.restore_bb_if_not_existing(board_id)
        bulletin_board = self.host_server.bulletin_boards[int(board_id)]
        response = {"results": bulletin_board.results}
        response = json.dumps(response).encode("utf-8")
        self.write_headers_and_response(HTTPStatus.OK, response, additional_headers=[('Access-Control-Allow-Origin', '*')])
        

    # @require_auth
    def api_add_result(self, board_id, from_id, result):
        self.restore_bb_if_not_existing(board_id)
        bulletin_board = self.host_server.bulletin_boards[int(board_id)]
        response = {"results": bulletin_board.add_result(from_id, result)}

        response = json.dumps(response).encode("utf-8")
        self.write_headers_and_response(HTTPStatus.CREATED, response, additional_headers=[('Access-Control-Allow-Origin', '*')])
        self.move_persistent_files(board_id)
       
    
    #checks if a BB with the given board_id already exists
    #if not create a new BB with the parameters which are saved in folders auth_tokens, ballots, config and hashes
    def restore_bb_if_not_existing(self,board_id):
        if int(board_id) in self.host_server.bulletin_boards:
            return
        new_bb = BulletinBoard()
        new_bb.load_config(board_id)
        new_bb.load_votes(board_id)
        new_bb.auth_token = new_bb.load_auth_token(board_id)
        new_bb.load_hashes(board_id)
        self.host_server.bulletin_boards[int(board_id)] = new_bb

    def move_persistent_files(self, board_id):
        #moves the persistent files of a finished election in another folder so new elections dont think they crashed 
        #and we can keep the data for for future reference

        #count how man files already in directory
        new_directory = "data/past-elections/"
        count = (len([entry for entry in os.listdir(new_directory) if os.path.isfile(os.path.join(new_directory, entry))]) -1) #-1 for the gitignore
        if count != 0: 
            count = int(count/8)  #/8 for the 8 files we save in case of only 2 trustees
        #run it only once, the other runs will throw exceptions because the file was already moved so we catch it
        try:
            os.rename("data/config/as_config_"+str(board_id)+".json", os.path.join(new_directory, "as_config_"+str(count)+".json"))
            os.rename("data/config/bb_config_"+str(board_id)+".json", os.path.join(new_directory, "bb_config_"+str(count)+".json"))
            os.rename("data/ballots/ballots_"+str(board_id)+".json", os.path.join(new_directory, "ballots_"+str(count)+".json"))
            os.rename("data/auth_tokens/token_"+str(board_id)+".json", os.path.join(new_directory, "token_"+str(count)+".json"))
            os.rename("data/hashes/hash_"+str(board_id)+".json", os.path.join(new_directory, "hash_"+str(count)+".json"))
            os.rename("data/trustees/trusteeClients_"+str(board_id)+".pkl", os.path.join(new_directory, "trusteeClients_"+str(count)+".pkl"))
            for file in os.listdir("data/trustees/"):
                filename = os.fsdecode(file)
                if "trustee_"+str(board_id) in filename:
                    port = filename.split("_")[2]
                    os.rename("data/trustees/trustee_"+str(board_id)+"_"+port, os.path.join(new_directory, "trustee_"+str(count)+"_"+port))
        except:
            pass
