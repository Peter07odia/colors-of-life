const fs = require('fs');

// Simple test workflow
const simpleWorkflow = {
  "name": "Simple Test Workflow",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "simple-test",
        "responseMode": "responseNode",
        "options": {}
      },
      "id": "webhook-node",
      "name": "Simple Webhook",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 2,
      "position": [240, 300],
      "webhookId": "simple-test"
    },
    {
      "parameters": {
        "jsCode": "console.log('=== SIMPLE TEST EXECUTED ===');\nconsole.log('Input:', JSON.stringify($input.first().json, null, 2));\n\nreturn [{\n  json: {\n    success: true,\n    message: 'Simple test working!',\n    timestamp: new Date().toISOString(),\n    received: $input.first().json\n  }\n}];"
      },
      "id": "code-node",
      "name": "Log Input",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [460, 300]
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{ $json }}"
      },
      "id": "response-node",
      "name": "Respond",
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1,
      "position": [680, 300]
    }
  ],
  "connections": {
    "Simple Webhook": {
      "main": [
        [
          {
            "node": "Log Input",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Log Input": {
      "main": [
        [
          {
            "node": "Respond",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "active": true,
  "settings": {},
  "versionId": "1"
};

async function importWorkflow() {
  try {
    const response = await fetch('http://10.0.0.202:5678/api/v1/workflows', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + Buffer.from('admin:password123').toString('base64')
      },
      body: JSON.stringify(simpleWorkflow)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Import failed:', response.status, errorText);
      return;
    }

    const result = await response.json();
    console.log('✅ Workflow imported successfully:', result.id);
    
    // Activate the workflow
    const activateResponse = await fetch(`http://10.0.0.202:5678/api/v1/workflows/${result.id}/activate`, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from('admin:password123').toString('base64')
      }
    });

    if (activateResponse.ok) {
      console.log('✅ Workflow activated successfully');
    } else {
      console.error('❌ Failed to activate workflow:', activateResponse.status);
    }

  } catch (error) {
    console.error('❌ Error importing workflow:', error.message);
  }
}

importWorkflow(); 