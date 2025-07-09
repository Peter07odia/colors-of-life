// Test just the webhook reception
const testPayload = {
  avatarId: "webhook-test-" + Date.now(),
  userId: "test-user",
  originalImageUrl: "https://via.placeholder.com/400x600",
  processingSettings: {}
};

async function testWebhookOnly() {
  console.log('🔗 Testing webhook reception...');
  
  try {
    const response = await fetch('http://localhost:5678/webhook/avatar-creation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload)
    });
    
    console.log('📊 Status:', response.status);
    console.log('📊 Headers:', Object.fromEntries(response.headers.entries()));
    
    // Try to get response quickly
    const result = await Promise.race([
      response.text(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Response timeout')), 5000)
      )
    ]);
    
    console.log('📥 Response:', result);
    console.log('✅ Webhook is receiving requests properly');
    
  } catch (error) {
    if (error.message === 'Response timeout') {
      console.log('⏰ Webhook received request but response is slow');
      console.log('💡 This confirms webhook works but workflow is hanging');
    } else {
      console.error('❌ Webhook Error:', error.message);
    }
  }
}

testWebhookOnly(); 