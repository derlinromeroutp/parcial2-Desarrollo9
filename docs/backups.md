# Respaldos y restauración de base de datos (HU-67)

## Política de backups

- **Mecanismo**: `backend/scripts/backup-db.sh` ejecuta `mongodump` (usando el binario incluido en la imagen `mongo:6-jammy`, sin instalar herramientas adicionales en el host) contra `MONGODB_URI` y escribe un snapshot comprimido en `backups/<timestamp-UTC>/`.
- **Frecuencia**: diaria. El workflow `.github/workflows/db-backup.yml` está programado con `cron: '0 3 * * *'` (03:00 UTC).
- **Retención**:
  - Snapshots locales: `backup-db.sh` elimina automáticamente cualquier carpeta bajo `backups/` con más de `RETENTION_DAYS` (por defecto **14 días**).
  - Artefactos de CI: el ZIP del snapshot subido por el workflow se conserva **14 días** (`retention-days: 14` en `actions/upload-artifact`).
- **Automatización**: `schedule` en GitHub Actions solo se dispara desde la rama por defecto del repositorio (restricción de GitHub, no de este proyecto), por lo que el cron queda activo una vez que este workflow llega a `main`. El job también puede dispararse manualmente (`workflow_dispatch`) o, para efectos de revisión en un PR, mediante `pull_request` con `paths` filtrado a los propios scripts/workflow de backup.

### Alcance actual (importante)

Este repositorio **no tiene una base de datos de producción gestionada** (no hay `MONGODB_URI` de prod en secrets); el desarrollo usa Mongo local vía Docker. Por eso:

- El *drill* de CI respalda y restaura datos **sembrados de forma efímera** (`bun run src/seed.ts`) sobre el contenedor de Mongo del propio job, para probar que el mecanismo (dump → restore → verificación de datos) funciona de punta a punta.
- **No** está respaldando datos reales de producción hoy. Cuando exista una base de datos gestionada real, basta con apuntar `MONGODB_URI` (secret de GitHub Actions) a esa instancia para que la misma política aplique sin cambios de código.

## Cómo ejecutar un backup manualmente

```bash
cd backend
MONGODB_URI="mongodb://localhost:27017/safetech" npm run backup
```

Esto crea `backups/<timestamp>/safetech/*.bson.gz` en la raíz del repo. Variables opcionales:

- `BACKUP_ROOT`: directorio donde se guardan los snapshots (por defecto `<repo>/backups`).
- `RETENTION_DAYS`: días de retención antes de purgar snapshots viejos (por defecto `14`).

## Cómo ejecutar una restauración de prueba

Por seguridad, `restore-db.sh` restaura por defecto en una base de datos **aislada** (`safetech_restore_test`), nunca en la base de datos real, salvo que se indique explícitamente:

```bash
cd backend
npm run restore -- backups/20260718T030000Z
# o especificando un destino distinto:
npm run restore -- backups/20260718T030000Z "mongodb://localhost:27017/otra_db"
```

Para verificar que la restauración realmente trajo datos (no solo que el comando devolvió código de salida 0):

```bash
cd backend
MONGODB_URI="mongodb://localhost:27017/safetech_restore_test" bun run scripts/verify-restore.ts
```

`verify-restore.ts` se conecta a la base restaurada, valida `readyState` de la conexión explícitamente (porque `connectDB()` no lanza error en fallos de conexión) y falla (`exit 1`) si la colección `products` no tiene al menos un documento.

## Runbook de recuperación ante desastre

1. Identificar el snapshot más reciente en `backups/` (local) o el artefacto `db-backup-<run_id>` más reciente en GitHub Actions.
2. Descomprimir/descargar el snapshot si viene de un artefacto de CI.
3. Ejecutar `restore-db.sh <snapshot> <MONGODB_URI-real>` apuntando explícitamente a la base de datos de destino real (nunca se debe omitir el segundo argumento en un escenario de recuperación real).
4. Correr `verify-restore.ts` contra esa misma URI para confirmar que los datos están presentes antes de dar el incidente por resuelto.
5. `mongorestore` se ejecuta con `--drop`, por lo que la restauración reemplaza las colecciones existentes en el destino con las del snapshot — confirmar que el destino es el correcto antes de ejecutar el paso 3.
