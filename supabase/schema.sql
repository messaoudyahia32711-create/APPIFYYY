-- ==============================================================================
-- Appify Database Schema for Supabase (PostgreSQL)
-- ==============================================================================
-- يمكنك تشغيل هذا الملف مباشرة في لوحة تحكم Supabase داخل SQL Editor
-- أو استخدام Prisma عبر الأمر: npx prisma db push
-- ==============================================================================

-- تفعيل امتداد توليد المعرفات العشوائية
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- جدول المستخدمين (User)
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "email" TEXT UNIQUE NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- جدول المنشورات (Post)
CREATE TABLE IF NOT EXISTS "Post" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- جدول التطبيقات (App)
CREATE TABLE IF NOT EXISTS "App" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "packageName" TEXT,
    "version" TEXT NOT NULL DEFAULT '1.0.0',
    "versionCode" INTEGER NOT NULL DEFAULT 1,
    "config" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- جدول عمليات البناء والتصدير (Build)
CREATE TABLE IF NOT EXISTS "Build" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "appId" TEXT NOT NULL REFERENCES "App"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "platform" TEXT NOT NULL DEFAULT 'android',
    "output" TEXT NOT NULL DEFAULT 'apk',
    "version" TEXT NOT NULL,
    "versionCode" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "artifactUrl" TEXT,
    "sizeMb" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- فهارس لتحسين الأداء (Indexes)
CREATE INDEX IF NOT EXISTS "Build_appId_idx" ON "Build"("appId");
CREATE INDEX IF NOT EXISTS "Post_authorId_idx" ON "Post"("authorId");
CREATE INDEX IF NOT EXISTS "App_name_idx" ON "App"("name");

-- تفعيل ميزة Row Level Security (RLS) اختياري في Supabase
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Post" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "App" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Build" ENABLE ROW LEVEL SECURITY;

-- سياسات عامة للوصول (Policies) - يمكن تعديلها حسب الحاجة
CREATE POLICY IF NOT EXISTS "Allow read access to all" ON "User" FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Allow read access to apps" ON "App" FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Allow insert to apps" ON "App" FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Allow update to apps" ON "App" FOR UPDATE USING (true);
CREATE POLICY IF NOT EXISTS "Allow read access to builds" ON "Build" FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Allow insert to builds" ON "Build" FOR INSERT WITH CHECK (true);
