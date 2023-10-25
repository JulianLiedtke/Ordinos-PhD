===============
Development
===============

This page is a guide for setting up a simple election instance
containing all required servers on a local machine.

Templates
======================

The ``development`` folder contains useful scripts for starting and
monitoring a non-distributed local election instance. Optionally the
full stack can be built and started using ``docker compose``.

**Make sure to** ``cd development``.

After following the :doc:`setup` guide the ``development/start_dev_instances.sh`` script can start:

- An election authority server (port ``:9001``)
- A bulletin board server (port ``:9002``)
- Three trustee servers (port ``:9003 :9004 :9005``)
- The node peerserver (port ``:9000``)
- GUI website frontend server (port ``:8080``)
- GUI app frontend server (port ``:8081``)

**The assigned default ports can differ based on the system and already used ports**

Currently used ports can be convinently displayed with ``netstat -pnltu``.

Monitoring
======================

All instances are started using ``nohup`` and write their ``stdout``
in their respective ``.out`` file.
 
The recent ``stdout`` logs of all started server instances can be
viewed with the script: ``development/print_outs.sh``. Please check
the last write operation on the respective log files to ensure the
logs content is relevant.

Restarting all Servers
======================

Current active instances can be viewed with ``lsof *`` in the
``development`` folder.

All dev instances can be terminated with ``kill $(lsof *)`` in the
``development`` folder.

**This requires that the script was invoked the** ``development`` **folder.**

Developing with Docker Compose
===============================

All Docker artifacts are available in the ``development/docker`` folder.

The following components can be built and started with ``docker compose build && docker compose up``, similar to the standalone script (``external port : internal port``):

- An election authority server (port ``0.0.0.0:9001:9000``)
- A bulletin board server (port ``0.0.0.0:9002:9000``)
- Three trustee servers (port ``0.0.0.0:9003:9000``, ``0.0.0.0:9004:9000``, ``0.0.0.0:9005:9000``)
- The node peerserver (port ``0.0.0.0:9000:9000``)
- GUI website frontend server (port ``0.0.0.0:8080:8080``)
- GUI app frontend server (port ``0.0.0.0:8081:8081``)

The only perquisite is to install Docker and generate the required
certificates as described in :doc:`sslcertificates`, not the full
:doc:`setup`. The certificates are then copied to the built Docker
images.

**Important**: All files are copied in the docker image on build, this
means caution regarding the created file sizes. For every build a
large image for every component is created. Those can be explored with
``docker image ls``:

.. code-block:: sh

    REPOSITORY                     TAG       IMAGE ID       CREATED             SIZE
    docker_gui-app                 latest    8e7693e1c949   8 minutes ago       1.22GB
    docker_as-server               latest    90d150503c4d   9 minutes ago       1.03GB
    <none>                         <none>    c9a07efa6d44   58 minutes ago      1.22GB
    docker_gui-website             latest    27f372a2a6fe   58 minutes ago      1.19GB
    docker_peerserver              latest    f960e8a2fa7c   About an hour ago   927MB
    docker_bb-server               latest    0303e57d4661   2 hours ago         1.03GB
    docker_first-trustee-server    latest    1b7b7bd70419   2 hours ago         1.03GB
    docker_second-trustee-server   latest    1b7b7bd70419   2 hours ago         1.03GB
    docker_third-trustee-server    latest    1b7b7bd70419   2 hours ago         1.03GB
    <none>                         <none>    0101fcc3b695   2 hours ago         1.03GB
    python                         latest    b62e4294564c   6 days ago          922MB

It is recommended to delete unused images with ``docker image prune``, here the images without the names: ``<none>``.

For developing with hot-changes for the frontend servers bind mounts are used as follows:

.. code-block:: yaml

    gui-website:
      ...
      volumes:
        - ./../../gui/website:/data/gui/website
    
    gui-app:
      ...
      volumes:
        - ./../../gui/app:/data/gui/app
    
Other changes in the ``ordinos-sw`` repo are not reflected in the
containers until rebuilding. Data outside the bind mounts is
non-persistent, which means when the container is removed the data is
lost. For a persistent production deployment with Docker Swarm it is
necessary to address data persistency issues to prevent election data
loss.

CORS Requests
======================

By default cross-origin resource sharing is disabled. To allow this
security exceptions need to be made in the respective browser.

In Firefox this is possible at: ``about:preferences#privacy`` ->
Security -> View Certificates -> Servers -> Add Exception

Exceptions for all ``localhost:port`` can be added using the
previously specified ports. **Make sure to check permanently store
those exceptions.**

.. note::

  In order to add exceptions in Firefox, the corresponding ports must
  be currently in use, for example by running the servers.
