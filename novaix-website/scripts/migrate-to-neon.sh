#!/usr/bin/env bash
#
# Chuyển dữ liệu từ Postgres local (Docker) sang Neon.
#
# Dùng chính psql/pg_dump BÊN TRONG container nên máy bạn không cần cài
# PostgreSQL client. Container có sẵn đường ra Internet.
#
#   bash scripts/migrate-to-neon.sh "postgresql://user:pass@ep-xxx-pooler.<region>.aws.neon.tech/neondb?sslmode=require"
#
set -euo pipefail

NEON_URL="${1:-}"
CONTAINER="${CONTAINER:-oalpha-postgres}"
LOCAL_USER="${LOCAL_USER:-oalpha}"
LOCAL_DB="${LOCAL_DB:-oalpha}"

if [ -z "$NEON_URL" ]; then
  echo "Thiếu tham số: chuỗi kết nối Neon." >&2
  echo "Ví dụ: bash scripts/migrate-to-neon.sh \"postgresql://...neon.tech/neondb?sslmode=require\"" >&2
  exit 1
fi

case "$NEON_URL" in
  *neon.tech*) ;;
  *) echo "Chuỗi kết nối không chứa 'neon.tech' — kiểm tra lại." >&2; exit 1 ;;
esac

echo "==> 1/4 Kiểm tra kết nối tới Neon"
docker exec "$CONTAINER" psql "$NEON_URL" -c "SELECT version();" >/dev/null
echo "    OK"

echo "==> 2/4 Kiểm tra bảng đã tồn tại trên Neon (phải chạy 'npm run db:push' trước)"
TABLES=$(docker exec "$CONTAINER" psql "$NEON_URL" -t -A -c \
  "SELECT count(*) FROM information_schema.tables WHERE table_schema='public';")
if [ "$TABLES" -lt 5 ]; then
  echo "    Neon mới có $TABLES bảng. Hãy đổi DATABASE_URL trong .env sang Neon rồi chạy:" >&2
  echo "      npm run db:push" >&2
  exit 1
fi
echo "    Neon đang có $TABLES bảng"

echo "==> 3/4 Kiểm tra Neon còn rỗng (tránh ghi đè dữ liệu có sẵn)"
ROWS=$(docker exec "$CONTAINER" psql "$NEON_URL" -t -A -c \
  "SELECT (SELECT count(*) FROM users) + (SELECT count(*) FROM articles) + (SELECT count(*) FROM site_settings);")
if [ "$ROWS" -ne 0 ]; then
  echo "    Neon đã có $ROWS bản ghi. Dừng lại để bạn tự quyết định." >&2
  echo "    Muốn ghi đè thì xóa dữ liệu trên Neon trước, rồi chạy lại." >&2
  exit 1
fi
echo "    Neon đang rỗng"

echo "==> 4/4 Chuyển dữ liệu"
# --data-only vì schema đã do drizzle-kit tạo.
# --no-owner để không cần vai trò 'oalpha' tồn tại trên Neon.
# Bỏ activity_logs: là nhật ký thao tác của môi trường dev, không đáng mang lên.
docker exec "$CONTAINER" pg_dump -U "$LOCAL_USER" -d "$LOCAL_DB" \
  --data-only --no-owner --no-privileges \
  --exclude-table-data=activity_logs \
  > /tmp/oalpha-data.sql

docker exec -i "$CONTAINER" psql "$NEON_URL" -v ON_ERROR_STOP=1 -q < /tmp/oalpha-data.sql

echo
echo "==> Đối chiếu số bản ghi"
docker exec "$CONTAINER" psql "$NEON_URL" -c \
  "SELECT 'users' AS bang, count(*) FROM users
   UNION ALL SELECT 'article_categories', count(*) FROM article_categories
   UNION ALL SELECT 'articles', count(*) FROM articles
   UNION ALL SELECT 'site_settings', count(*) FROM site_settings
   ORDER BY 1;"

echo "Xong. Bản sao lưu nằm ở /tmp/oalpha-data.sql (trong Git Bash)."
