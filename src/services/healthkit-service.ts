import { Capacitor, registerPlugin } from '@capacitor/core';

interface HealthValue {
  value: number;
  unit: string;
  date: string;
  hasData?: boolean;
}

interface HealthKitPluginInterface {
  isAvailable(): Promise<{ available: boolean }>;
  requestAuthorization(): Promise<{ authorized: boolean }>;
  getSteps(): Promise<HealthValue>;
  getWeight(): Promise<HealthValue>;
  getSleep(): Promise<HealthValue>;
  getHeartRate(): Promise<HealthValue>;
}

const isNativeIOS = Capacitor.getPlatform() === 'ios';

// Register the native plugin only on iOS
const HealthKitNative = isNativeIOS
  ? registerPlugin<HealthKitPluginInterface>('HealthKit')
  : null;

export const HealthKitService = {
  /**
   * Check if HealthKit is available
   */
  async isAvailable(): Promise<boolean> {
    if (!HealthKitNative) return false;

    try {
      const result = await HealthKitNative.isAvailable();
      return result.available;
    } catch {
      return false;
    }
  },

  /**
   * Request HealthKit authorization
   */
  async requestAuthorization(): Promise<boolean> {
    if (!HealthKitNative) return false;

    try {
      const result = await HealthKitNative.requestAuthorization();
      return result.authorized;
    } catch (error) {
      console.error('HealthKit authorization failed:', error);
      return false;
    }
  },

  /**
   * Get today's step count
   */
  async getSteps(): Promise<HealthValue> {
    if (!HealthKitNative) {
      return { value: 0, unit: 'count', date: '' };
    }
    return await HealthKitNative.getSteps();
  },

  /**
   * Get latest weight reading
   */
  async getWeight(): Promise<HealthValue> {
    if (!HealthKitNative) {
      return { value: 0, unit: 'kg', date: '', hasData: false };
    }
    return await HealthKitNative.getWeight();
  },

  /**
   * Get last night's sleep duration
   */
  async getSleep(): Promise<HealthValue> {
    if (!HealthKitNative) {
      return { value: 0, unit: 'minutes', date: '', hasData: false };
    }
    return await HealthKitNative.getSleep();
  },

  /**
   * Get latest heart rate reading
   */
  async getHeartRate(): Promise<HealthValue> {
    if (!HealthKitNative) {
      return { value: 0, unit: 'bpm', date: '', hasData: false };
    }
    return await HealthKitNative.getHeartRate();
  },
};

export type { HealthValue };
