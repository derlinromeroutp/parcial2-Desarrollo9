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
# --user "$(id -u):$(id -g)": run as the invoking host user so dump files
# are host-owned (not root-owned), which matters for the retention `rm -rf`
# below -- a root-owned dump can't be pruned by a later non-root run. The
# mongo image's entrypoint only auto-drops mongo*-prefixed commands to the
# "mongodb" user when started as uid 0, so running as a non-root uid already
# avoids that; `sh -c` is kept as belt-and-suspenders.
docker run --rm --network host --user "$(id -u):$(id -g)" \
  -v "$DEST:/dump" \
  mongo:6-jammy \
  sh -c 'mongodump --uri="$1" --out=/dump --gzip' -- "$MONGODB_URI"

echo "[backup] Pruning snapshots older than $RETENTION_DAYS days in $BACKUP_ROOT"
find "$BACKUP_ROOT" -mindepth 1 -maxdepth 1 -type d -mtime +"$RETENTION_DAYS" -print -exec rm -rf {} +

echo "[backup] Done: $DEST"
