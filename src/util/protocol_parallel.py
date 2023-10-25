from src.protocols.protocol import Protocol
from src.crypto.abb import Ciphertext
import traceback

import logging
log = logging.getLogger(__name__)

class ParallelProtocol(Protocol):
    """ 
    The same protocol is used for different inputs.
    Given a list of input arguments, the protocol is executed on each argument seperatly and returns a list of output arguments.
    """

    def __init__(self, protocol : Protocol):
        super().__init__()
        self.protocol = protocol

    def run(self, inputs: list):
        results = {}
        # TODO: this could be executed parallel.
        for i in range(len(inputs)):
            results[i] = self.run_subprotocol(self.protocol, inputs[i])[0]

        # serialize result
        for i in range(len(results)):
            for j in range(len(results[i])):
                if(isinstance(results[i][j], Ciphertext)):
                    results[i][j] = results[i][j].serialize()
        return [results]
    
    def run_subprotocol(self, protocol: Protocol, args):
        protocol.init_from_protocol(self)
        return protocol.start(args)

    def start(self, args: list):
        try:
            for arg in args:
                for el in arg:
                    if isinstance(el, Ciphertext):
                        el.abb = self.abb
            out = self.run(args)
            if self.top_protocol:
                self.output_func(out)
            return out
        except Exception as e:
            if self.top_protocol:
                log.error('{}'.format(e))
                if log.getEffectiveLevel() == logging.DEBUG:
                    traceback.print_exception(Exception, e, e.__traceback__)
                exit()
            else:
                raise(e)