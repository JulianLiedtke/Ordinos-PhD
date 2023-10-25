FROM python:latest

WORKDIR /data

COPY start_bb_server.py .

COPY src ./src

COPY certificate_localhost ./certificate_localhost

RUN pip install gmpy2 numpy pyaml requests

CMD [ "/bin/sh", "-c", "python ./start_bb_server.py -p ${PORT}" ]