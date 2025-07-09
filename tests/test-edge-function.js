// Test script to debug edge function authentication
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jiwiclemrwjojoewmcnc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imppd2ljbGVtcndqb2pvZXdtY25jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzNDUzODAsImV4cCI6MjA2NDkyMTM4MH0.SyjT3ongR53fjz6sLVtoo76dNJQ-f2O4kM-itCAwQ7k';

async function testEdgeFunction() {
  console.log('🧪 Testing Edge Function Authentication');
  console.log('=====================================');
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  // Test 1: Check if we can authenticate
  console.log('\n1. Testing authentication...');
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    console.log('❌ Not authenticated. Need to sign in first.');
    
    // Try to sign in with email/password
    const email = 'peter89amech@gmail.com'; // Your test email
    console.log(`\nTrying to sign in with: ${email}`);
    console.log('Please enter your password when prompted...');
    
    return;
  }
  
  console.log('✅ Authenticated as:', user.email);
  
  // Test 2: Get current session
  console.log('\n2. Getting current session...');
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !session) {
    console.log('❌ No valid session');
    return;
  }
  
  console.log('✅ Session exists');
  console.log('Access token (first 50 chars):', session.access_token.substring(0, 50) + '...');
  
  // Test 3: Call edge function with explicit headers
  console.log('\n3. Testing edge function call...');
  
  const testPayload = {
    userId: user.id,
    originalImageUrl: 'https://example.com/test.jpg',
    processingSettings: {
      backgroundRemoval: true,
      qualityEnhancement: true,
      resolution: '1024x1024'
    }
  };
  
  console.log('Payload:', JSON.stringify(testPayload, null, 2));
  console.log('Authorization header:', `Bearer ${session.access_token.substring(0, 50)}...`);
  
  try {
    const { data, error } = await supabase.functions.invoke('avatar-creation', {
      body: testPayload,
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (error) {
      console.log('❌ Edge function error:', error);
      console.log('Error details:', JSON.stringify(error, null, 2));
    } else {
      console.log('✅ Edge function success:', data);
    }
    
  } catch (err) {
    console.log('❌ Exception calling edge function:', err.message);
  }
}

testEdgeFunction().catch(console.error); 