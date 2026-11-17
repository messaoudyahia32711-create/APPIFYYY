# Appify 🚀 - من موقع ويب إلى تطبيق جوال أصلي

منصة حديثة ومتكاملة لتحويل أي موقع ويب أو متجر إلكتروني إلى تطبيق جوال (Android & iOS) مع شريط تنقل أصلي، شاشات افتتاحية (Splash Screen)، جسر برمجيات (Native Bridge)، ودعم الإشعارات الفورية.

---

## 🛠️ التقنيات المستخدمة (Tech Stack)

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Server Components)
- **UI Library**: React 19, Tailwind CSS v4, Lucide React, Radix UI (shadcn/ui)
- **Database**: PostgreSQL عبر [Supabase](https://supabase.com/)
- **ORM**: [Prisma ORM](https://www.prisma.io/) مع دعم مجمع الاتصالات (Connection Pooling)
- **State Management**: Zustand مع LocalStorage Persistence
- **Deployment**: [Vercel](https://vercel.com/)

---

## 📋 دليل التجهيز والرفع خطوة بخطوة

### 1️⃣ الرفع على GitHub

1. تأكد من وجود حساب على [GitHub](https://github.com/) وقم بإنشاء مستودع جديد باسم `appify` (بدون تفعيل خيار إضافة README أو .gitignore افتراضي لأننا جهزناها مسبقاً).
2. افتح موجه الأوامر (Terminal / PowerShell) في مجلد المشروع ونفذ:

```bash
# التأكد من إعداد الفرع الرئيسي main
git branch -M main

# ربط المستودع بمستودع GitHub الخاص بك (استبدل الرابط برابط مستودعك)
git remote add origin https://github.com/YOUR_USERNAME/appify.git

# إضافة التعديلات وحفظها
git add .
git commit -m "feat: prepare project for GitHub, Supabase and Vercel"

# رفع المشروع إلى GitHub
git push -u origin main
```

---

### 2️⃣ إعداد قاعدة البيانات على Supabase

1. أنشئ حساباً أو سجّل الدخول إلى [Supabase](https://supabase.com/).
2. اضغط على **"New Project"** واختر اسماً لمشروعك وكلمة مرور قوية لقاعدة البيانات (`Database Password`).
3. بعد اكتمال إنشاء المشروع، توجه إلى:
   - **Project Settings** (أيقونة الترس أسفل القائمة الجانبية) -> **Database**
   - انتقل إلى قسم **Connection string**:
     - اختر تبويب **URI** وفعل خيار **Connection Pooling** (وضع Transaction أو Session - المنفذ 6543) لنسخ `DATABASE_URL`.
     - ثم اختر تبويب **Direct** (المنفذ 5432) لنسخ `DIRECT_URL`.
4. **تطبيق الجداول في قاعدة البيانات** (يمكنك الاختيار بين طريقتين):
   - **الطريقة الأولى (مباشرة عبر المتصفح - موصى بها):**
     1. في لوحة تحكم Supabase، اضغط على **SQL Editor** من القائمة الجانبية.
     2. افتح ملف `supabase/schema.sql` الموجود في المشروع وانسخ محتواه بالكامل.
     3. الصقه في محرر الـ SQL واضغط **Run**. سيتم إنشاء كافة الجداول، الفهارس، وسياسات الأمان (RLS) فوراً.
   - **الطريقة الثانية (عبر موجه الأوامر بواسطة Prisma):**
     1. ضع روابط الاتصال في ملف `.env` المحلي.
     2. نفّذ الأمر التالي:
        ```bash
        npx prisma db push
        ```

---

### 3️⃣ النشر على Vercel

1. توجّه إلى [Vercel](https://vercel.com/) وسجّل الدخول بحساب GitHub الخاص بك.
2. اضغط على **"Add New..."** ثم **"Project"**.
3. اختر مستودع `appify` واضغط **"Import"**.
4. سيتعرف Vercel تلقائياً على إعدادات Next.js (تم تضمين ملف `vercel.json` جاهز).
5. في قسم **Environment Variables** (متغيرات البيئة)، أضف المتغيرات التالية (موجودة كنموذج في `.env.example`):
   - `DATABASE_URL`: رابط Supabase Connection Pooler (منفذ 6543 مع `?pgbouncer=true`).
   - `DIRECT_URL`: رابط Supabase Direct Connection (منفذ 5432).
   - `NEXT_PUBLIC_SUPABASE_URL`: رابط مشروع Supabase (مثال: `https://xxxx.supabase.co`).
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: مفتاح الـ Anon Key من قسم API.
   - `NEXTAUTH_SECRET`: سلسلة نصية عشوائية للأمان (يمكن توليدها عبر `openssl rand -base64 32`).
   - `NEXTAUTH_URL`: رابط موقعك على Vercel (مثال: `https://appify.vercel.app`).
6. اضغط **"Deploy"** وخلال دقيقة واحدة سيكون موقعك منشوراً ويعمل على الإنترنت!

> **ملاحظة حول بناء ملفات APK:**  
> بناء حزم APK الأصلية محلياً يتطلب حزمة Android SDK المرفقة مع بيئة بايثون. في بيئة Vercel Serverless (التي تضع حداً أقصى 250 ميجابايت للدوال السحابية)، يمكنك تحميل حزمة المصدر الكاملة للمشروع كملف ZIP بضغطة زر واحدة من لوحة التحكم، أو توجيه مسار البناء إلى خادم مخصص عبر متغير البيئة `APK_BUILDER_SERVICE_URL`.

---

### 💻 التشغيل والتطوير المحلي (Local Development)

```bash
# 1. تثبيت الحزم
npm install

# 2. إنشاء ملف البيئة المحلي
cp .env.example .env
# (قم بتعبئة بيانات Supabase في ملف .env)

# 3. توليد عميل Prisma
npx prisma generate

# 4. تشغيل خادم التطوير
npm run dev
```

افتح المتصفح على: [http://localhost:3000](http://localhost:3000)

---

## 📁 هيكلية المشروع الأساسية

```
├── prisma/
│   └── schema.prisma       # مخطط قاعدة البيانات لـ PostgreSQL و Supabase
├── supabase/
│   └── schema.sql          # سكريبت SQL جاهز للتشغيل المباشر في Supabase
├── src/
│   ├── app/                # صفحات ومسارات Next.js App Router
│   │   ├── api/            # نقاط النهاية (فحص المواقع، بناء الحزم)
│   │   └── page.tsx        # الواجهة التفاعلية الرئيسية
│   ├── components/         # مكونات واجهة المستخدم (Shadcn + Appify)
│   └── lib/                # إدارة الحالة والتوجيه وقاعدة البيانات
├── scripts/
│   └── apk_builder.py      # سكريبت بايثون لبناء وتوقيع حزم APK
├── .env.example            # نموذج متغيرات البيئة المشروح
└── vercel.json             # إعدادات النشر على منصة Vercel
```
