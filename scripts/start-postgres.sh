#!/usr/bin/env bash

if ! pg_ctl status >/dev/null 2>&1; then
	pg_ctl start -l "$PGLOG" -o "--unix_socket_directories='$PGHOST'" --no-wait
else
	echo "postgres server is already running"
fi
