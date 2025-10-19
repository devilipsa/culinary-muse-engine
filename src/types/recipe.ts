export interface SelectedIngredient {
  name: string;
  qty: string;
  unit: string;
  role: "primary" | "supporting" | "aromatic" | "acid" | "fat" | "seasoning";
}

export interface RecipeStep {
  n: number;
  do: string;
  why?: string;
  time: string;
}

export interface Timing {
  prep_min: number;
  cook_min: number;
  total_min: number;
}

export interface NutritionEstimate {
  kcal_per_serving: string;
  protein_g: string;
  carbs_g: string;
  fat_g: string;
}

export interface DishVisualization {
  image_prompt: string;
  alt: string;
  source: string;
  status: "ok" | "unavailable";
  url?: string;
}

export interface Recipe {
  id: string;
  title: string;
  summary: string;
  selected_ingredients: SelectedIngredient[];
  leftover_ingredients: string[];
  extras_to_buy: string[];
  equipment: string[];
  steps: RecipeStep[];
  timing: Timing;
  servings: number;
  nutrition_estimate: NutritionEstimate;
  subs_and_variations: string[];
  dish_visualization: DishVisualization;
  notes: string[];
  popularity_score: number;
}

export interface Session {
  id: string;
  user_id: string;
  prompt: string;
  suggestions_json: Recipe[];
  selected_index: number;
  n_suggestions: number;
  created_at: string;
}
