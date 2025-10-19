import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, n_suggestions = 5 } = await req.json();

    if (!prompt || !prompt.trim()) {
      return new Response(
        JSON.stringify({ error: "Prompt is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (![3, 5].includes(n_suggestions)) {
      return new Response(
        JSON.stringify({ error: "n_suggestions must be 3 or 5" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Generating ${n_suggestions} recipes for prompt: ${prompt}`);

    // Step 1: Generate recipes
    const recipesResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a creative recipe generator. Generate exactly ${n_suggestions} distinct, delicious recipes based on the user's input. For each recipe, provide:
- title: A catchy, descriptive name
- summary: A one-line description (max 90 characters)
- content: An object with:
  - ingredients: Array of ingredient strings with measurements
  - steps: Array of detailed cooking instruction strings
  - notes: Optional array of tips, variations, or serving suggestions
  
Return ONLY valid JSON with this exact structure:
{
  "recipes": [
    {
      "title": "Recipe Name",
      "summary": "Brief description",
      "content": {
        "ingredients": ["ingredient 1", "ingredient 2"],
        "steps": ["step 1", "step 2"],
        "notes": ["optional note"]
      }
    }
  ]
}`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.8,
      }),
    });

    if (!recipesResponse.ok) {
      const errorText = await recipesResponse.text();
      console.error("AI gateway error:", recipesResponse.status, errorText);
      
      if (recipesResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (recipesResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add more credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI generation failed: ${errorText}`);
    }

    const recipesData = await recipesResponse.json();
    let recipes;
    
    try {
      const content = recipesData.choices[0].message.content;
      const parsed = JSON.parse(content);
      recipes = parsed.recipes;
    } catch (e) {
      console.error("Failed to parse recipes JSON:", e);
      throw new Error("Invalid recipe format received from AI");
    }

    if (!recipes || recipes.length !== n_suggestions) {
      throw new Error(`Expected ${n_suggestions} recipes but got ${recipes?.length || 0}`);
    }

    // Step 2: Calculate popularity scores
    const scoringResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a culinary expert analyzing recipe popularity. For each recipe, estimate a popularity score from 0-100 based on:
- Global familiarity and cultural appeal (40 points)
- Simplicity and accessibility of ingredients (30 points)
- Dietary appeal (vegetarian/vegan/gluten-free gets bonus) (20 points)
- Ease of preparation (10 points)

Return ONLY a JSON array of numbers: [score1, score2, ...]`
          },
          {
            role: "user",
            content: `Rate these recipes:\n${recipes.map((r: any, i: number) => `${i + 1}. ${r.title}: ${r.summary}`).join("\n")}`
          }
        ],
        temperature: 0.3,
      }),
    });

    if (!scoringResponse.ok) {
      console.error("Scoring failed, using default scores");
      // Fallback to descending scores
      const scores = recipes.map((_: any, i: number) => 80 - (i * 10));
      recipes.forEach((r: any, i: number) => {
        r.id = crypto.randomUUID();
        r.popularity_score = scores[i];
      });
    } else {
      const scoringData = await scoringResponse.json();
      let scores;
      
      try {
        const content = scoringData.choices[0].message.content;
        scores = JSON.parse(content);
      } catch (e) {
        console.error("Failed to parse scores, using defaults");
        scores = recipes.map((_: any, i: number) => 80 - (i * 10));
      }

      recipes.forEach((r: any, i: number) => {
        r.id = crypto.randomUUID();
        r.popularity_score = scores[i] || 50;
      });
    }

    // Sort by popularity score (descending)
    recipes.sort((a: any, b: any) => b.popularity_score - a.popularity_score);

    // Save to database
    const { data: session, error: dbError } = await supabase
      .from("sessions")
      .insert({
        user_id: user.id,
        prompt,
        suggestions_json: recipes,
        selected_index: 0,
        n_suggestions,
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      throw new Error(`Failed to save session: ${dbError.message}`);
    }

    console.log(`Successfully generated and saved session ${session.id}`);

    return new Response(
      JSON.stringify({ sessionId: session.id, recipes }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in generate-recipes function:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error occurred" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
