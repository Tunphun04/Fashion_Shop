// prisma.config.ts
import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',  // đường dẫn đến schema của bạn
  migrations: {
    path: 'prisma/migrations',     // thư mục migration
  },
  datasource: {
    url: env('DATABASE_URL'),      // ĐẶT URL Ở ĐÂY
  },
});