import { z } from 'zod';

// Beauty Action Validation
export const beautyActionSchema = z.object({
  title: z.string()
    .trim()
    .min(1, { message: 'العنوان مطلوب' })
    .max(200, { message: 'العنوان يجب أن يكون أقل من 200 حرف' }),
  notes: z.string()
    .max(1000, { message: 'الملاحظات يجب أن تكون أقل من 1000 حرف' })
    .optional()
    .or(z.literal('')),
  phase: z.enum(['menstrual', 'follicular', 'ovulation', 'luteal'], {
    errorMap: () => ({ message: 'مرحلة غير صالحة' })
  }),
  scheduled_at: z.string().optional().nullable(),
  frequency: z.enum(['once', 'daily', 'weekly', 'monthly'], {
    errorMap: () => ({ message: 'تكرار غير صالح' })
  }).optional(),
  time_of_day: z.enum(['morning', 'afternoon', 'evening', 'night'], {
    errorMap: () => ({ message: 'وقت غير صالح' })
  }).optional(),
  reminder_enabled: z.boolean().optional(),
  reminder_hours_before: z.number()
    .int()
    .min(1)
    .max(168)
    .optional(),
});

// Daughter Validation
export const daughterSchema = z.object({
  name: z.string()
    .trim()
    .min(1, { message: 'الاسم مطلوب' })
    .max(100, { message: 'الاسم يجب أن يكون أقل من 100 حرف' }),
  birth_date: z.date().optional(),
  cycle_start_age: z.number()
    .int()
    .min(8, { message: 'العمر يجب أن يكون على الأقل 8 سنوات' })
    .max(25, { message: 'العمر يجب أن يكون أقل من 25 سنة' })
    .optional(),
  notes: z.string()
    .max(500, { message: 'الملاحظات يجب أن تكون أقل من 500 حرف' })
    .optional()
    .or(z.literal('')),
});

// Pregnancy Appointment Validation
export const appointmentSchema = z.object({
  title: z.string()
    .trim()
    .min(1, { message: 'العنوان مطلوب' })
    .max(200, { message: 'العنوان يجب أن يكون أقل من 200 حرف' }),
  appointment_type: z.string()
    .min(1, { message: 'نوع الموعد مطلوب' }),
  appointment_date: z.date({
    required_error: 'تاريخ الموعد مطلوب',
  }),
  appointment_time: z.string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'صيغة الوقت غير صحيحة' })
    .optional()
    .or(z.literal('')),
  notes: z.string()
    .max(1000, { message: 'الملاحظات يجب أن تكون أقل من 1000 حرف' })
    .optional()
    .or(z.literal('')),
});

// Medicine Validation
export const medicineSchema = z.object({
  medicine_name: z.string()
    .trim()
    .min(1, { message: 'اسم الدواء مطلوب' })
    .max(200, { message: 'اسم الدواء يجب أن يكون أقل من 200 حرف' }),
  dosage: z.string()
    .max(100, { message: 'الجرعة يجب أن تكون أقل من 100 حرف' })
    .optional()
    .or(z.literal('')),
  frequency: z.string()
    .max(100, { message: 'التكرار يجب أن يكون أقل من 100 حرف' })
    .optional()
    .or(z.literal('')),
  start_date: z.date({
    required_error: 'تاريخ البدء مطلوب',
  }),
  end_date: z.date().optional(),
  notes: z.string()
    .max(500, { message: 'الملاحظات يجب أن تكون أقل من 500 حرف' })
    .optional()
    .or(z.literal('')),
});

// Cycle Setup Validation
export const cycleSetupSchema = z.object({
  lastPeriodDate: z.date({
    required_error: 'تاريخ آخر دورة مطلوب',
  }),
  cycleDuration: z.number()
    .int()
    .min(21, { message: 'مدة الدورة يجب أن تكون على الأقل 21 يوم' })
    .max(45, { message: 'مدة الدورة يجب أن تكون أقل من 45 يوم' }),
  periodLength: z.number()
    .int()
    .min(2, { message: 'طول الدورة يجب أن يكون على الأقل يومين' })
    .max(10, { message: 'طول الدورة يجب أن يكون أقل من 10 أيام' }),
});
