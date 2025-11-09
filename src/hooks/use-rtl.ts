import { useI18n } from '@/contexts/I18nContext';

/**
 * Custom hook for RTL-aware utilities
 */
export function useRTL() {
  const { dir } = useI18n();
  const isRTL = dir === 'rtl';

  /**
   * Get RTL-aware className for icons that should flip
   */
  const getRTLClass = (shouldFlip: boolean = true) => {
    return shouldFlip && isRTL ? 'rtl:rotate-180' : '';
  };

  /**
   * Get RTL-aware flex direction class
   */
  const getFlexDirectionClass = () => {
    return isRTL ? 'flex-row-reverse' : 'flex-row';
  };

  return {
    isRTL,
    dir,
    getRTLClass,
    getFlexDirectionClass,
  };
}
