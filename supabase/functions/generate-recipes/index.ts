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
            content: `You are a creative recipe generator. Generate up to ${n_suggestions} distinct, delicious recipes based on the user's input. Aim for ${n_suggestions} recipes, but if ingredients are limited, you can suggest fewer (minimum 1).

For each recipe, provide:
- title: A catchy, descriptive name
- summary: A one-line description (max 90 characters)
- time: Total cooking time (e.g., "22 min", "1 hour 15 min")
- servings: Number of servings (integer)
- calories: Approximate calories per serving (e.g., "~150")
- image: A placeholder image URL from unsplash (food photography, relevant to the dish)
- content: An object with:
  - ingredients: Array of objects with "category" (primary/fat/seasoning/vegetable/etc) and "items" array
  - steps: Array of objects with "instruction", "context" (helpful tip/explanation in italic style), and "time" (e.g., "2 min", "5-10 min")
  - equipment: Array of required equipment strings
  - shopping_list: Array of items user might need to buy (optional items not in their ingredients)
  - variations: Array of variation/substitution suggestions
  - notes: Array of helpful cooking notes or tips
- nutrition: Nutrition facts string (e.g., "~150 kcal, P: ~2g, C: ~25g, F: ~6g")

CRITICAL: Return ONLY the raw JSON object, no markdown formatting, no code blocks, no backticks.

Format:
{
  "recipes": [
    {
      "title": "Recipe Name",
      "summary": "Brief description",
      "time": "22 min",
      "servings": 2,
      "calories": "~150",
      "image": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80",
      "content": {
        "ingredients": [
          {"category": "primary", "items": ["1 can jackfruit"]},
          {"category": "fat", "items": ["1 tbsp olive oil"]},
          {"category": "seasoning", "items": ["0.5 tsp salt", "0.25 tsp black pepper"]}
        ],
        "steps": [
          {
            "instruction": "Drain the canned jackfruit in a colander and rinse thoroughly.",
            "context": "Rinsing removes the briny taste and makes the jackfruit ready for seasoning.",
            "time": "2 min"
          }
        ],
        "equipment": ["can opener", "colander", "large skillet", "spatula"],
        "shopping_list": ["corn tortillas", "lime", "cilantro"],
        "variations": ["Add smoked paprika for authentic flavor", "Use coconut oil instead"],
        "notes": ["Use young green jackfruit in brine, not ripe in syrup"]
      },
      "nutrition": "~150 kcal, P: ~2g, C: ~25g, F: ~6g"
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
      let content = recipesData.choices[0].message.content;
      
      // Strip markdown code blocks if present
      content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      const parsed = JSON.parse(content);
      recipes = parsed.recipes;
    } catch (e) {
      console.error("Failed to parse recipes JSON:", e);
      throw new Error("Invalid recipe format received from AI");
    }

    if (!recipes || recipes.length === 0) {
      throw new Error("No recipes were generated");
    }

    // Allow flexibility: if AI returns fewer recipes, that's ok as long as we have at least 1
    if (recipes.length > n_suggestions) {
      recipes = recipes.slice(0, n_suggestions);
    }
    
    console.log(`Successfully generated ${recipes.length} recipes`);

    // Step 2: Generate dish visualization images
    console.log("Generating dish images...");
    for (const recipe of recipes) {
      try {
        const imagePrompt = `A professional food photography shot of ${recipe.title}. ${recipe.summary}. High quality, appetizing, well-plated, natural lighting, no text overlays.`;
        
        const imageResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-image-preview",
            messages: [
              {
                role: "user",
                content: imagePrompt
              }
            ],
            modalities: ["image", "text"]
          }),
        });

        if (imageResponse.ok) {
          const imageData = await imageResponse.json();
          const imageUrl = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
          
          if (imageUrl) {
            recipe.image = imageUrl;
            recipe.image_source = "generated:google/gemini-2.5-flash-image-preview";
            recipe.image_alt = `Professional food photography of ${recipe.title}: ${recipe.summary}`;
            console.log(`Generated image for: ${recipe.title}`);
          } else {
            console.log(`No image in response for: ${recipe.title}, keeping fallback`);
            recipe.image_source = recipe.image ? `search:unsplash.com` : "unavailable";
          }
        } else {
          console.log(`Image generation failed for: ${recipe.title}, status: ${imageResponse.status}`);
          recipe.image_source = recipe.image ? `search:unsplash.com` : "unavailable";
        }
      } catch (imageError) {
        console.error(`Image generation error for ${recipe.title}:`, imageError);
        recipe.image_source = recipe.image ? `search:unsplash.com` : "unavailable";
      }
    }

    // Step 3: Calculate popularity scores
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
        let content = scoringData.choices[0].message.content;
        // Strip markdown code blocks if present
        content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
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
