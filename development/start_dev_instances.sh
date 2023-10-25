#!/bin/bash

nohup node ../peerserver/peers.js > peerserver.out &
cd ..
nohup python3 start_as_server.py > ./development/as.out &
nohup python3 start_bb_server.py > ./development/bb.out &
nohup python3 start_trustee_server.py > ./development/trustee.out &
cd development
cd ../gui/app
nohup npx quasar dev > ../../development/gui.out &
cd ../website
nohup npx quasar dev > ../../development/website.out &
