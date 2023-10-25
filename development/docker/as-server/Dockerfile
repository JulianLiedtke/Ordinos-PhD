FROM python:latest

WORKDIR /data

COPY start_as_server.py .

COPY src ./src

COPY certificate_localhost ./certificate_localhost

COPY data ./data

RUN pip install gmpy2 numpy pyaml requests

CMD [ "/bin/sh", "-c", "python ./start_as_server.py -p ${PORT}" ]