// Test with proper UUID format and VALID image URL
const { v4: uuidv4 } = require('uuid');

// Using Peter's real user ID from Supabase
const YOUR_REAL_USER_ID = "e64864b3-816f-46e1-acca-cab9a54eac19";

const testPayload = {
  avatarId: uuidv4(), // This generates a proper UUID
  userId: YOUR_REAL_USER_ID, // Peter's real user ID
  originalImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=face", // REAL valid image
  processingSettings: {
    backgroundRemoval: true,
    qualityEnhancement: true,
    resolution: "1024x1024"
  }
};

async function testWithValidImage() {
  console.log('🧪 Testing with Peter\'s real user ID and valid image...');
  console.log('Avatar ID:', testPayload.avatarId);
  console.log('User ID:', testPayload.userId);
  console.log('User Email: peter89amech@gmail.com');
  console.log('Image URL:', testPayload.originalImageUrl);
  
  try {
    const response = await fetch('http://localhost:5678/webhook/avatar-creation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload)
    });
    
    console.log('📊 Status:', response.status);
    const result = await response.text();
    console.log('📥 Response:', result);
    
    if (response.ok) {
      console.log('✅ Workflow completed successfully with Peter\'s real user!');
      try {
        const jsonResult = JSON.parse(result);
        console.log('🎯 Parsed Result:', JSON.stringify(jsonResult, null, 2));
      } catch (e) {
        console.log('⚠️ Response is not JSON format');
      }
    } else {
      console.log('❌ Workflow failed');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testWithValidImage(); 