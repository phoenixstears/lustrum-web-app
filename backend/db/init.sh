
set -e

for file in /docker-entrypoint-initdb.d/init/*.sql; do
  echo "Running $file"
  psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f "$file"
done
