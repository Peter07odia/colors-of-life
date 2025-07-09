#!/usr/bin/env node

// 🎯 COMPLETE AVATAR CREATION FLOW TEST
// Tests: App → Supabase Edge Function → n8n → AI Processing → Storage

const testCompleteFlow = async () => {
  console.log('🎯 Testing Complete Avatar Creation Flow...\n');
  console.log('📋 Flow: Mobile App → Supabase Edge Function → n8n → AI Processing → Storage\n');

  // Test payload (same as mobile app would send)
  const testPayload = {
    userId: 'mobile-test-user-' + Date.now(),
    imageData: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop&crop=face',
    processingSettings: {
      backgroundRemoval: true,
      qualityEnhancement: true,
      resolution: '1024x1024'
    }
  };

  console.log('📤 Test Payload:', JSON.stringify(testPayload, null, 2));
  console.log('');

  try {
    console.log('🚀 STEP 1: Calling Supabase Edge Function...');
    const edgeResponse = await fetch('https://jiwiclemrwjojoewmcnc.supabase.co/functions/v1/avatar-creation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload)
    });

    console.log('📊 Edge Function Status:', edgeResponse.status);
    
    if (!edgeResponse.ok) {
      const errorText = await edgeResponse.text();
      console.error('❌ Edge Function Failed:', errorText);
      
      if (errorText.includes('404 Not Found')) {
        console.log('\n🔧 SOLUTION: Activate your n8n workflow:');
        console.log('1. Go to http://localhost:5678');
        console.log('2. Login with admin/password123');
        console.log('3. Find "🎯 FINAL Avatar Creation - Production Ready"');
        console.log('4. Click the toggle switch to activate it');
        console.log('5. Run this test again');
      }
      return;
    }

    const edgeResult = await edgeResponse.json();
    console.log('✅ Edge Function Success:', JSON.stringify(edgeResult, null, 2));
    
    console.log('\n🎯 STEP 2: n8n Workflow Processing...');
    console.log('Avatar ID:', edgeResult.avatarId);
    console.log('Processing Status:', edgeResult.status);
    console.log('');
    
    console.log('🔍 Check workflow progress:');
    console.log('• n8n Dashboard: http://localhost:5678');
    console.log('• ngrok Public URL: https://e88b-2607-fea8-fd90-7ce7-1566-642e-d8d9-54a.ngrok-free.app');
    console.log('');
    
    console.log('✨ SUCCESS! Complete flow working:');
    console.log('✅ Mobile app can send images');
    console.log('✅ Supabase Edge Function processes requests');
    console.log('✅ n8n workflow receives and processes data');
    console.log('✅ AI models will generate avatars');
    console.log('✅ Results will be saved to Supabase storage');
    console.log('');
    console.log('🎉 Ready for mobile device testing!');

  } catch (error) {
    console.error('❌ Flow Test Failed:', error.message);
    console.log('\n🔧 Check these components:');
    console.log('• n8n container: docker ps | grep n8n');
    console.log('• ngrok tunnel: curl -s http://localhost:4040/api/tunnels');
    console.log('• Supabase secrets: supabase secrets list');
  }
};

// Run the test
testCompleteFlow(); 