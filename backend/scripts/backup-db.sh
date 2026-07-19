#!/usr/bin/env bash
# Creates a timestamped mongodump snapshot and prunes snapshots older than
# RETENTION_DAYS. Uses the mongodump/mongorestore tools bundled in the
# mongo:6-jammy image via `docker run --network host`, so no local install
# of the MongoDB Database Tools is required.
set -euo pipefail

MONGODB_URI="${MONGODB_URI:-mongodb://localhost:27017/safetech}"
BACKUP_ROOT="${BACKUP_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)/backups}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"
TIMESTAMP="$(date -u +%Y%m%dT%H%M%SZ)"
DEST="$BACKUP_ROOT/$TIMESTAMP"

mkdir -p "$DEST"

echo "[backup] Dumping $MONGODB_URI -> $DEST"
# --user root + `sh -c`: the mongo image's entrypoint auto-drops any
# mongo*-prefixed command (mongodump included) to the "mongodb" user when
# started as root, regardless of --user, which then can't write into a host
# bind mount owned by the invoking user's UID. Routing through `sh -c` keeps
# the entrypoint from recognizing/re-dropping the command, so it stays root.
docker run --rm --network host --user root \
  -v "$DEST:/dump" \
  mongo:6-jammy \
  sh -c 'mongodump --uri="$1" --out=/dump --gzip' -- "$MONGODB_URI"

echo "[backup] Pruning snapshots older than $RETENTION_DAYS days in $BACKUP_ROOT"
find "$BACKUP_ROOT" -mindepth 1 -maxdepth 1 -type d -mtime +"$RETENTION_DAYS" -print -exec rm -rf {} +

echo "[backup] Done: $DEST"
