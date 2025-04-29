import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { createRecipe } from '../utils/api';

function RecipeCreate() {
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState({
    title: '',
    description: '',
    instructions: '',
    difficulty: 'easy',
    cooking_time: '',
    servings: '',
    ingredients: [{ name: '', unit: '', calories: '' }],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRecipe((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...recipe.ingredients];
    newIngredients[index] = {
      ...newIngredients[index],
      [field]: value,
    };
    setRecipe((prev) => ({
      ...prev,
      ingredients: newIngredients,
    }));
  };

  const addIngredient = () => {
    setRecipe((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, { name: '', unit: '', calories: '' }],
    }));
  };

  const removeIngredient = (index) => {
    setRecipe((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createRecipe(recipe);
      navigate('/');
    } catch (error) {
      console.error('Error creating recipe:', error);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          新規レシピ作成
        </Typography>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="レシピ名"
                name="title"
                value={recipe.title}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="説明"
                name="description"
                value={recipe.description}
                onChange={handleChange}
                multiline
                rows={2}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>難易度</InputLabel>
                <Select
                  name="difficulty"
                  value={recipe.difficulty}
                  onChange={handleChange}
                  label="難易度"
                >
                  <MenuItem value="easy">簡単</MenuItem>
                  <MenuItem value="medium">普通</MenuItem>
                  <MenuItem value="hard">難しい</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="調理時間（分）"
                name="cooking_time"
                type="number"
                value={recipe.cooking_time}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="分量（人分）"
                name="servings"
                type="number"
                value={recipe.servings}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                材料
              </Typography>
              {recipe.ingredients.map((ingredient, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <TextField
                    label="材料名"
                    value={ingredient.name}
                    onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                    required
                  />
                  <TextField
                    label="単位"
                    value={ingredient.unit}
                    onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                    required
                  />
                  <TextField
                    label="カロリー"
                    type="number"
                    value={ingredient.calories}
                    onChange={(e) => handleIngredientChange(index, 'calories', e.target.value)}
                  />
                  <IconButton
                    color="error"
                    onClick={() => removeIngredient(index)}
                    disabled={recipe.ingredients.length === 1}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
              <Button
                startIcon={<AddIcon />}
                onClick={addIngredient}
                variant="outlined"
                sx={{ mt: 1 }}
              >
                材料を追加
              </Button>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="作り方"
                name="instructions"
                value={recipe.instructions}
                onChange={handleChange}
                multiline
                rows={4}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/')}
                >
                  キャンセル
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                >
                  作成
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
}

export default RecipeCreate; 