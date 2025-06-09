import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const n8nWebhookUrl = Deno.env.get('N8N_VIRTUAL_TRYON_WEBHOOK_URL')! // Set this to your n8n webhook URL

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get user from JWT token
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    
    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    const { 
      avatarId, 
      clothingItems, 
      clothingItemData 
    } = await req.json()

    if (!avatarId || !clothingItems || clothingItems.length === 0) {
      throw new Error('Avatar ID and clothing items are required')
    }

    // Get user's avatar
    const { data: avatar, error: avatarError } = await supabase
      .from('user_avatars')
      .select('*')
      .eq('id', avatarId)
      .eq('user_id', user.id)
      .single()

    if (avatarError || !avatar) {
      throw new Error('Avatar not found or not accessible')
    }

    // Create a record in n8n_workflow_executions to track this process
    const { data: executionRecord, error: executionError } = await supabase
      .from('n8n_workflow_executions')
      .insert({
        user_id: user.id,
        workflow_type: 'virtual_tryon',
        workflow_data: {
          avatar_id: avatarId,
          clothing_items: clothingItems,
          clothing_item_data: clothingItemData
        },
        execution_status: 'pending'
      })
      .select()
      .single()

    if (executionError) {
      throw new Error(`Failed to create execution record: ${executionError.message}`)
    }

    // Create a virtual try-on result record
    const { data: tryonRecord, error: tryonError } = await supabase
      .from('virtual_tryon_results')
      .insert({
        user_id: user.id,
        avatar_id: avatarId,
        clothing_item_id: clothingItems[0]?.id, // For now, handle single item
        clothing_item_data: clothingItemData,
        processing_status: 'pending',
        n8n_execution_id: executionRecord.id
      })
      .select()
      .single()

    if (tryonError) {
      throw new Error(`Failed to create try-on record: ${tryonError.message}`)
    }

    // Prepare payload for n8n webhook
    const n8nPayload = {
      userId: user.id,
      avatarId: avatarId,
      avatarUrl: avatar.avatar_url,
      clothingItems,
      clothingItemData,
      tryonResultId: tryonRecord.id,
      executionId: executionRecord.id,
      supabaseUrl,
      supabaseServiceKey
    }

    // Trigger n8n workflow
    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(n8nPayload)
    })

    if (!n8nResponse.ok) {
      throw new Error(`n8n workflow failed: ${n8nResponse.statusText}`)
    }

    const n8nResult = await n8nResponse.json()

    // Update execution record with n8n execution ID
    await supabase
      .from('n8n_workflow_executions')
      .update({
        n8n_execution_id: n8nResult.executionId,
        execution_status: 'running'
      })
      .eq('id', executionRecord.id)

    // Update try-on record with Kling task ID if provided
    if (n8nResult.klingTaskId) {
      await supabase
        .from('virtual_tryon_results')
        .update({
          kling_task_id: n8nResult.klingTaskId,
          processing_status: 'processing'
        })
        .eq('id', tryonRecord.id)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Virtual try-on workflow started',
        tryonResultId: tryonRecord.id,
        executionId: executionRecord.id,
        n8nExecutionId: n8nResult.executionId,
        estimatedWaitTime: '30-60 seconds'
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
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
}) 