import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(supabaseUrl, supabaseKey)

// Initialize the real-time listener
const channel = supabase
  .channel('db-changes')
  .on(
    'postgres_changes',
    {
      event: '*', // Listen to all events
      schema: 'public',
      table: 'pdf_files' // Replace with the table you want to listen to
    },
    (payload) => {
      console.log('Change received!', payload)
    }
  )
  .subscribe((status) => {
    console.log('Subscription status:', status)
    
    if (status === 'SUBSCRIBED') {
      console.log('Successfully subscribed to changes!')
    } else if (status === 'CHANNEL_ERROR') {
      console.error('Failed to subscribe to changes')
    }
  })

// Handle errors
channel.onError((err) => {
  console.error('Real-time subscription error:', err)
})

Deno.serve(async (req) => {
  const { method } = req

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  // Handle CORS preflight requests
  if (method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Your function logic here
    return new Response(
      JSON.stringify({ message: 'Realtime listener initialized' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})