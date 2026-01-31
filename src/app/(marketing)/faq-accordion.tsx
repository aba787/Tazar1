'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const faqs = [
  {
    question: 'هل المنصة مجانية فعلاً؟',
    answer:
      'نعم! يمكنك البدء باستخدام المنصة مجاناً بالكامل. الخطة المجانية تتيح لك 3 طلبات شراء جماعي شهرياً وإدراج معدتين للتأجير. لا نحتاج بطاقة ائتمان للتسجيل.',
  },
  {
    question: 'كيف أضمن جودة المصانع الأخرى؟',
    answer:
      'نتحقق من جميع المصانع قبل انضمامها للمنصة من خلال التحقق من السجل التجاري والرخصة الصناعية. كما نوفر نظام تقييمات ومراجعات من المصانع الأخرى لضمان الشفافية.',
  },
  {
    question: 'هل يمكنني إلغاء الاشتراك؟',
    answer:
      'نعم، يمكنك إلغاء اشتراكك في أي وقت دون أي رسوم إضافية. سيظل حسابك نشطاً حتى نهاية فترة الاشتراك الحالية، ثم يتحول تلقائياً للخطة المجانية.',
  },
  {
    question: 'ما هي طرق الدفع المتاحة؟',
    answer:
      'نقبل التحويل البنكي المباشر، وبطاقات الائتمان (Visa، Mastercard)، وخدمة مدى، وApple Pay. جميع المعاملات مؤمنة ومشفرة بأعلى معايير الأمان.',
  },
  {
    question: 'هل بياناتي آمنة؟',
    answer:
      'نستخدم أحدث تقنيات التشفير والحماية لضمان أمان بياناتك. خوادمنا موجودة في مراكز بيانات معتمدة ونلتزم بجميع معايير حماية البيانات السعودية والدولية.',
  },
];

export function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      {faqs.map((faq, index) => (
        <div
          key={index}
          className="liquid-card rounded-xl overflow-hidden"
        >
          <button
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="w-full px-6 py-5 flex items-center justify-between text-right min-h-[64px] hover:bg-muted/50 transition-colors duration-200"
            aria-expanded={openIndex === index}
          >
            <span className="font-semibold text-lg">{faq.question}</span>
            <ChevronDown
              className={cn(
                'h-5 w-5 text-muted-foreground transition-transform duration-200 flex-shrink-0 mr-4',
                openIndex === index && 'rotate-180'
              )}
            />
          </button>
          <div
            className={cn(
              'grid transition-all duration-200',
              openIndex === index ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
            )}
          >
            <div className="overflow-hidden">
              <p className="px-6 pb-5 text-muted-foreground leading-relaxed">
                {faq.answer}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
