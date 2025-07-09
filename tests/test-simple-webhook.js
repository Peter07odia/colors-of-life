// Simple webhook test with timeout
const testPayload = {
  avatarId: "test-simple-" + Date.now(),
  userId: "test-user-456",
  originalImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=face",
  processingSettings: {
    backgroundRemoval: true,
    qualityEnhancement: true,
    resolution: "1024x1024"
  }
};

async function testWithTimeout() {
  console.log('🧪 Testing Avatar Workflow with timeout...');
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
  
  try {
    const response = await fetch('http://localhost:5678/webhook/avatar-creation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    console.log('📊 Status:', response.status);
    const result = await response.text();
    console.log('📥 Response:', result);
    
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      console.log('⏰ Request timed out after 30 seconds');
      console.log('🔍 This suggests the workflow is stuck on a node');
      console.log('💡 Check n8n interface for execution status');
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

testWithTimeout(); 