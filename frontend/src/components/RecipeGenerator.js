import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Card, CardContent, Grid } from '@mui/material';
import { generateRecipe } from '../api/recipe';

const RecipeGenerator = () => {
  const [ingredients, setIngredients] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // カンマ区切りの食材リストを配列に変換
      const ingredientList = ingredients.split(',').map(ing => ing.trim());
      const result = await generateRecipe(ingredientList);
      setRecipes(result);
    } catch (err) {
      setError('レシピの生成中にエラーが発生しました。');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        レシピ生成
      </Typography>
      
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="食材（カンマ区切りで入力）"
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          margin="normal"
          placeholder="例: たまねぎ, にんじん, じゃがいも"
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading}
          sx={{ mt: 2 }}
        >
          {loading ? '生成中...' : 'レシピを生成'}
        </Button>
      </form>

      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}

      <Grid container spacing={3} sx={{ mt: 3 }}>
        {recipes.map((recipe) => (
          <Grid item xs={12} md={6} key={recipe.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {recipe.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  調理時間: {recipe.readyInMinutes}分
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  難易度: {recipe.difficulty || '中級'}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  材料:
                </Typography>
                <ul>
                  {recipe.extendedIngredients?.map((ingredient) => (
                    <li key={ingredient.id}>
                      {ingredient.original}
                    </li>
                  ))}
                </ul>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  手順:
                </Typography>
                <ol>
                  {recipe.analyzedInstructions?.[0]?.steps.map((step) => (
                    <li key={step.number}>
                      {step.step}
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default RecipeGenerator; 