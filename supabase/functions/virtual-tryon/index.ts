import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Handle both authenticated and anonymous users
    const authHeader = req.headers.get('Authorization')
    let supabaseClient
    let finalUserId
    let isAnonymous = false

    if (authHeader && authHeader !== 'Bearer null' && authHeader !== 'Bearer undefined') {
      // Authenticated user - use normal client
      console.log('🔐 Authenticated request detected')
      supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        {
          global: {
            headers: { Authorization: authHeader },
          },
        }
      )
      
      // Get user ID from auth
      const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
      if (userError || !user) {
        console.log('⚠️ Auth header invalid, falling back to anonymous mode')
        isAnonymous = true
      } else {
        finalUserId = user.id
        console.log('✅ Authenticated user:', finalUserId)
      }
    } else {
      console.log('👤 Anonymous request detected')
      isAnonymous = true
    }

    // For anonymous users, use service role client
    if (isAnonymous) {
      console.log('🔧 Using service role for anonymous user')
      const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
      if (!serviceRoleKey) {
        throw new Error('SUPABASE_SERVICE_ROLE_KEY not configured')
      }
      supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        serviceRoleKey,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      )
      finalUserId = 'anonymous-user-' + Date.now()
      console.log('✅ Service role client created for anonymous user:', finalUserId)
    }

    // Get request body
    const { userId, avatarId, clothingItems, processingSettings, clothingItemData, tryonSettings } = await req.json()

    // Use the resolved user ID (either from auth or generated for anonymous)
    const resolvedUserId = finalUserId || userId || 'anonymous-user-' + Date.now()

    console.log('Virtual try-on request:', { 
      resolvedUserId, 
      avatarId, 
      clothingItems: clothingItems?.length || 0, 
      isAnonymous 
    })

    // Define default models mapping first
    const defaultModels = {
      'petite': 'https://jiwiclemrwjojoewmcnc.supabase.co/storage/v1/object/public/avatars/default-models/petite.png',
      'average': 'https://jiwiclemrwjojoewmcnc.supabase.co/storage/v1/object/public/avatars/default-models/average.png',
      'athletic': 'https://jiwiclemrwjojoewmcnc.supabase.co/storage/v1/object/public/avatars/default-models/athletic.png',
      'curvy': 'https://jiwiclemrwjojoewmcnc.supabase.co/storage/v1/object/public/avatars/default-models/curvy.png',
      'medium-large': 'https://jiwiclemrwjojoewmcnc.supabase.co/storage/v1/object/public/avatars/default-models/medium-large.png',
      'xl': 'https://jiwiclemrwjojoewmcnc.supabase.co/storage/v1/object/public/avatars/default-models/xl.png'
    }

    // Resolve avatar URL based on avatar type (user avatar vs default model)
    let avatarUrl = null
    let resolvedAvatarId = avatarId
    let finalAvatarId = avatarId // Use mutable variable for avatar ID updates

    if (avatarId.startsWith('default-')) {
      // Handle default models - get URL from predefined models
      const modelId = avatarId.replace('default-', '')
      
      avatarUrl = defaultModels[modelId]
      if (!avatarUrl) {
        throw new Error(`Default model ${modelId} not found`)
      }
      
      console.log(`Using default model: ${modelId} -> ${avatarUrl}`)
    } else {
      // Handle user avatars - validate and get from database
      // For anonymous users, skip user validation since they can't have custom avatars
      if (isAnonymous) {
        console.log('⚠️ Anonymous user cannot use custom avatars, falling back to default model')
        // Fallback to default average model for anonymous users
        finalAvatarId = 'default-average'
        resolvedAvatarId = finalAvatarId
        avatarUrl = defaultModels['average']
      } else {
        const { data: avatar, error: avatarError } = await supabaseClient
          .from('user_avatars')
          .select('*')
          .eq('id', avatarId)
          .eq('user_id', resolvedUserId)
          .single()

        if (avatarError || !avatar) {
          throw new Error('User avatar not found or access denied')
        }
        
        avatarUrl = avatar.avatar_url || avatar.original_image_url
        if (!avatarUrl) {
          throw new Error('Avatar URL not available')
        }
        
        console.log(`Using user avatar: ${avatarId} -> ${avatarUrl}`)
      }
    }

    // Use clothing item data from service or prepare default
    const finalClothingItemData = clothingItemData || {
      items: clothingItems,
      totalItems: clothingItems.length,
      categories: [...new Set(clothingItems.map(item => item.category))],
      processingSettings: {
        qualityLevel: processingSettings?.qualityLevel || 'high',
        outputFormat: processingSettings?.generateVideo ? 'both' : 'image',
        generateVideo: processingSettings?.generateVideo || true,
        videoLength: processingSettings?.videoLength || 5,
        aspectRatio: processingSettings?.aspectRatio || '9:16'
      }
    }

    // Create initial try-on record in database using the correct client
    console.log('📝 Creating try-on record with client for user:', resolvedUserId, 'isAnonymous:', isAnonymous)
    const { data: tryOnRecord, error: insertError } = await supabaseClient
      .from('virtual_tryon_results')
      .insert({
        user_id: resolvedUserId,
        avatar_id: resolvedAvatarId,
        clothing_item_id: clothingItems[0]?.itemId || null, // Primary clothing item
        clothing_item_data: finalClothingItemData,
        processing_status: 'processing'
      })
      .select()
      .single()

    if (insertError) {
      throw insertError
    }

    console.log('Created try-on record:', tryOnRecord.id)

    // Trigger n8n workflow
    const n8nWebhookUrl = Deno.env.get('N8N_WEBHOOK_URL')
    
    console.log('🎯 Triggering N8N webhook for virtual try-on processing')
    
    if (n8nWebhookUrl) {
      // Prepare N8N payload to match workflow expectations
      const n8nPayload = {
        userId: resolvedUserId,
        avatarId: resolvedAvatarId,
        avatarUrl: avatarUrl,
        clothingItems: clothingItems,
        clothingItemData: finalClothingItemData,
        tryonSettings: tryonSettings || {
          qualityLevel: finalClothingItemData.processingSettings.qualityLevel,
          outputFormat: finalClothingItemData.processingSettings.outputFormat,
          autoCreateAvatar: false
        },
        // Additional metadata for N8N workflow tracking
        tryOnRecordId: tryOnRecord.id,
        executionId: `tryon_fal_${resolvedUserId}_${Date.now()}`,
        timestamp: new Date().toISOString(),
        isAnonymous: isAnonymous
      }

      console.log('🚀 Triggering n8n virtual try-on workflow')
      console.log('👤 Avatar URL being sent:', avatarUrl)
      console.log('🎯 Selected Avatar ID:', resolvedAvatarId)
      console.log('📦 Full payload:', n8nPayload)

      // Call n8n webhook with proper endpoint (N8N URL already includes /webhook/virtual-tryon-fal)
      const webhookResponse = await fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + btoa(Deno.env.get('N8N_BASIC_AUTH_USER') + ':' + Deno.env.get('N8N_BASIC_AUTH_PASSWORD')),
        },
        body: JSON.stringify(n8nPayload),
      }).catch(error => {
        console.error('n8n webhook error:', error)
        // Update try-on status to failed
        supabaseClient
          .from('virtual_tryon_results')
          .update({ 
            processing_status: 'failed',
            error_message: 'Failed to trigger processing workflow'
          })
          .eq('id', tryOnRecord.id)
          .then(() => console.log('Updated try-on status to failed'))
          
        throw error
      })

      if (webhookResponse && !webhookResponse.ok) {
        throw new Error(`N8N webhook failed with status: ${webhookResponse.status}`)
      }
      
      console.log('Successfully triggered N8N workflow')
    } else {
      throw new Error('N8N_WEBHOOK_URL not configured')
    }

    // Return immediate response
    return new Response(
      JSON.stringify({
        success: true,
        tryOnId: tryOnRecord.id,
        status: 'processing',
        message: 'Virtual try-on started successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Virtual try-on error:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        details: error.toString(),
        stack: error.stack
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})

/* To deploy this function you would run:
supabase functions deploy virtual-tryon

And make sure to set the following environment variables:
supabase secrets set N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook
*/ 