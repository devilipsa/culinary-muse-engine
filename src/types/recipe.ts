export interface RecipeContent {
  ingredients: {
    category: string;
    items: string[];
  }[];
  steps: {
    instruction: string;
    context: string;
    time: string;
  }[];
  notes?: string[];
  variations?: string[];
  equipment?: string[];
  shopping_list?: string[];
}

export interface Recipe {
  id: string;
  title: string;
  summary: string;
  time: string;
  servings: number;
  calories: string;
  image?: string;
  content: RecipeContent;
  popularity_score: number;
  nutrition?: string;
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
