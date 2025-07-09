import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Helper function to upload base64 image to Supabase Storage
async function uploadBase64ToStorage(supabaseClient: any, base64Data: string, userId: string, avatarId: string) {
  try {
    console.log('📤 Uploading base64 image to Supabase Storage...')
    
    // Remove data URL prefix if present (data:image/jpeg;base64,...)
    const base64String = base64Data.replace(/^data:image\/[a-z]+;base64,/, '')
    
    // Convert base64 to ArrayBuffer
    const binaryString = atob(base64String)
    const arrayBuffer = new ArrayBuffer(binaryString.length)
    const uint8Array = new Uint8Array(arrayBuffer)
    
    for (let i = 0; i < binaryString.length; i++) {
      uint8Array[i] = binaryString.charCodeAt(i)
    }
    
    // Create file path
    const fileName = `${avatarId}_${Date.now()}.jpg`
    const filePath = `${userId}/avatars/${fileName}`
    
    console.log('📁 Upload path:', filePath)
    
    // Upload to Supabase Storage
    const { data, error } = await supabaseClient.storage
      .from('avatars')
      .upload(filePath, arrayBuffer, {
        contentType: 'image/jpeg',
        upsert: true
      })
    
    if (error) {
      console.error('❌ Storage upload error:', error)
      throw new Error(`Storage upload failed: ${error.message}`)
    }
    
    console.log('✅ Upload successful:', data)
    
    // Get public URL
    const { data: { publicUrl } } = supabaseClient.storage
      .from('avatars')
      .getPublicUrl(data.path)
    
    console.log('🔗 Public URL:', publicUrl)
    return publicUrl
    
  } catch (error) {
    console.error('❌ Upload error:', error)
    throw error
  }
}

// Note: Direct FAL.ai processing removed - all processing now goes through N8N workflow

