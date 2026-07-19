#!/usr/bin/env bash
# Restores a mongodump snapshot produced by backup-db.sh.
#
# Defaults to a dedicated *_restore_test database rather than the real
# dev/prod database, so running a restore drill can never clobber live data
# by accident. Pass a second argument (or RESTORE_MONGODB_URI) to target a
# different database explicitly.
set -euo pipefail

SNAPSHOT="${1:?Usage: restore-db.sh <path-to-backup-dir> [target-mongodb-uri]}"
TARGET_URI="${2:-${RESTORE_MONGODB_URI:-mongodb://localhost:27017/safetech_restore_test}}"

if [ ! -d "$SNAPSHOT" ]; then
  echo "[restore] Backup directory not found: $SNAPSHOT" >&2
  exit 1
fi

# mongodump writes one subdirectory per source database (e.g. backups/<ts>/safetech/).
# Mounting that subdirectory directly (rather than the snapshot root) makes
# mongorestore treat its contents as a single database and restore them into
# whatever database is named in TARGET_URI -- regardless of the source db's
# original name. This is what lets a restore drill target an isolated
# *_restore_test database instead of silently reusing the source name.
SOURCE_DB_DIR="$(find "$SNAPSHOT" -mindepth 1 -maxdepth 1 -type d | head -n1)"
if [ -z "$SOURCE_DB_DIR" ]; then
  echo "[restore] No database directory found inside $SNAPSHOT" >&2
  exit 1
fi

echo "[restore] Restoring $SOURCE_DB_DIR -> $TARGET_URI"
# --user root + `sh -c`: see backup-db.sh for why the entrypoint would
# otherwise silently re-drop to the "mongodb" user and lose write access.
docker run --rm --network host --user root \
  -v "$SOURCE_DB_DIR:/dump" \
  mongo:6-jammy \
  sh -c 'mongorestore --uri="$1" --gzip --drop /dump' -- "$TARGET_URI"

echo "[restore] Done"
