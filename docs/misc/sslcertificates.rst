================
SSL Certificates
================

The servers communicate over HTTPs and thus need valid SSL
certificates. The certificates used for Ordinos consist of a
``key.pem`` and a ``cert.pem`` file located at
``certificate_localhost/`` (for local runs and tests, the servers can
use the same certificate). Self signed certs are sufficient for
development in a local environment. For more information visit `the
nodejs docs on HTTPs server
<https://nodejs.org/en/knowledge/HTTP/servers/how-to-create-a-HTTPS-server/>`_.

Creating SSL Certificates
-------------------------

Switch to the directory you want to the create the SSL certificates
for (Ordinos expects the certificate at located at
``certificate_localhost/``). You need to create two files, the
certificate file ``cert.pem`` and the key file ``key.pem``. 

.. warning::
    The common name of the certificate must be ``localhost``.

The files can be created as follows:

Create SSL Certificates via OpenSSL
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Download OpenSSL and make sure you can run the program from a
terminal. Run OpenSSL in a terminal and run the following commands:

.. code-block:: bash

    openssl genrsa -out key.pem
    openssl req -new -key key.pem -out csr.pem
    openssl x509 -req -days 9999 -in csr.pem -signkey key.pem -out cert.pem
    rm csr.pem # optional, removes the csr.pem file

Create SSL Certificates by Hand
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

You can use the config file provided below (`source
<https://gist.github.com/andrewconnell/6c2c14e80ef45b232d11e2f4706489b5>`_).
It sets the default, excepts for the mail address, but you can add them
in your own script.

.. code-block:: ini

    [ req ]
    default_bits        = 2048
    default_keyfile     = key.pem
    distinguished_name  = req_distinguished_name
    req_extensions      = req_ext
    x509_extensions     = x509_ext
    string_mask         = utf8only

    [ req_distinguished_name ]
    countryName         = Country Name (2 letter code)
    countryName_default = DE

    stateOrProvinceName         = State or Province Name (full name)
    stateOrProvinceName_default = BW

    localityName          = Locality Name (eg, city)
    localityName_default  = Stuttgart

    organizationName         = Organization Name (eg, company)
    organizationName_default = Universitaet Stuttgart

    commonName          = Common Name (e.g. server FQDN or YOUR name)
    commonName_default  = localhost

    emailAddress         = Email Address
    emailAddress_default = 

    # Section x509_ext is used when generating a self-signed certificate. I.e., openssl req -x509 ...
    [ x509_ext ]

    subjectKeyIdentifier    = hash
    authorityKeyIdentifier  = keyid,issuer

    # You only need digitalSignature below. *If* you don't allow
    #   RSA Key transport (i.e., you use ephemeral cipher suites), then
    #   omit keyEncipherment because that's key transport.
    basicConstraints  = CA:FALSE
    keyUsage          = digitalSignature, keyEncipherment
    subjectAltName    = @alternate_names
    nsComment         = "OpenSSL Generated Certificate"

    # RFC 5280, Section 4.2.1.12 makes EKU optional
    #   CA/Browser Baseline Requirements, Appendix (B)(3)(G) makes me confused
    #   In either case, you probably only need serverAuth.
    # extendedKeyUsage  = serverAuth, clientAuth

    # Section req_ext is used when generating a certificate signing request. I.e., openssl req ...
    [ req_ext ]

    subjectKeyIdentifier        = hash

    basicConstraints    = CA:FALSE
    keyUsage            = digitalSignature, keyEncipherment
    subjectAltName      = @alternate_names
    nsComment           = "OpenSSL Generated Certificate"
    [ alternate_names ]
    DNS.1       = localhost
    DNS.2       = 127.0.0.1
