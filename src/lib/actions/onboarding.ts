'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { IndustryType } from '@/types';

export interface OnboardingResult {
  success: boolean;
  error?: string;
  factoryId?: string;
}

// ==================== GET ONBOARDING STATUS ====================
export async function getOnboardingStatus() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { status: 'no_user' as const };

  const { data: factory } = await supabase
    .from('factories')
    .select('id, onboarding_status, onboarding_step, name')
    .eq('user_id', user.id)
    .single();

  if (!factory) {
    return { status: 'no_factory' as const, step: 1 };
  }

  return {
    status: factory.onboarding_status as string,
    step: factory.onboarding_step as number,
    factoryId: factory.id as string,
    factoryName: factory.name as string,
  };
}

// ==================== STEP 1: BASIC INFO ====================
export async function saveBasicInfo(data: {
  factoryName: string;
  factoryNameEn?: string;
  commercialRegisterNumber: string;
  vatNumber?: string;
  establishedYear?: number;
  employeeCount?: number;
}): Promise<OnboardingResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'يرجى تسجيل الدخول أولاً' };

  // Validate CR number (10 digits)
  if (!/^\d{10}$/.test(data.commercialRegisterNumber)) {
    return { success: false, error: 'رقم السجل التجاري يجب أن يكون 10 أرقام' };
  }

  // Validate VAT number if provided (15 digits)
  if (data.vatNumber && !/^\d{15}$/.test(data.vatNumber)) {
    return { success: false, error: 'الرقم الضريبي يجب أن يكون 15 رقم' };
  }

  // Check if factory already exists for user
  const { data: existingFactory } = await supabase
    .from('factories')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (existingFactory) {
    // Update existing
    const { error } = await supabase
      .from('factories')
      .update({
        name: data.factoryName,
        name_en: data.factoryNameEn,
        commercial_registration: data.commercialRegisterNumber,
        vat_number: data.vatNumber,
        established_year: data.establishedYear,
        employee_count: data.employeeCount,
        onboarding_step: 2,
        onboarding_status: 'in_progress',
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingFactory.id);

    if (error) return { success: false, error: error.message };
    revalidatePath('/onboarding');
    return { success: true, factoryId: existingFactory.id };
  }

  // Create new factory with required fields
  const { data: factory, error } = await supabase
    .from('factories')
    .insert({
      user_id: user.id,
      name: data.factoryName,
      name_en: data.factoryNameEn,
      commercial_registration: data.commercialRegisterNumber,
      vat_number: data.vatNumber,
      established_year: data.establishedYear,
      employee_count: data.employeeCount || 0,
      // Required fields with defaults - will be updated in step 2
      city: 'pending',
      industry_type: 'other',
      contact_name: user.user_metadata?.full_name || 'المسؤول',
      contact_phone: user.user_metadata?.phone || '0500000000',
      contact_email: user.email || '',
      onboarding_step: 2,
      onboarding_status: 'in_progress',
    })
    .select('id')
    .single();

  if (error) {
    if (error.message.includes('unique') || error.message.includes('duplicate')) {
      return { success: false, error: 'رقم السجل التجاري مسجل مسبقاً' };
    }
    return { success: false, error: error.message };
  }

  revalidatePath('/onboarding');
  return { success: true, factoryId: factory.id };
}

// ==================== STEP 2: LOCATION & CONTACT ====================
export async function saveLocationInfo(data: {
  city: string;
  district: string;
  street: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  contactPhone: string;
  contactEmail: string;
  website?: string;
}): Promise<OnboardingResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'يرجى تسجيل الدخول أولاً' };

  // Validate phone
  if (!/^(05)\d{8}$/.test(data.contactPhone)) {
    return { success: false, error: 'رقم الجوال غير صحيح (يجب أن يبدأ بـ 05)' };
  }

  // Validate email
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contactEmail)) {
    return { success: false, error: 'البريد الإلكتروني غير صحيح' };
  }

  const { data: factory } = await supabase
    .from('factories')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!factory) return { success: false, error: 'يرجى إكمال الخطوة الأولى' };

  const { error } = await supabase
    .from('factories')
    .update({
      city: data.city,
      district: data.district,
      address: data.street,
      postal_code: data.postalCode,
      latitude: data.latitude,
      longitude: data.longitude,
      contact_phone: data.contactPhone,
      phone: data.contactPhone,
      contact_email: data.contactEmail,
      email: data.contactEmail,
      website: data.website,
      onboarding_step: 3,
      updated_at: new Date().toISOString(),
    })
    .eq('id', factory.id);

  if (error) return { success: false, error: error.message };

  revalidatePath('/onboarding');
  return { success: true, factoryId: factory.id };
}

