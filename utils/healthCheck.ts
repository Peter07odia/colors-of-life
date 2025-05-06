/**
 * Application health check utilities
 * Used to diagnose and resolve common app issues
 */

interface HealthStatus {
  healthy: boolean;
  issues: string[];
  timestamp: string;
}

/**
 * Checks the overall health of the application
 * @returns HealthStatus object with diagnostics
 */
export async function checkAppHealth(): Promise<HealthStatus> {
  const status: HealthStatus = {
    healthy: true,
    issues: [],
    timestamp: new Date().toISOString()
  };

  try {
    // Check for localStorage access
    checkLocalStorage(status);
    
    // Check network connectivity
    await checkNetworkConnectivity(status);

    // Additional checks can be added here
  } catch (error) {
    status.healthy = false;
    status.issues.push(`Unexpected error during health check: ${error.message}`);
  }

  return status;
}

/**
 * Checks if localStorage is accessible
 */
function checkLocalStorage(status: HealthStatus): void {
  try {
    localStorage.setItem('healthCheck', 'test');
    const testValue = localStorage.getItem('healthCheck');
    localStorage.removeItem('healthCheck');
    
    if (testValue !== 'test') {
      status.healthy = false;
      status.issues.push('localStorage is not functioning correctly');
    }
  } catch (error) {
    status.healthy = false;
    status.issues.push(`localStorage error: ${error.message}`);
  }
}

/**
 * Checks network connectivity
 */
async function checkNetworkConnectivity(status: HealthStatus): Promise<void> {
  try {
    const online = navigator?.onLine;
    if (!online) {
      status.healthy = false;
      status.issues.push('Device is offline');
      return;
    }
    
    // Additional network checks could be added here
  } catch (error) {
    status.healthy = false;
    status.issues.push(`Network check error: ${error.message}`);
  }
}

/**
 * Clears application cache and resets state
 * Use this when the application is in a bad state
 */
export function resetAppState(): void {
  try {
    // Clear localStorage (consider backing up important data first)
    localStorage.clear();
    
    // Reload the page to start fresh
    window.location.reload();
  } catch (error) {
    console.error('Failed to reset app state:', error);
    // Force reload even if clearing storage failed
    window.location.reload();
  }
} 