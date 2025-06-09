import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const n8nWebhookUrl = Deno.env.get('N8N_AVATAR_WEBHOOK_URL')! // Set this to your n8n webhook URL

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

    const { userPhotoBase64, avatarType = 'custom' } = await req.json()

    if (!userPhotoBase64) {
      throw new Error('User photo is required')
    }

    // Create a record in n8n_workflow_executions to track this process
    const { data: executionRecord, error: executionError } = await supabase
      .from('n8n_workflow_executions')
      .insert({
        user_id: user.id,
        workflow_type: 'avatar_creation',
        workflow_data: {
          avatar_type: avatarType,
          has_user_photo: true
        },
        execution_status: 'pending'
      })
      .select()
      .single()

    if (executionError) {
      throw new Error(`Failed to create execution record: ${executionError.message}`)
    }

    // Prepare payload for n8n webhook
    const n8nPayload = {
      userId: user.id,
      userPhotoBase64,
      avatarType,
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

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Avatar creation workflow started',
        executionId: executionRecord.id,
        n8nExecutionId: n8nResult.executionId
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Avatar creation error:', error)
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