// ==================== STEP 3: CAPABILITIES ====================
export async function saveCapabilities(data: {
  categories: IndustryType[];
  description: string;
  capabilities: {
    category: string;
    subcategory?: string;
    description?: string;
    equipmentCount?: number;
    monthlyCapacity?: string;
    capacityUnit?: string;
  }[];
}): Promise<OnboardingResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'يرجى تسجيل الدخول أولاً' };

  if (data.categories.length === 0) {
    return { success: false, error: 'يرجى اختيار مجال تصنيع واحد على الأقل' };
  }

  const { data: factory } = await supabase
    .from('factories')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!factory) return { success: false, error: 'يرجى إكمال الخطوات السابقة' };

  // Update factory description and primary industry type
  await supabase
    .from('factories')
    .update({
      description: data.description,
      industry_type: data.categories[0], // Primary industry
      onboarding_step: 4,
      updated_at: new Date().toISOString(),
    })
    .eq('id', factory.id);

  // Delete existing capabilities
  await supabase.from('factory_capabilities').delete().eq('factory_id', factory.id);

  // Insert new capabilities
  if (data.capabilities.length > 0) {
    const capabilitiesData = data.capabilities.map((cap) => ({
      factory_id: factory.id,
      category: cap.category,
      subcategory: cap.subcategory,
      description: cap.description,
      equipment_count: cap.equipmentCount,
      monthly_capacity: cap.monthlyCapacity,
      capacity_unit: cap.capacityUnit,
    }));

    const { error } = await supabase.from('factory_capabilities').insert(capabilitiesData);

    if (error) return { success: false, error: error.message };
  } else {
    // If no detailed capabilities, create one for each category
    const capabilitiesData = data.categories.map((category) => ({
      factory_id: factory.id,
      category,
    }));

    const { error } = await supabase.from('factory_capabilities').insert(capabilitiesData);

    if (error) return { success: false, error: error.message };
  }

  revalidatePath('/onboarding');
  return { success: true, factoryId: factory.id };
}

// ==================== STEP 4: DOCUMENTS ====================
export async function saveDocuments(
  documents: {
    documentType: string;
    documentNumber?: string;
    issueDate?: string;
    expiryDate?: string;
    issuingAuthority?: string;
    fileUrl: string;
    fileName: string;
    fileSize: number;
    fileType: string;
  }[]
): Promise<OnboardingResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'يرجى تسجيل الدخول أولاً' };

  const { data: factory } = await supabase
    .from('factories')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!factory) return { success: false, error: 'يرجى إكمال الخطوات السابقة' };

  // Check required documents
  const hasCommercialRegister = documents.some((d) => d.documentType === 'commercial_register');
  if (!hasCommercialRegister) {
    return { success: false, error: 'السجل التجاري مطلوب' };
  }

  // Upsert documents
  for (const doc of documents) {
    const { error } = await supabase.from('factory_documents').upsert(
      {
        factory_id: factory.id,
        document_type: doc.documentType,
        document_number: doc.documentNumber,
        issue_date: doc.issueDate,
        expiry_date: doc.expiryDate,
        issuing_authority: doc.issuingAuthority,
        file_url: doc.fileUrl,
        file_name: doc.fileName,
        file_size: doc.fileSize,
        file_type: doc.fileType,
        status: 'pending',
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'factory_id,document_type',
      }
    );

    if (error) return { success: false, error: error.message };
  }

  revalidatePath('/onboarding');
  return { success: true, factoryId: factory.id };
}

// ==================== SUBMIT FOR VERIFICATION ====================
export async function submitForVerification(): Promise<OnboardingResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'يرجى تسجيل الدخول أولاً' };

  const { data: factory } = await supabase
    .from('factories')
    .select('id, onboarding_step')
    .eq('user_id', user.id)
    .single();

  if (!factory) return { success: false, error: 'لم يتم العثور على بيانات المصنع' };

  if ((factory.onboarding_step as number) < 4) {
    return { success: false, error: 'يرجى إكمال جميع الخطوات أولاً' };
  }

  // Check required documents exist
  const { data: docs } = await supabase
    .from('factory_documents')
    .select('document_type')
    .eq('factory_id', factory.id);

  const hasRequiredDocs = docs?.some((d) => d.document_type === 'commercial_register');
  if (!hasRequiredDocs) {
    return { success: false, error: 'يرجى رفع السجل التجاري' };
  }

  const { error } = await supabase
    .from('factories')
    .update({
      onboarding_status: 'submitted',
      submitted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', factory.id);

  if (error) return { success: false, error: error.message };

  revalidatePath('/onboarding');
  return { success: true, factoryId: factory.id };
}

// ==================== GET FACTORY DATA FOR EDITING ====================
export async function getFactoryOnboardingData() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: factory } = await supabase
    .from('factories')
    .select(
      `
      *,
      capabilities:factory_capabilities(*),
      documents:factory_documents(*)
    `
    )
    .eq('user_id', user.id)
    .single();

  return factory;
}

// ==================== UPLOAD DOCUMENT FILE ====================
export async function uploadDocument(formData: FormData): Promise<{
  success: boolean;
  error?: string;
  url?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'يرجى تسجيل الدخول أولاً' };

  const file = formData.get('file') as File;
  if (!file) return { success: false, error: 'لم يتم اختيار ملف' };

  // Validate file type
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return { success: false, error: 'نوع الملف غير مدعوم. يرجى رفع PDF أو صورة' };
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    return { success: false, error: 'حجم الملف يجب أن لا يتجاوز 5 ميجابايت' };
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${user.id}/${Date.now()}.${fileExt}`;

  const { data, error } = await supabase.storage.from('factory-documents').upload(fileName, file, {
    cacheControl: '3600',
    upsert: false,
  });

  if (error) return { success: false, error: error.message };

  const {
    data: { publicUrl },
  } = supabase.storage.from('factory-documents').getPublicUrl(data.path);

  return {
    success: true,
    url: publicUrl,
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
  };
}

// ==================== DELETE DOCUMENT ====================
export async function deleteDocument(documentType: string): Promise<OnboardingResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'يرجى تسجيل الدخول أولاً' };

  const { data: factory } = await supabase
    .from('factories')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!factory) return { success: false, error: 'لم يتم العثور على بيانات المصنع' };

  const { error } = await supabase
    .from('factory_documents')
    .delete()
    .eq('factory_id', factory.id)
    .eq('document_type', documentType);

  if (error) return { success: false, error: error.message };

  revalidatePath('/onboarding');
  return { success: true, factoryId: factory.id };
}
