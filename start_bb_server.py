import argparse
import logging
from time import sleep
from src.election.bulletin_board.bulletin_board_webserver import BulletinBoardWebserver
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
Create a new server which will run in a separate thread to represent bulletin boards
"""
if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument("-p", "--port", type=int, action="store", default=9002, help="Port which the server listens to.")
    parser.add_argument("--host", action="store", default="", help="Host which the server binds to.")
    parser.add_argument("--log_level", action="store", choices=["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"], help="Log level of the started server.")
    args = parser.parse_args()
    internal_log_level = convert_log_level(args.log_level)
    setup_logging(internal_log_level)
    try:
        s = BulletinBoardWebserver(host=args.host, port=args.port)
    except KeyboardInterrupt:
        pass
