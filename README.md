# 🏭 منصة التكامل الصناعي
<!-- Procurement Redirect Fix v1.0 -->

> منصة B2B تربط المصانع السعودية الصغيرة والمتوسطة للشراء الجماعي وتبادل الطاقة الإنتاجية

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)](https://supabase.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8)](https://tailwindcss.com/)

## 📋 المشكلة التي نحلها

| المشكلة | الحل |
|---------|------|
| 🔴 المصانع الصغيرة تشتري بسعر التجزئة | 🟢 الشراء الجماعي → خصم 15-30% |
| 🔴 40% من الطاقة الإنتاجية معطلة | 🟢 تأجير المعدات → دخل إضافي |
| 🔴 صعوبة الوصول للموردين الكبار | 🟢 منصة موحدة → SABIC & معادن |

## 🚀 البدء السريع

### المتطلبات
- Node.js 18+
- npm أو yarn
- حساب [Supabase](https://supabase.com)

### التثبيت

```bash
# Clone the repository
git clone https://github.com/your-repo/industrial-synergy-platform.git
cd industrial-synergy-platform

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Run development server
npm run dev
```

### إعداد قاعدة البيانات

1. أنشئ مشروع جديد في [Supabase](https://supabase.com)
2. انسخ URL و anon key إلى `.env.local`
3. شغّل ملف `supabase/schema.sql` في SQL Editor

## 📁 هيكل المشروع

```
industrial-synergy-platform/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # صفحات المصادقة
│   │   ├── (dashboard)/       # لوحة التحكم
│   │   │   ├── overview/      # الصفحة الرئيسية
│   │   │   ├── group-buying/  # الشراء الجماعي
│   │   │   ├── capacity-exchange/  # تبادل الطاقة
│   │   │   └── settings/      # الإعدادات
│   │   └── api/               # API Routes
│   ├── components/
│   │   ├── ui/                # مكونات أساسية
│   │   ├── features/          # مكونات الميزات
│   │   └── layouts/           # تخطيطات
│   ├── lib/
│   │   ├── supabase/          # إعداد Supabase
│   │   ├── utils/             # دوال مساعدة
│   │   └── validations/       # Zod schemas
│   ├── hooks/                 # Custom hooks
│   ├── stores/                # Zustand stores
│   └── types/                 # TypeScript types
├── supabase/
│   └── schema.sql             # Database schema
├── CLAUDE.md                  # قواعد المشروع (Boris methodology)
└── README.md
```

## 🎨 التصميم

### الألوان
- **Primary (أخضر صناعي)**: `#16a34a` - النمو والاستدامة
- **Secondary (أزرق سعودي)**: `#2563eb` - الثقة والاحترافية  
- **Accent (ذهبي)**: `#eab308` - القيمة والجودة

### الخط
- **Cairo** - خط عربي احترافي للعناوين والنصوص

## 📱 الميزات

### ✅ المرحلة الأولى (MVP)
- [x] تسجيل المصانع والتحقق
- [x] لوحة تحكم إحصائية
- [x] الشراء الجماعي (إنشاء/انضمام/متابعة)
- [x] تبادل الطاقة الإنتاجية (عرض/حجز المعدات)
- [x] إعدادات الحساب

### 🔜 المرحلة الثانية
- [ ] نظام الدفع (Moyasar / Tap)
- [ ] إشعارات فورية (Push & Email)
- [ ] تطبيق الجوال
- [ ] لوحة إدارة

## 🛠️ التقنيات

| التقنية | الاستخدام |
|---------|-----------|
| Next.js 15 | Framework |
| TypeScript | Type Safety |
| Tailwind CSS 4 | Styling |
| Supabase | Database & Auth |
| Framer Motion | Animations |
| Zustand | State Management |
| React Hook Form | Forms |
| Zod | Validation |

## 📊 نموذج الإيرادات

| المصدر | النسبة |
|--------|--------|
| عمولة الشراء الجماعي | 2-4% |
| عمولة تأجير المعدات | 10-15% |
| اشتراكات مميزة | 500-2000 ريال/شهر |
| تسهيلات التمويل | 1-2% |

## 🤝 المساهمة

نرحب بمساهماتكم! يرجى قراءة [CLAUDE.md](./CLAUDE.md) للتعرف على قواعد المشروع.

## 📄 الترخيص

MIT License - راجع [LICENSE](./LICENSE) للتفاصيل.

---

<div align="center">

**صُنع بـ ❤️ للمصانع السعودية**

[تواصل معنا](mailto:info@industrial-synergy.sa) • [الموقع](https://industrial-synergy.sa)

</div>


<!-- Admin Dashboard v1.0 -->
