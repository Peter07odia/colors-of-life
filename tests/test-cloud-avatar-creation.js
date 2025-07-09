// Test Cloud Avatar Creation Workflow
// Tests the complete flow from React Native app through Supabase Edge Function to Cloud n8n

const { createClient } = require('@supabase/supabase-js');

// Configuration
const SUPABASE_URL = 'https://jiwiclemrwjojoewmcnc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imppd2ljbGVtcndqb2pvZXdtY25jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzNDUzODAsImV4cCI6MjA2NDkyMTM4MH0.SyjT3ongR53fjz6sLVtoo76dNJQ-f2O4kM-itCAwQ7k';

// Test user credentials (you should have a test user)
const TEST_EMAIL = 'demo@colorsoflife.com';
const TEST_PASSWORD = 'demo123456';

// Test image URL (publicly accessible)
const TEST_IMAGE_URL = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=face';

async function testAvatarCreation() {
  console.log('🚀 Testing Cloud Avatar Creation Workflow...');
  
  try {
    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Step 1: Authenticate test user
    console.log('🔐 Authenticating test user...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });
    
    if (authError) {
      console.error('❌ Authentication failed:', authError.message);
      return;
    }
    
    console.log('✅ Authentication successful for user:', authData.user.id);
    
    // Step 2: Call avatar creation edge function
    console.log('📸 Calling avatar creation edge function...');
    const avatarPayload = {
      userId: authData.user.id,
      originalImageUrl: TEST_IMAGE_URL,
      processingSettings: {
        backgroundRemoval: true,
        avatarGeneration: true,
        qualityUpscaling: true
      }
    };
    
    console.log('📤 Payload:', JSON.stringify(avatarPayload, null, 2));
    
    const { data: avatarResult, error: avatarError } = await supabase.functions.invoke('avatar-creation', {
      body: avatarPayload,
      headers: {
        Authorization: `Bearer ${authData.session.access_token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (avatarError) {
      console.error('❌ Avatar creation failed:', avatarError);
      return;
    }
    
    console.log('✅ Avatar creation result:', JSON.stringify(avatarResult, null, 2));
    
    // Step 3: Check avatar status in database
    console.log('🔍 Checking avatar in database...');
    const { data: avatars, error: dbError } = await supabase
      .from('user_avatars')
      .select('*')
      .eq('user_id', authData.user.id)
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (dbError) {
      console.error('❌ Database query failed:', dbError);
      return;
    }
    
    if (avatars && avatars.length > 0) {
      console.log('✅ Latest avatar found in database:');
      console.log('  - Avatar ID:', avatars[0].id);
      console.log('  - Processing Status:', avatars[0].processing_status);
      console.log('  - Avatar URL:', avatars[0].avatar_url);
      console.log('  - Background Removed URL:', avatars[0].background_removed_url);
      console.log('  - Created At:', avatars[0].created_at);
    } else {
      console.log('⚠️ No avatars found in database');
    }
    
    console.log('🎉 Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
testAvatarCreation(); 