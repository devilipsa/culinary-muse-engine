export interface RecipeContent {
  ingredients: string[];
  steps: string[];
  notes?: string[];
}

export interface Recipe {
  id: string;
  title: string;
  summary: string;
  content: RecipeContent;
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
