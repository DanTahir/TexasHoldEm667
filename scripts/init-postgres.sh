mkdir -p "$PGHOST"

if [ ! -d "$PGDATA" ]; then
	echo "initializing database at $PGHOST"
	initdb --auth=trust --no-locale --encoding=UTF8
	createuser poker
	# While we should probably grant more granular permissions,
	# this will work for development.
	psql -c "GRANT ALL ON SCHEMA public TO poker"
	createdb jvda-poker
fi
