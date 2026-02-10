import { Capacitor, registerPlugin } from '@capacitor/core';

interface StoreKitProduct {
  id: string;
  displayName: string;
  description: string;
  displayPrice: string;
  price: number;
  type: string;
  subscriptionPeriod?: {
    unit: string;
    value: number;
  };
  introductoryOffer?: {
    displayPrice: string;
    period: {
      unit: string;
      value: number;
    };
    paymentMode: string;
  };
}

interface PurchaseResult {
  success: boolean;
  cancelled?: boolean;
  pending?: boolean;
  transactionId?: string;
  productId?: string;
  originalId?: string;
  expirationDate?: number;
}

interface SubscriptionStatus {
  isActive: boolean;
  subscription?: {
    productId: string;
    transactionId: string;
    originalId: string;
    expirationDate: number;
    isActive: boolean;
  };
}

interface StoreKitPluginInterface {
  getProducts(options: { productIds: string[] }): Promise<{ products: StoreKitProduct[] }>;
  purchase(options: { productId: string }): Promise<PurchaseResult>;
  restorePurchases(): Promise<{ success: boolean; hasActiveSubscription: boolean }>;
  getSubscriptionStatus(): Promise<SubscriptionStatus>;
  addListener(eventName: string, callback: (data: any) => void): Promise<any>;
}

// Product IDs - must match App Store Connect configuration
export const PRODUCT_IDS = {
  MONTHLY: 'wardaty_plus_monthly_v2',
  YEARLY: 'wardaty_plus_yearly_v2',
};

const isNativeIOS = Capacitor.getPlatform() === 'ios';

// Register the native plugin only on iOS
const StoreKit = isNativeIOS
  ? registerPlugin<StoreKitPluginInterface>('StoreKit')
  : null;

export const StoreKitService = {
  /**
   * Check if StoreKit is available (iOS only)
   */
  isAvailable(): boolean {
    return isNativeIOS;
  },

  /**
   * Load products from App Store
   */
  async getProducts(): Promise<StoreKitProduct[]> {
    if (!StoreKit) {
      console.warn('StoreKit not available on this platform');
      return [];
    }

    try {
      const result = await StoreKit.getProducts({
        productIds: [PRODUCT_IDS.MONTHLY, PRODUCT_IDS.YEARLY],
      });
      return result.products;
    } catch (error) {
      console.error('Failed to load products:', error);
      return [];
    }
  },

  /**
   * Purchase a subscription
   */
  async purchase(productId: string): Promise<PurchaseResult> {
    if (!StoreKit) {
      throw new Error('StoreKit not available on this platform');
    }

    return await StoreKit.purchase({ productId });
  },

  /**
   * Restore previous purchases
   */
  async restorePurchases(): Promise<{ success: boolean; hasActiveSubscription: boolean }> {
    if (!StoreKit) {
      throw new Error('StoreKit not available on this platform');
    }

    return await StoreKit.restorePurchases();
  },

  /**
   * Get current subscription status
   */
  async getSubscriptionStatus(): Promise<SubscriptionStatus> {
    if (!StoreKit) {
      return { isActive: false };
    }

    try {
      return await StoreKit.getSubscriptionStatus();
    } catch (error) {
      console.error('Failed to get subscription status:', error);
      return { isActive: false };
    }
  },

  /**
   * Listen for subscription status changes
   */
  onSubscriptionStatusChanged(callback: (data: any) => void) {
    if (!StoreKit) return;
    StoreKit.addListener('subscriptionStatusChanged', callback);
  },
};

export type { StoreKitProduct, PurchaseResult, SubscriptionStatus };