// Process avatar ONLY via N8N workflow - no fallback to direct processing
async function processAvatarViaWorkflow(imageUrl: string, userId: string, avatarId: string, supabaseClient: any) {
  const n8nWebhookUrl = Deno.env.get('N8N_AVATAR_WEBHOOK_URL') || Deno.env.get('N8N_WEBHOOK_URL')
  
  if (!n8nWebhookUrl) {
    console.error('❌ N8N_WEBHOOK_URL not configured')
    throw new Error('N8N_WEBHOOK_URL must be configured for avatar processing')
  }

  console.log('🚀 Processing avatar via N8N workflow ONLY...')
  
  const n8nPayload = {
    avatarId,
    userId,
    originalImageUrl: imageUrl,
    processingSettings: {
      backgroundRemoval: true,
      avatarGeneration: true,
      qualityUpscaling: true
    }
  }

  // Log the webhook URL being used (first 50 chars for security)
  console.log('🔗 N8N Webhook URL (first 50 chars):', n8nWebhookUrl.substring(0, 50) + '...')
  console.log('📤 N8N Payload:', JSON.stringify(n8nPayload, null, 2))

  try {
    // Call n8n webhook
    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(n8nPayload),
      signal: AbortSignal.timeout(120000) // 2 minute timeout for workflow processing
    })

    console.log('📊 N8N Response Status:', n8nResponse.status)
    console.log('📊 N8N Response Headers:', Object.fromEntries(n8nResponse.headers.entries()))

    if (n8nResponse.ok) {
      const n8nResult = await n8nResponse.json()
      console.log('✅ N8N workflow processing initiated successfully:', n8nResult)
      
      // N8N workflow started successfully - avatar will be updated by the workflow
      return {
        avatarUrl: imageUrl, // Temporary - will be updated by workflow
        backgroundRemovedUrl: '',
        status: 'processing',
        workflowId: n8nResult.executionId || 'unknown',
        message: 'Avatar processing started via N8N workflow'
      }
    } else {
      const errorText = await n8nResponse.text()
      console.log(`❌ N8N webhook failed with status ${n8nResponse.status}`)
      console.log(`❌ N8N error response:`, errorText)
      
      // Update avatar status to failed
      await supabaseClient
        .from('user_avatars')
        .update({
          processing_status: 'failed',
          error_message: `N8N workflow failed: ${n8nResponse.status} - ${errorText}`,
          processed_at: new Date().toISOString()
        })
        .eq('id', avatarId)
      
      throw new Error(`N8N workflow failed: ${n8nResponse.status} ${n8nResponse.statusText} - ${errorText}`)
    }
  } catch (error) {
    console.error('❌ Failed to call N8N workflow:', error)
    
    // Update avatar status to failed
    await supabaseClient
      .from('user_avatars')
      .update({
        processing_status: 'failed',
        error_message: `Failed to start N8N workflow: ${error.message}`,
        processed_at: new Date().toISOString()
      })
      .eq('id', avatarId)
    
    throw new Error(`Failed to start N8N workflow: ${error.message}`)
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('=== AVATAR CREATION REQUEST ===')
    
    // Get authorization header for authenticated requests
    const authHeader = req.headers.get('authorization')
    console.log('Authorization header present:', !!authHeader)
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? 'https://jiwiclemrwjojoewmcnc.supabase.co'
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_ANON_KEY') ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imppd2ljbGVtcndqb2pvZXdtY25jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzNDUzODAsImV4cCI6MjA2NDkyMTM4MH0.SyjT3ongR53fjz6sLVtoo76dNJQ-f2O4kM-itCAwQ7k'
    
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
      global: {
        headers: authHeader ? { Authorization: authHeader } : {}
      }
    })

    // If we have an auth header, try to get the user
    let authenticatedUserId = null
    if (authHeader) {
      try {
        const { data: { user }, error } = await supabaseClient.auth.getUser()
        if (user && !error) {
          authenticatedUserId = user.id
          console.log('Authenticated user:', authenticatedUserId)
        }
      } catch (authError) {
        console.warn('Auth verification failed, continuing without auth:', authError)
      }
    }
    
    // Get request body
    const requestBody = await req.json()
    console.log('Request body:', JSON.stringify(requestBody, null, 2))

    const { userId, originalImageUrl, imageUri, imageData, processingSettings } = requestBody

    // Use any available image field
    let imageUrl = originalImageUrl || imageUri || imageData
    
    console.log('Extracted data:', { userId, imageUrl: imageUrl?.substring(0, 100) + '...', processingSettings })

    // Validate required fields
    if (!userId) {
      throw new Error('Missing required field: userId')
    }
    if (!imageUrl) {
      throw new Error('Missing required field: originalImageUrl, imageUri, or imageData')
    }

    // Use authenticated user ID if available, otherwise use provided userId
    const finalUserId = authenticatedUserId || userId

    // Generate avatar ID using proper UUID format
    const avatarId = crypto.randomUUID()
    console.log('Generated avatar ID:', avatarId)
    console.log('Using user ID:', finalUserId)

    // Handle different image formats
    if (imageUrl.startsWith('file://') || imageUrl.includes('CoreSimulator')) {
      console.log('❌ Cannot process local file URIs directly')
      throw new Error('Local file URIs cannot be processed. Please send image as base64 data.')
    } else if (imageUrl.startsWith('data:image/') || (imageUrl.length > 1000 && !imageUrl.startsWith('http'))) {
      // This is base64 image data
      console.log('🖼️ Processing base64 image data...')
      imageUrl = await uploadBase64ToStorage(supabaseClient, imageUrl, finalUserId, avatarId)
    } else if (!imageUrl.startsWith('http')) {
      console.log('❌ Invalid image URL format')
      throw new Error('Invalid image URL format. Must be HTTP URL or base64 data.')
    }

    console.log('🔗 Final image URL:', imageUrl)
    
    // Create initial avatar record in database
    console.log('💾 Creating initial avatar record in database...')
    const { data: avatarRecord, error: avatarError } = await supabaseClient
      .from('user_avatars')
      .insert({
        id: avatarId,
        user_id: finalUserId,
        avatar_url: imageUrl, // Initially set to original image
        original_image_url: imageUrl,
        processing_status: 'processing',
        avatar_type: 'ai_generated',
        is_primary: true // Set as primary for now
      })
      .select()
      .single()

    if (avatarError) {
      console.error('❌ Failed to create avatar record:', avatarError)
      throw new Error(`Failed to create avatar record: ${avatarError.message}`)
    }

    console.log('✅ Avatar record created:', avatarRecord)
    
    // Process avatar via N8N workflow only
    console.log('🚀 Processing avatar via N8N workflow...')
    const result = await processAvatarViaWorkflow(imageUrl, finalUserId, avatarId, supabaseClient)

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        avatarId: avatarId,
        status: 'completed',
        message: 'Avatar created successfully',
        originalImageUrl: imageUrl,
        avatarUrl: result.avatarUrl,
        backgroundRemovedUrl: result.backgroundRemovedUrl
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('❌ Avatar creation error:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        details: 'Check edge function logs for more details'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})

/* To deploy this function:
1. Deploy function: supabase functions deploy avatar-creation
2. Set environment variables:
   supabase secrets set N8N_WEBHOOK_URL=http://localhost:5678/webhook
*/ 