#!/bin/sh

# To allow the test.py script to shut down the server,
#  save our process id to test/run/server_pid.
mkdir -p test/run
echo $$ > test/run/server_pid

npm run dev-mark
