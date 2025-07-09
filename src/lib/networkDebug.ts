import NetInfo from '@react-native-community/netinfo';

// Network debugging for development
export class NetworkDebugger {
  private static requestCount = 0;
  private static errorCount = 0;
  private static startTime = Date.now();

  static logRequest(url: string, success: boolean = true) {
    if (!__DEV__) return;
    
    this.requestCount++;
    if (!success) this.errorCount++;
    
    const ratio = this.errorCount / this.requestCount;
    const elapsed = (Date.now() - this.startTime) / 1000;
    
    if (ratio > 0.5 && this.requestCount > 10) {
      console.warn(`🚨 HIGH ERROR RATE: ${(ratio * 100).toFixed(1)}% failures (${this.errorCount}/${this.requestCount}) in ${elapsed.toFixed(1)}s`);
      console.warn('Consider checking network connectivity or Supabase configuration');
    }
  }

  static async checkNetworkHealth(): Promise<void> {
    if (!__DEV__) return;
    
    try {
      const netState = await NetInfo.fetch();
      console.log('📶 Network State:', {
        connected: netState.isConnected,
        type: netState.type,
        strength: netState.details?.strength || 'unknown'
      });
    } catch (error) {
      console.error('Failed to check network state:', error);
    }
  }

  static reset() {
    this.requestCount = 0;
    this.errorCount = 0;
    this.startTime = Date.now();
  }
}

// Development-only network monitoring
if (__DEV__) {
  // Check network health every 30 seconds
  setInterval(() => {
    NetworkDebugger.checkNetworkHealth();
  }, 30000);
} 