from socket import socket, AF_INET, SOCK_STREAM
import logging

log = logging.getLogger(__name__)

MSG_END = 'END'

class ServerConnector():

    def __init__(self, socket, addr):
        self.socket = socket
        self.addr = addr

    def connect(self):
        sock = socket(AF_INET, SOCK_STREAM)
        log.debug('Trying to connect with {} on port {}...'.format(self.name, self.port))
        sock.connect((self.name, self.port))
        self.connection = sock
        log.debug('Connected!')

    def send(self, msg):
        self.connection.send('{}{}'.format(msg, MSG_END))

    def receive(self):
        s = ""
        while not MSG_END in s:
            s += self.connection.recv(1024)
        return s.split(MSG_END)[0]