import 'dotenv/config'
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  out: './lib/drizzle',
  schema: './lib/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: 'postgresql://test_owner:npg_4fNw0cGCBXZx@ep-broad-shadow-a16bxwkb-pooler.ap-southeast-1.aws.neon.tech/test?sslmode=require',
  },
})
