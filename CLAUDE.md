# 🏭 منصة التكامل الصناعي - CLAUDE.md

## 📋 نظرة عامة
منصة B2B تربط المصانع السعودية الصغيرة والمتوسطة لـ:
1. **الشراء الجماعي** - تجميع طلبات المواد الخام للحصول على أسعار أفضل
2. **تبادل الطاقة الإنتاجية** - تأجير المعدات والآلات غير المستغلة

## 🔧 التقنيات
- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes / Server Actions
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **State**: Zustand
- **Forms**: React Hook Form + Zod

## 📁 هيكل المشروع
```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # صفحات المصادقة
│   ├── (dashboard)/       # لوحة التحكم
│   ├── api/               # API Routes
│   └── layout.tsx         # التخطيط الرئيسي
├── components/
│   ├── ui/                # مكونات أساسية (Button, Input, etc.)
│   ├── features/          # مكونات الميزات
│   └── layouts/           # تخطيطات
├── lib/
│   ├── supabase/          # إعداد Supabase
│   ├── utils/             # دوال مساعدة
│   └── validations/       # Zod schemas
├── hooks/                 # Custom hooks
├── stores/                # Zustand stores
└── types/                 # TypeScript types
```

## ✅ القواعد الإلزامية

### 🌍 RTL والعربية
```typescript
// ✅ صحيح
<html lang="ar" dir="rtl">
className="text-right font-cairo"

// ❌ خطأ
<html lang="en">
className="text-left"
```

### 🗄️ Supabase Queries
```typescript
// ✅ صحيح - دائماً استخدم factory_id للـ multi-tenancy
const { data } = await supabase
  .from('orders')
  .select('*')
  .eq('factory_id', factoryId)

// ❌ خطأ - بدون factory_id
const { data } = await supabase
  .from('orders')
  .select('*')
```

### 🔐 المصادقة
```typescript
// ✅ صحيح - تحقق من الجلسة في Server Components
const { data: { session } } = await supabase.auth.getSession()
if (!session) redirect('/login')

// ❌ خطأ - الوصول للبيانات بدون تحقق
```

### 📝 الأنماط
```typescript
// ✅ صحيح - CSS variables للألوان
className="bg-primary text-primary-foreground"

// ❌ خطأ - ألوان ثابتة
className="bg-blue-500 text-white"
```

### 💰 المبالغ المالية
```typescript
// ✅ صحيح - تخزين بالهللات، عرض بالريالات
const priceInHalala = 150000; // 1500 ريال
const display = (priceInHalala / 100).toLocaleString('ar-SA');

// ❌ خطأ - تخزين بالريالات مباشرة
const price = 1500.00;
```

### 📅 التواريخ
```typescript
// ✅ صحيح - Hijri + Gregorian
import { formatDate } from '@/lib/utils/date';
<span>{formatDate(date, 'ar-SA')}</span>

// ❌ خطأ - تنسيق إنجليزي فقط
```

### 🏭 أنواع المصانع
```typescript
type FactoryStatus = 'pending' | 'verified' | 'suspended';
type OrderStatus = 'draft' | 'open' | 'collecting' | 'ordered' | 'delivered';
type EquipmentStatus = 'available' | 'rented' | 'maintenance';
```

## 🎨 التصميم

### الألوان الرئيسية
```css
:root {
  --primary: 142 76% 36%;      /* أخضر صناعي */
  --secondary: 221 83% 53%;    /* أزرق سعودي */
  --accent: 45 93% 47%;        /* ذهبي */
  --destructive: 0 84% 60%;    /* أحمر للتحذيرات */
}
```

### الخطوط
- **العناوين**: Cairo (Bold/SemiBold)
- **النصوص**: Cairo (Regular)
- **الأرقام**: Tajawal

## 🚫 أخطاء شائعة - لا تكررها!

1. ❌ استخدام `any` بدلاً من types محددة
2. ❌ نسيان `'use client'` للـ hooks
3. ❌ استخدام `console.log` في production
4. ❌ عدم معالجة loading states
5. ❌ تجاهل error handling في API calls
6. ❌ hardcoding URLs بدلاً من env variables
7. ❌ عدم استخدام `key` prop في loops
8. ❌ تخطي validation على الـ server side

## 📦 Commit Message Format
```
feat(module): وصف قصير بالعربية

- تفصيل 1
- تفصيل 2
```

## 🧪 قبل كل PR
```bash
npm run lint
npm run type-check
npm run build
```

## 🔗 روابط مهمة
- Supabase Dashboard: [سيُحدد]
- Figma Design: [سيُحدد]
- API Docs: /docs/api
