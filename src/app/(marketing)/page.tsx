import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button-variants';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  ShoppingCart,
  Factory,
  BarChart3,
  Shield,
  MessageCircle,
  Smartphone,
  ChevronDown,
  Check,
  Quote,
  ArrowLeft,
  Lock,
  DollarSign,
  Wrench,
  TrendingUp,
  Users,
  FileText,
  Handshake,
  Wallet,
  Star,
} from 'lucide-react';
import { FAQAccordion } from './faq-accordion';

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      {/* Section 1: Hero */}
      <section className="min-h-screen flex flex-col items-center justify-center px-4 py-20 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="secondary" className="mb-6 px-4 py-2 text-base">
            منصة سعودية 100% للقطاع الصناعي
          </Badge>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
            وفر حتى <span className="text-primary">30%</span> من تكاليف المواد الخام
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            انضم لأكثر من 500 مصنع سعودي يستفيدون من الشراء الجماعي وتبادل الطاقة الإنتاجية لتخفيض التكاليف وزيادة الأرباح
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link
              href="/register"
              className={cn(buttonVariants({ size: 'xl' }), 'min-h-[56px] text-lg')}
            >
              ابدأ مجاناً
              <ArrowLeft className="h-5 w-5 mr-2 flip-horizontal" />
            </Link>
            <a
              href="#how-it-works"
              className={cn(buttonVariants({ size: 'xl', variant: 'outline' }), 'min-h-[56px] text-lg')}
            >
              شاهد كيف تعمل
              <ChevronDown className="h-5 w-5 mr-2" />
            </a>
          </div>

          <p className="text-muted-foreground flex items-center justify-center gap-2">
            <Lock className="h-4 w-4" />
            بياناتك محمية بأعلى معايير الأمان
          </p>
        </div>
      </section>

      {/* Section 2: Partners Strip */}
      <section className="py-12 bg-muted/50">
        <div className="max-w-6xl mx-auto px-4">
          <p className="text-center text-muted-foreground mb-8">شركاؤنا في النجاح</p>
          <div className="flex flex-wrap justify-center gap-6 sm:gap-12">
            {['SABIC', 'Ma\'aden', 'SIDF', 'Modon', 'SASO'].map((partner) => (
              <div
                key={partner}
                className="px-6 py-3 rounded-lg bg-background border border-border text-muted-foreground font-medium"
              >
                {partner}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3: Problems We Solve */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">المشاكل التي نحلها</h2>
            <p className="text-muted-foreground text-lg">تحديات حقيقية تواجه المصانع السعودية يومياً</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="liquid-card p-6 rounded-2xl">
              <div className="w-14 h-14 rounded-xl bg-destructive/10 flex items-center justify-center mb-4">
                <DollarSign className="h-7 w-7 text-destructive" />
              </div>
              <h3 className="text-xl font-semibold mb-3">ارتفاع تكاليف المواد الخام</h3>
              <p className="text-muted-foreground leading-relaxed">
                المصانع الصغيرة تدفع 20-40% أكثر من المصانع الكبيرة على نفس المواد بسبب صغر حجم الطلبات
              </p>
            </div>

            <div className="liquid-card p-6 rounded-2xl">
              <div className="w-14 h-14 rounded-xl bg-warning/10 flex items-center justify-center mb-4">
                <Wrench className="h-7 w-7 text-warning" />
              </div>
              <h3 className="text-xl font-semibold mb-3">معدات معطلة تستهلك رأس المال</h3>
              <p className="text-muted-foreground leading-relaxed">
                آلات بملايين الريالات تقف معطلة 60% من الوقت بينما مصانع أخرى تحتاجها بشدة
              </p>
            </div>

            <div className="liquid-card p-6 rounded-2xl">
              <div className="w-14 h-14 rounded-xl bg-info/10 flex items-center justify-center mb-4">
                <TrendingUp className="h-7 w-7 text-info" />
              </div>
              <h3 className="text-xl font-semibold mb-3">صعوبة الوصول للموردين الكبار</h3>
              <p className="text-muted-foreground leading-relaxed">
                الموردون يفضلون الطلبات الكبيرة ويرفضون التعامل مع الكميات الصغيرة أو يفرضون أسعاراً مرتفعة
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: How It Works */}
      <section id="how-it-works" className="py-20 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">كيف تعمل المنصة؟</h2>
            <p className="text-muted-foreground text-lg">أربع خطوات بسيطة للبدء في توفير المال</p>
          </div>

          <div className="space-y-8">
            {[
              {
                icon: FileText,
                title: 'سجل مصنعك مجاناً',
                description: 'أنشئ حسابك في دقيقتين فقط. لا نحتاج سوى معلومات أساسية عن مصنعك للتحقق من هويتك.',
              },
              {
                icon: Users,
                title: 'استعرض الفرص',
                description: 'تصفح طلبات الشراء الجماعي المفتوحة والمعدات المتاحة للتأجير من مصانع أخرى.',
              },
              {
                icon: Handshake,
                title: 'انضم أو أنشئ طلباً',
                description: 'شارك في طلب جماعي قائم أو أنشئ طلباً جديداً ودع مصانع أخرى تنضم إليك.',
              },
              {
                icon: Wallet,
                title: 'وفر واربح',
                description: 'احصل على أسعار الجملة واستفد من قوة التفاوض الجماعي. كلما زاد عدد المشاركين، زادت الوفورات.',
              },
            ].map((step, index) => (
              <div key={index} className="flex gap-6 items-start">
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
                    {index + 1}
                  </div>
                </div>
                <div className="flex-1 pt-2">
                  <div className="flex items-center gap-3 mb-2">
                    <step.icon className="h-6 w-6 text-primary" />
                    <h3 className="text-xl font-semibold">{step.title}</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 5: Features */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">مزايا المنصة</h2>
            <p className="text-muted-foreground text-lg">كل ما تحتاجه لإدارة مشترياتك ومعداتك</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: ShoppingCart,
                title: 'الشراء الجماعي الذكي',
                description: 'تفاوض جماعي مع الموردين للحصول على خصومات حقيقية تصل إلى 30%',
              },
              {
                icon: Factory,
                title: 'تبادل الطاقة الإنتاجية',
                description: 'أجّر معداتك غير المستخدمة أو استأجر ما تحتاجه من مصانع أخرى',
              },
              {
                icon: BarChart3,
                title: 'لوحة تحكم متقدمة',
                description: 'تتبع جميع طلباتك ومعداتك وتقاريرك المالية في مكان واحد',
              },
              {
                icon: Shield,
                title: 'أمان وموثوقية',
                description: 'نتحقق من جميع المصانع والموردين قبل انضمامهم للمنصة',
              },
              {
                icon: MessageCircle,
                title: 'تواصل مباشر',
                description: 'محادثات فورية آمنة مع المصانع والموردين داخل المنصة',
              },
              {
                icon: Smartphone,
                title: 'واجهة عربية بالكامل',
                description: 'مصممة خصيصاً للمستخدم السعودي بواجهة سهلة وبديهية',
              },
            ].map((feature, index) => (
              <div key={index} className="liquid-card p-6 rounded-2xl">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 6: Statistics */}
      <section className="py-16 px-4 bg-primary text-primary-foreground">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {[
              { value: '+500', label: 'مصنع مسجل' },
              { value: '+1,200', label: 'صفقة ناجحة' },
              { value: '+50M', label: 'ريال وفورات' },
              { value: '4.8/5', label: 'تقييم المستخدمين' },
            ].map((stat, index) => (
              <div key={index}>
                <div className="text-4xl sm:text-5xl font-bold mb-2">{stat.value}</div>
                <div className="text-primary-foreground/80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 7: Testimonials */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">ماذا يقول عملاؤنا</h2>
            <p className="text-muted-foreground text-lg">قصص نجاح حقيقية من مصانع سعودية</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote: 'وفرنا 25% من تكاليف البولي إيثيلين في أول صفقة جماعية. المنصة غيرت طريقة شرائنا للمواد الخام بالكامل.',
                author: 'أحمد الغامدي',
                company: 'مصنع النور للبلاستيك',
                rating: 5,
              },
              {
                quote: 'أجرنا ماكينة CNC كانت معطلة 8 أشهر وحققنا دخلاً إضافياً ممتازاً. المنصة سهلة الاستخدام وآمنة.',
                author: 'سارة العتيبي',
                company: 'مصنع الدقة للمعادن',
                rating: 5,
              },
              {
                quote: 'المنصة سهلت علينا الوصول لموردين كنا نظن أنهم بعيدون عن متناولنا. الآن نتفاوض بقوة 50 مصنع.',
                author: 'محمد القحطاني',
                company: 'مصنع الخليج للتغليف',
                rating: 5,
              },
            ].map((testimonial, index) => (
              <div key={index} className="liquid-card p-6 rounded-2xl">
                <Quote className="h-8 w-8 text-primary/30 mb-4" />
                <p className="text-foreground mb-6 leading-relaxed">&quot;{testimonial.quote}&quot;</p>
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-warning text-warning" />
                  ))}
                </div>
                <div>
                  <div className="font-semibold">{testimonial.author}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.company}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 8: Pricing */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="success" className="mb-4">
              ابدأ مجاناً - لا حاجة لبطاقة ائتمان
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">خطط تناسب جميع أحجام المصانع</h2>
            <p className="text-muted-foreground text-lg">اختر الخطة المناسبة لاحتياجاتك</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 items-start">
            {/* Free Plan */}
            <div className="liquid-card p-6 rounded-2xl">
              <h3 className="text-xl font-semibold mb-2">مجاني</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">0</span>
                <span className="text-muted-foreground"> ر.س/شهرياً</span>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  '3 طلبات شراء جماعي شهرياً',
                  'إدراج 2 معدات للتأجير',
                  'دعم عبر البريد الإلكتروني',
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-success flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className={cn(buttonVariants({ variant: 'outline' }), 'w-full min-h-[48px]')}
              >
                ابدأ مجاناً
              </Link>
            </div>

            {/* Pro Plan - Highlighted */}
            <div className="liquid-card p-6 rounded-2xl border-2 border-primary relative scale-105 shadow-lg">
              <Badge className="absolute -top-3 right-6">الأكثر شيوعاً</Badge>
              <h3 className="text-xl font-semibold mb-2">احترافي</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">499</span>
                <span className="text-muted-foreground"> ر.س/شهرياً</span>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  'طلبات شراء غير محدودة',
                  'إدراج 10 معدات للتأجير',
                  'تقارير وتحليلات متقدمة',
                  'دعم أولوية 24/7',
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-success flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className={cn(buttonVariants(), 'w-full min-h-[48px]')}
              >
                ابدأ الآن
              </Link>
            </div>

            {/* Enterprise Plan */}
            <div className="liquid-card p-6 rounded-2xl">
              <h3 className="text-xl font-semibold mb-2">مؤسسي</h3>
              <div className="mb-6">
                <span className="text-2xl font-bold">تواصل معنا</span>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  'كل مزايا الخطة الاحترافية',
                  'API للربط مع أنظمتك',
                  'مدير حساب مخصص',
                  'تدريب وإعداد مخصص',
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-success flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                className={cn(buttonVariants({ variant: 'outline' }), 'w-full min-h-[48px]')}
              >
                تواصل معنا
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Section 9: FAQ */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">الأسئلة الشائعة</h2>
            <p className="text-muted-foreground text-lg">إجابات على أكثر الأسئلة شيوعاً</p>
          </div>

          <FAQAccordion />
        </div>
      </section>

      {/* Section 10: Final CTA */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">جاهز لتخفيض تكاليفك؟</h2>
          <p className="text-xl text-primary-foreground/80 mb-8">
            انضم لمئات المصانع السعودية التي توفر آلاف الريالات شهرياً
          </p>
          <Link
            href="/register"
            className={cn(
              buttonVariants({ size: 'xl', variant: 'secondary' }),
              'min-h-[56px] text-lg bg-background text-foreground hover:bg-background/90'
            )}
          >
            سجل الآن مجاناً
            <ArrowLeft className="h-5 w-5 mr-2 flip-horizontal" />
          </Link>
          <p className="mt-6 text-primary-foreground/70">
            أو تواصل معنا على <span className="font-bold">920-XXX-XXXX</span>
          </p>
        </div>
      </section>

      {/* Section 11: Footer */}
      <footer className="py-12 px-4 bg-foreground text-background">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {/* Logo & Description */}
            <div className="sm:col-span-2 lg:col-span-1">
              <h3 className="text-xl font-bold mb-4">تآزر</h3>
              <p className="text-background/70 leading-relaxed">
                منصة سعودية تربط المصانع الصغيرة والمتوسطة للشراء الجماعي وتبادل الطاقة الإنتاجية
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4">روابط سريعة</h4>
              <ul className="space-y-2 text-background/70">
                <li><Link href="/" className="hover:text-background transition-colors duration-200">الرئيسية</Link></li>
                <li><a href="#how-it-works" className="hover:text-background transition-colors duration-200">عن المنصة</a></li>
                <li><Link href="/login" className="hover:text-background transition-colors duration-200">تسجيل الدخول</Link></li>
                <li><Link href="/register" className="hover:text-background transition-colors duration-200">إنشاء حساب</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold mb-4">قانوني</h4>
              <ul className="space-y-2 text-background/70">
                <li><Link href="/privacy" className="hover:text-background transition-colors duration-200">سياسة الخصوصية</Link></li>
                <li><Link href="/terms" className="hover:text-background transition-colors duration-200">الشروط والأحكام</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold mb-4">تواصل معنا</h4>
              <ul className="space-y-2 text-background/70">
                <li>920-XXX-XXXX</li>
                <li>info@takamul.sa</li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-background/20 text-center text-background/60">
            <p>© 2025 منصة تآزر. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
