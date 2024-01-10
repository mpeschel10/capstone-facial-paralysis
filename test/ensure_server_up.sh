#!/bin/sh

REPO_DIR=$(git rev-parse --show-toplevel)
PID_PATH="${REPO_DIR}/test/run/server_pid"

# Get PID last used by server, if it exists.
PID=$([ -f "${PID_PATH}" ] && cat "${PID_PATH}" || echo 0)

# Launch server if no process with that PID exists. Not watertight, but good enough.
ps -p $PID >& /dev/null || gnome-terminal -- "${REPO_DIR}/test/run_server.sh"
