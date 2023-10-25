import argparse
import logging
from time import sleep
from src.election.trustee.trustee_server import TrusteeWebserver
from src.util.logging import setup_logging

def convert_log_level(log_level):
    if log_level == "DEBUG":
        return logging.DEBUG
    elif log_level == "INFO":
        return logging.INFO
    elif log_level == "WARNING":
        return logging.WARNING
    elif log_level == "ERROR":
        return logging.ERROR
    elif log_level == "CRITICAL":
        return logging.CRITICAL

"""
Create a new server which will run in a separte thread to represent one Trustee
"""
if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument("-p", "--port", type=int, dest="ports", action="append", help="Port which the server listens to.")
    parser.add_argument("--host", action="store", default="", help="Host which the server binds to.")
    parser.add_argument("--log_level", action="store", choices=["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"], help="Log level of the started server.")
    args = parser.parse_args()
    internal_log_level = convert_log_level(args.log_level)
    setup_logging(internal_log_level)
    servers = []
    print(args)
    if not args.ports:
        ports = [9003, 9004, 9005]
    else:
        ports = args.ports
    for port in ports:
        webserver = TrusteeWebserver(host=args.host, port=port, separate_thread=True)
        servers.append(webserver)
    try:
        while True:
            sleep(0.5)
    except KeyboardInterrupt:
        pass
