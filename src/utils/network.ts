import NetInfo from '@react-native-community/netinfo';

export const checkNetworkConnectivity = async (): Promise<boolean> => {
  try {
    const state = await NetInfo.fetch();
    console.log('Network state:', state);
    return state.isConnected ?? false;
  } catch (error) {
    console.error('Error checking network connectivity:', error);
    return false;
  }
};

export const testSupabaseConnection = async (url: string): Promise<boolean> => {
  try {
    console.log('Testing Supabase connection to:', url);
    const response = await fetch(`${url}/rest/v1/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 5000,
    });
    
    console.log('Supabase connection test response:', response.status);
    // 401 is expected without proper auth headers, so that's actually a good response
    return response.status === 401 || response.status === 200;
  } catch (error) {
    console.error('Supabase connection test failed:', error);
    return false;
  }
};

export const waitForNetwork = async (maxAttempts: number = 5): Promise<boolean> => {
  for (let i = 0; i < maxAttempts; i++) {
    const isConnected = await checkNetworkConnectivity();
    if (isConnected) {
      return true;
    }
    console.log(`Network check attempt ${i + 1}/${maxAttempts} failed, retrying...`);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  return false;
}; 