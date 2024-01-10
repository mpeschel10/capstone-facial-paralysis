#!/bin/sh

# Load secret keys for signing JWTs etc.
. secrets/secrets.env

# Confirm database is running.
systemctl is-active --quiet mariadb || sudo systemctl start mariadb

# To allow the test.py script to shut down the server,
#  save our process id to test/run/server_pid.
mkdir -p test/run
echo $$ > test/run/server_pid

npm run dev
