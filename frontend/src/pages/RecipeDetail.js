import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Grid,
  List,
  ListItem,
  ListItemText,
  Button,
  Box,
} from '@mui/material';
import { getRecipe } from '../utils/api';
import { deleteRecipe } from '../api/recipe';

function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const data = await getRecipe(id);
        setRecipe(data);
      } catch (error) {
        console.error('Error fetching recipe:', error);
      }
    };

    fetchRecipe();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('本当にこのレシピを削除しますか？')) return;
    try {
      await deleteRecipe(recipe.id);
      navigate('/');
    } catch (e) {
      alert('削除に失敗しました');
    }
  };

  if (!recipe) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {recipe.title}
        </Typography>
        
        {recipe.image_url && (
          <Box sx={{ mb: 3 }}>
            <img
              src={recipe.image_url}
              alt={recipe.title}
              style={{ width: '100%', maxHeight: '400px', objectFit: 'cover' }}
            />
          </Box>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              材料
            </Typography>
            <List>
              {recipe.ingredients.map((ingredient) => (
                <ListItem key={ingredient.id}>
                  <ListItemText
                    primary={`${ingredient.name} ${ingredient.amount || '-'}${ingredient.unit || ''}`}
                    secondary={`カロリー: ${ingredient.calories != null ? ingredient.calories : 'N/A'} kcal`}
                  />
                </ListItem>
              ))}
            </List>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              調理情報
            </Typography>
            <Typography variant="body1" paragraph>
              調理時間: {recipe.cooking_time}分
            </Typography>
            <Typography variant="body1" paragraph>
              難易度: {recipe.difficulty}
            </Typography>
            <Typography variant="body1" paragraph>
              分量: {recipe.servings}人分
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              作り方
            </Typography>
            <Typography variant="body1" paragraph>
              {recipe.instructions}
            </Typography>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/')}
          >
            一覧に戻る
          </Button>

          <Button color="error" variant="contained" onClick={handleDelete}>
            削除
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default RecipeDetail; 