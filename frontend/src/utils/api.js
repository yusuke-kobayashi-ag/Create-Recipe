import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

// レシピ一覧の取得
export const getRecipes = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/recipes/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching recipes:', error);
    throw error;
  }
};

// レシピ詳細の取得
export const getRecipe = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/recipes/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching recipe:', error);
    throw error;
  }
};

// レシピの作成
export const createRecipe = async (recipe) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/recipes/`, recipe);
    return response.data;
  } catch (error) {
    console.error('Error creating recipe:', error);
    throw error;
  }
};

// レシピの更新
export const updateRecipe = async (id, recipe) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/recipes/${id}`, recipe);
    return response.data;
  } catch (error) {
    console.error('Error updating recipe:', error);
    throw error;
  }
};

// レシピの削除
export const deleteRecipe = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/recipes/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting recipe:', error);
    throw error;
  }
}; 