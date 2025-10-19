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

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");
    const { data: { user } } = await supabase.auth.getUser(token);

    if (!user) {
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
            content: `You are an intelligent recipe generator. Return a complete, useful recipe artifact based on user input.

INGREDIENT INTELLIGENCE:
- You will receive provided_ingredients. Use this as your primary pantry.
- Select ingredients intelligently - NOT ALL must be used. Choose only what strengthens the dish.
- You may add at most 3 common staples if essential (salt, oil, pepper, water, basic sugar/flour).
- If more items are needed beyond the 3 staples, list them in extras_to_buy.
- Maximize synergy: primary + supporting + aromatic + acid + fat.
- Avoid redundant roles (e.g., two similar herbs unless they stack).
- If a provided ingredient clashes, prefer skipping it.
- Compute: selected_ingredients (what you use) and leftover_ingredients (what you don't use).

DISH VISUALIZATION:
- Create an image_prompt for the dish: include dish name, core ingredients, plating style, garnish, lighting.
- NO overlaid text, NO logos, realistic presentation.
- Example: "a shallow ceramic bowl of lemon-garlic chicken with roasted zucchini and cherry tomatoes, sprinkled with parsley, natural window light, 3/4 angle, no text overlay"

Generate up to ${n_suggestions} distinct recipes. Aim for ${n_suggestions}, but if ingredients are very limited, you can suggest fewer (minimum 1).

CRITICAL: Return ONLY raw JSON, no markdown, no code blocks, no backticks.

Format:
{
  "recipes": [
    {
      "title": "Short Dish Name",
      "summary": "1-2 sentences on flavor + why these ingredients",
      "selected_ingredients": [
        {"name": "chicken breast", "qty": "2", "unit": "pieces", "role": "primary"},
        {"name": "olive oil", "qty": "2", "unit": "tbsp", "role": "fat"},
        {"name": "garlic", "qty": "3", "unit": "cloves", "role": "aromatic"},
        {"name": "lemon juice", "qty": "2", "unit": "tbsp", "role": "acid"},
        {"name": "salt", "qty": "1", "unit": "tsp", "role": "seasoning"}
      ],
      "leftover_ingredients": ["bell pepper", "rice"],
      "extras_to_buy": ["parsley"],
      "equipment": ["pan", "knife", "cutting board"],
      "steps": [
        {"n": 1, "do": "Mince garlic and set aside", "why": "Prepares aromatics", "time": "~2 min"},
        {"n": 2, "do": "Heat oil in pan over medium heat", "time": "~2 min"},
        {"n": 3, "do": "Add chicken, cook 6-7 min per side until golden", "why": "Develops flavor and ensures doneness", "time": "~15 min"}
      ],
      "timing": {"prep_min": 5, "cook_min": 15, "total_min": 20},
      "servings": 2,
      "nutrition_estimate": {"kcal_per_serving": "~320", "protein_g": "~35", "carbs_g": "~3", "fat_g": "~18"},
      "subs_and_variations": ["Use lime instead of lemon", "Add thyme for extra aroma"],
      "dish_visualization": {
        "image_prompt": "golden seared chicken breast with garlic and lemon in a cast iron skillet, garnished with fresh parsley, natural daylight, 45-degree angle, no text overlay",
        "alt": "Seared chicken with garlic and lemon in skillet",
        "source": "pending",
        "status": "pending"
      },
      "notes": ["Chicken is done when internal temp reaches 165°F", "Let rest 3 min before serving"]
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
        const imagePrompt = recipe.dish_visualization?.image_prompt || 
          `A professional food photography shot of ${recipe.title}. ${recipe.summary}. High quality, appetizing, well-plated, natural lighting, no text overlays.`;
        
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
            recipe.dish_visualization = {
              ...recipe.dish_visualization,
              url: imageUrl,
              source: "generated:google/gemini-2.5-flash-image-preview",
              status: "ok"
            };
            console.log(`Generated image for: ${recipe.title}`);
          } else {
            console.log(`No image in response for: ${recipe.title}`);
            recipe.dish_visualization = {
              ...recipe.dish_visualization,
              source: "unavailable",
              status: "unavailable"
            };
          }
        } else {
          console.log(`Image generation failed for: ${recipe.title}, status: ${imageResponse.status}`);
          recipe.dish_visualization = {
            ...recipe.dish_visualization,
            source: "unavailable",
            status: "unavailable"
          };
        }
      } catch (imageError) {
        console.error(`Image generation error for ${recipe.title}:`, imageError);
        recipe.dish_visualization = {
          ...recipe.dish_visualization,
          source: "unavailable",
          status: "unavailable"
        };
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
