import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { Configuration, OpenAIApi } from "https://esm.sh/openai@3.2.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the latest PDF file
    const { data: files, error: filesError } = await supabase
      .from('pdf_files')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)

    if (filesError || !files?.length) {
      console.error('Error fetching PDF file:', filesError)
      throw new Error('No PDF file found')
    }

    const pdfFile = files[0]

    // Get the PDF content from storage
    const { data: pdfData, error: storageError } = await supabase
      .storage
      .from('pdf-bucket')
      .download(pdfFile.file_path)

    if (storageError) {
      console.error('Error downloading PDF:', storageError)
      throw new Error('Failed to download PDF')
    }

    // Initialize OpenAI
    const configuration = new Configuration({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    })
    const openai = new OpenAIApi(configuration)

    // Extract text content from PDF and generate shorts
    const pdfText = await pdfData.text()
    
    const prompt = `Based on this PDF content, create 3 educational shorts. Each short should have:
    1. A topic name
    2. A brief summary
    3. 3 multiple choice questions with 4 options each (one correct)
    
    Format the response as JSON like this:
    {
      "shorts": [
        {
          "topic_name": "string",
          "topic_summary": "string",
          "questions": [
            {
              "question_text": "string",
              "options": [
                {
                  "option_text": "string",
                  "is_correct": boolean
                }
              ]
            }
          ]
        }
      ]
    }
    
    PDF Content:
    ${pdfText.substring(0, 3000)}`

    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    })

    const shortsData = JSON.parse(completion.data.choices[0].message.content)

    // Insert the shorts and their associated questions/options
    for (const short of shortsData.shorts) {
      // Insert short
      const { data: shortData, error: shortError } = await supabase
        .from('shorts')
        .insert({
          topic_name: short.topic_name,
          topic_summary: short.topic_summary,
          status: 'draft'
        })
        .select()
        .single()

      if (shortError) {
        console.error('Error creating short:', shortError)
        continue
      }

      // Insert questions for this short
      for (const question of short.questions) {
        const { data: questionData, error: questionError } = await supabase
          .from('questions')
          .insert({
            short_id: shortData.id,
            question_text: question.question_text
          })
          .select()
          .single()

        if (questionError) {
          console.error('Error creating question:', questionError)
          continue
        }

        // Insert options for this question
        const optionsPromises = question.options.map(option =>
          supabase
            .from('options')
            .insert({
              question_id: questionData.id,
              option_text: option.option_text,
              is_correct: option.is_correct
            })
        )

        await Promise.all(optionsPromises)
      }
    }

    return new Response(
      JSON.stringify({ message: 'Shorts initialized successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in initialize-shorts function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})