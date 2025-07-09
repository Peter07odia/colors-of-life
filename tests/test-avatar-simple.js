#!/usr/bin/env node

// Simple test script for avatar creation workflow
// No authentication, no complex setup - just works

const testAvatarCreation = async () => {
  console.log('🧪 Testing Avatar Creation Workflow...\n');

  // Test with a real image URL
  const testPayload = {
    userId: 'test-user-123',
    originalImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop&crop=face',
    processingSettings: {
      backgroundRemoval: true,
      qualityEnhancement: true,
      resolution: '1024x1024'
    }
  };

  console.log('📤 Sending payload:', JSON.stringify(testPayload, null, 2));
  console.log('');

  try {
    // Call Supabase Edge Function
    console.log('🔗 Calling Supabase Edge Function...');
    const edgeResponse = await fetch('https://jiwiclemrwjojoewmcnc.supabase.co/functions/v1/avatar-creation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload)
    });

    console.log('📊 Edge Function Response Status:', edgeResponse.status);
    
    if (!edgeResponse.ok) {
      const errorText = await edgeResponse.text();
      console.error('❌ Edge Function Error:', errorText);
      return;
    }

    const edgeResult = await edgeResponse.json();
    console.log('✅ Edge Function Success:', JSON.stringify(edgeResult, null, 2));
    console.log('');
    console.log('🎯 Avatar ID:', edgeResult.avatarId);
    console.log('📸 Image URL:', edgeResult.originalImageUrl);
    console.log('');
    console.log('✨ Check your n8n dashboard at http://localhost:5678 to see the workflow progress!');

  } catch (error) {
    console.error('❌ Test Failed:', error.message);
  }
};

// Run the test
testAvatarCreation(); 