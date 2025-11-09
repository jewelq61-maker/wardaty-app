// Simple Hijri calendar utilities for Ramadan calculations
// Note: This is an approximation. For production, use a proper Hijri library

export interface HijriDate {
  year: number;
  month: number;
  day: number;
}

// Approximate conversion from Gregorian to Hijri
export function gregorianToHijri(date: Date): HijriDate {
  // Islamic calendar epoch in Julian Day Number
  const islamicEpoch = 1948439.5;
  
  // Convert Gregorian date to Julian Day Number
  const jdn = dateToJDN(date);
  
  // Calculate Hijri date (simplified)
  const l = jdn - islamicEpoch + 10632;
  const n = Math.floor((l - 1) / 10631);
  const year = Math.floor((30 * n + Math.floor((l - 10631 * n) / 354.367)));
  
  const yearStart = Math.floor(354.367 * year + 10631 * Math.floor(year / 30) + islamicEpoch);
  const monthStart = Math.floor((jdn - yearStart) / 29.5);
  const month = monthStart + 1;
  const day = Math.floor(jdn - yearStart - monthStart * 29.5) + 1;
  
  return {
    year: year + 1,
    month: Math.max(1, Math.min(12, month)),
    day: Math.max(1, Math.min(30, day))
  };
}

function dateToJDN(date: Date): number {
  const a = Math.floor((14 - (date.getMonth() + 1)) / 12);
  const y = date.getFullYear() + 4800 - a;
  const m = (date.getMonth() + 1) + 12 * a - 3;
  
  return date.getDate() + Math.floor((153 * m + 2) / 5) + 365 * y +
    Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
}

// Check if a Gregorian date falls within Ramadan
export function isRamadan(date: Date): boolean {
  const hijri = gregorianToHijri(date);
  return hijri.month === 9; // Ramadan is the 9th month
}

// Get Ramadan period for a Gregorian year (approximate)
export function getRamadanPeriod(gregorianYear: number): { start: Date; end: Date } {
  // Approximate: Ramadan moves ~11 days earlier each year
  // 2024 Ramadan: March 10 - April 9
  // This is a simplified calculation
  const yearsSince2024 = gregorianYear - 2024;
  const dayShift = yearsSince2024 * 11;
  
  const ramadan2024Start = new Date(2024, 2, 10); // March 10, 2024
  const startDate = new Date(ramadan2024Start);
  startDate.setDate(startDate.getDate() - dayShift);
  
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 29); // Ramadan is 29-30 days
  
  return { start: startDate, end: endDate };
}

// Format Hijri date
export function formatHijriDate(hijri: HijriDate, locale: 'ar' | 'en' = 'ar'): string {
  const monthNames = {
    ar: [
      'محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني', 'جمادى الأولى', 'جمادى الآخرة',
      'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'
    ],
    en: [
      'Muharram', 'Safar', 'Rabi\' al-Awwal', 'Rabi\' al-Thani', 'Jumada al-Awwal', 'Jumada al-Thani',
      'Rajab', 'Sha\'ban', 'Ramadan', 'Shawwal', 'Dhu al-Qi\'dah', 'Dhu al-Hijjah'
    ]
  };
  
  const monthName = monthNames[locale][hijri.month - 1];
  return `${hijri.day} ${monthName} ${hijri.year}`;
}
