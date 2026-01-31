'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Building2,
  Bell,
  Shield,
  CreditCard,
  Save,
  Upload,
  Mail,
  Phone,
  MapPin,
  FileText,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Button,
  Input,
  Badge,
} from '@/components/ui';

const tabs = [
  { id: 'profile', label: 'الملف الشخصي', icon: <User className="h-4 w-4" /> },
  { id: 'factory', label: 'بيانات المصنع', icon: <Building2 className="h-4 w-4" /> },
  { id: 'notifications', label: 'الإشعارات', icon: <Bell className="h-4 w-4" /> },
  { id: 'security', label: 'الأمان', icon: <Shield className="h-4 w-4" /> },
  { id: 'billing', label: 'الفواتير', icon: <CreditCard className="h-4 w-4" /> },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = React.useState('profile');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">الإعدادات</h1>
        <p className="text-muted-foreground">
          إدارة حسابك وإعدادات مصنعك
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Sidebar Tabs - Liquid Glass */}
        <Card variant="liquid" className="lg:w-64 shrink-0">
          <CardContent className="p-2">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-foreground text-background'
                      : 'text-muted-foreground hover:bg-foreground/5 hover:text-foreground'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </nav>
          </CardContent>
        </Card>

        {/* Content */}
        <div className="flex-1 space-y-6">
          {activeTab === 'profile' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Card variant="liquid">
                <CardHeader>
                  <CardTitle>الملف الشخصي</CardTitle>
                  <CardDescription>معلومات مسؤول الحساب</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-foreground text-background text-2xl font-bold">
                      أ
                    </div>
                    <div>
                      <Button variant="outline" size="sm">
                        <Upload className="ml-2 h-4 w-4" />
                        تغيير الصورة
                      </Button>
                      <p className="mt-1 text-xs text-muted-foreground">
                        JPG, PNG أو GIF. الحد الأقصى 2MB
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input label="الاسم الكامل" defaultValue="أحمد محمد العتيبي" />
                    <Input label="المنصب" defaultValue="مدير العمليات" />
                    <Input
                      label="البريد الإلكتروني"
                      type="email"
                      defaultValue="ahmed@alnoor-aluminum.com"
                      leftIcon={<Mail className="h-4 w-4" />}
                    />
                    <Input
                      label="رقم الجوال"
                      defaultValue="0501234567"
                      leftIcon={<Phone className="h-4 w-4" />}
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button>
                      <Save className="ml-2 h-4 w-4" />
                      حفظ التغييرات
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === 'factory' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Card variant="liquid">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>بيانات المصنع</CardTitle>
                      <CardDescription>معلومات مصنعك على المنصة</CardDescription>
                    </div>
                    <Badge variant="success">موثق</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label="اسم المصنع"
                      defaultValue="مصنع النور للألمنيوم"
                      leftIcon={<Building2 className="h-4 w-4" />}
                    />
                    <Input
                      label="السجل التجاري"
                      defaultValue="1010123456"
                      leftIcon={<FileText className="h-4 w-4" />}
                      disabled
                    />
                    <Input
                      label="المدينة"
                      defaultValue="الرياض"
                      leftIcon={<MapPin className="h-4 w-4" />}
                    />
                    <Input label="المنطقة الصناعية" defaultValue="المنطقة الصناعية الثانية" />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">نوع الصناعة</label>
                    <div className="flex flex-wrap gap-2">
                      {['المعادن والتصنيع', 'الألمنيوم', 'التشكيل'].map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">وصف المصنع</label>
                    <textarea
                      className="w-full rounded-xl border border-border/50 bg-background/50 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-all"
                      rows={4}
                      defaultValue="مصنع متخصص في تصنيع منتجات الألمنيوم عالية الجودة، نخدم السوق السعودي منذ 15 عاماً."
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button>
                      <Save className="ml-2 h-4 w-4" />
                      حفظ التغييرات
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Verification Documents */}
              <Card variant="liquid">
                <CardHeader>
                  <CardTitle>وثائق التحقق</CardTitle>
                  <CardDescription>الوثائق المرفوعة للتحقق من المصنع</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { name: 'السجل التجاري', status: 'verified', date: '2025-01-15' },
                      { name: 'رخصة التشغيل', status: 'verified', date: '2025-01-15' },
                      { name: 'شهادة الجودة ISO', status: 'pending', date: '2025-01-18' },
                    ].map((doc) => (
                      <div
                        key={doc.name}
                        className="flex items-center justify-between rounded-xl border border-border/50 p-3"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{doc.name}</p>
                            <p className="text-xs text-muted-foreground">
                              تاريخ الرفع: {new Date(doc.date).toLocaleDateString('ar-SA')}
                            </p>
                          </div>
                        </div>
                        <Badge variant={doc.status === 'verified' ? 'success' : 'warning'}>
                          {doc.status === 'verified' ? 'موثق' : 'قيد المراجعة'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === 'notifications' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card variant="liquid">
                <CardHeader>
                  <CardTitle>إعدادات الإشعارات</CardTitle>
                  <CardDescription>تحكم في الإشعارات التي تصلك</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    {
                      title: 'طلبات الشراء الجماعي',
                      description: 'إشعارات عند إنشاء طلبات جديدة أو تحديث الطلبات',
                      email: true,
                      push: true,
                    },
                    {
                      title: 'حجوزات المعدات',
                      description: 'إشعارات عند طلب حجز معداتك أو تأكيد الحجز',
                      email: true,
                      push: true,
                    },
                    {
                      title: 'التقارير الأسبوعية',
                      description: 'ملخص أسبوعي لنشاط مصنعك على المنصة',
                      email: true,
                      push: false,
                    },
                    {
                      title: 'العروض والتحديثات',
                      description: 'عروض خاصة وتحديثات جديدة من المنصة',
                      email: false,
                      push: false,
                    },
                  ].map((item) => (
                    <div
                      key={item.title}
                      className="flex items-center justify-between rounded-xl border border-border/50 p-4"
                    >
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            defaultChecked={item.email}
                            className="h-4 w-4 rounded border-border"
                          />
                          بريد
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            defaultChecked={item.push}
                            className="h-4 w-4 rounded border-border"
                          />
                          تنبيه
                        </label>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === 'security' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Card variant="liquid">
                <CardHeader>
                  <CardTitle>تغيير كلمة المرور</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input label="كلمة المرور الحالية" type="password" />
                  <Input label="كلمة المرور الجديدة" type="password" />
                  <Input label="تأكيد كلمة المرور" type="password" />
                  <Button>تحديث كلمة المرور</Button>
                </CardContent>
              </Card>

              <Card variant="liquid">
                <CardHeader>
                  <CardTitle>المصادقة الثنائية</CardTitle>
                  <CardDescription>أضف طبقة حماية إضافية لحسابك</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">المصادقة عبر الجوال</p>
                      <p className="text-sm text-muted-foreground">
                        استخدم تطبيق المصادقة للتحقق من هويتك
                      </p>
                    </div>
                    <Button variant="outline">تفعيل</Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === 'billing' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Card variant="liquid">
                <CardHeader>
                  <CardTitle>الاشتراك الحالي</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between rounded-xl bg-foreground/5 p-4">
                    <div>
                      <p className="text-lg font-bold">الباقة المميزة</p>
                      <p className="text-sm text-muted-foreground">
                        1,500 ريال / شهرياً
                      </p>
                    </div>
                    <Badge variant="success">نشط</Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    التجديد التالي: 15 فبراير 2026
                  </p>
                </CardContent>
              </Card>

              <Card variant="liquid">
                <CardHeader>
                  <CardTitle>سجل الفواتير</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[
                      { date: '2026-01-15', amount: 150000, status: 'paid' },
                      { date: '2025-12-15', amount: 150000, status: 'paid' },
                      { date: '2025-11-15', amount: 150000, status: 'paid' },
                    ].map((invoice, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between rounded-xl border border-border/50 p-3"
                      >
                        <div>
                          <p className="font-medium">
                            فاتورة {new Date(invoice.date).toLocaleDateString('ar-SA')}
                          </p>
                          <p className="text-sm text-muted-foreground font-numbers">
                            {(invoice.amount / 100).toLocaleString('ar-SA')} ريال
                          </p>
                        </div>
                        <Badge variant="success">مدفوعة</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
