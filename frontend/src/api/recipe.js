const API_BASE_URL = 'http://localhost:8000';

export const generateRecipe = async (ingredients) => {
  try {
    // 食材リストをレシピ作成用の形式に変換
    const recipeData = {
      title: `${ingredients.join('と')}を使ったレシピ`,
      description: `${ingredients.join('、')}を使った美味しいレシピです。`,
      instructions: `1. ${ingredients.join('、')}を適切な大きさに切ります。\n2. 材料を炒めます。\n3. 調味料を加えて煮込みます。`,
      difficulty: "medium",
      cooking_time: 30,
      servings: 2,
      image_url: null,
      season: "all",
      cuisine_type: "japanese",
      ingredients: ingredients.map(name => ({
        name: name,
        unit: "適量",
        calories: null,
        protein: null,
        fat: null,
        carbs: null,
        season: "all",
        category: "other",
        is_vegetarian: true,
        is_vegan: true
      }))
    };

    const response = await fetch(`${API_BASE_URL}/recipes/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(recipeData),
    });

    if (!response.ok) {
      throw new Error('レシピの生成に失敗しました');
    }

    return await response.json();
  } catch (error) {
    console.error('Error generating recipe:', error);
    throw error;
  }
};

export const generateRecipeWithAI = async (ingredients, servings) => {
  const response = await fetch('http://localhost:8000/api/v1/recipes/generate/ai', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ingredients, servings }),
  });
  if (!response.ok) {
    throw new Error('レシピ生成に失敗しました');
  }
  return await response.json();
};

export const deleteRecipe = async (id) => {
  const response = await fetch(`http://localhost:8000/api/v1/recipes/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('レシピの削除に失敗しました');
  }
  return await response.json();
}; 