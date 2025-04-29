import React, { useState, useEffect } from 'react';
import { Container, Grid, Card, CardContent, CardMedia, Typography, Button, Box, TextField } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { getRecipes } from '../utils/api';

function RecipeList() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const data = await getRecipes();
        setRecipes(data);
      } catch (error) {
        console.error('Error fetching recipes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  const filteredRecipes = recipes.filter(
    (recipe) =>
      recipe.title.toLowerCase().includes(search.toLowerCase()) ||
      recipe.description.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div>読み込み中...</div>;

  if (recipes.length === 0) {
    return (
      <div style={{ textAlign: 'center', marginTop: '3em' }}>
        <h2>まだレシピがありません</h2>
        <p>「レシピを生成」から、あなたの材料で新しいレシピを作ってみましょう！</p>
      </div>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        レシピ一覧
      </Typography>
      <TextField
        label="レシピ検索"
        variant="outlined"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        fullWidth
        sx={{ mb: 3 }}
      />
      <Grid container spacing={4}>
        {filteredRecipes.map((recipe) => (
          <Grid item key={recipe.id} xs={12} sm={6} md={4}>
            <Card sx={{ minHeight: 300, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              {recipe.image_url && (
                <CardMedia
                  component="img"
                  height="200"
                  image={recipe.image_url}
                  alt={recipe.title}
                />
              )}
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <Typography gutterBottom variant="h5" component="div">
                  {recipe.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {recipe.description}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  調理時間: {recipe.cooking_time}分
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  難易度: {recipe.difficulty}
                </Typography>
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    component={RouterLink}
                    to={`/recipes/${recipe.id}`}
                    variant="contained"
                    color="primary"
                  >
                    詳細を見る
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default RecipeList; 