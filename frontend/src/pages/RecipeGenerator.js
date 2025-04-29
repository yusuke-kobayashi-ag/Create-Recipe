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
  IconButton,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { generateRecipeWithAI } from '../api/recipe';
import Autocomplete from '@mui/material/Autocomplete';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';

const unitOptions = ['g', '個', '本', 'ml', 'カップ', '枚', '小さじ', '大さじ', '適量'];

const ingredientOptions = [
  // 野菜
  'たまねぎ', 'にんじん', 'じゃがいも', 'ピーマン', 'トマト', 'キャベツ', 'レタス', 'きゅうり', 'なす', 'ほうれん草', '小松菜', '白菜', '大根', 'ごぼう', 'れんこん', 'さつまいも', 'かぼちゃ', 'ブロッコリー', 'カリフラワー', 'アスパラガス', 'もやし', 'しめじ', 'えのき', 'しいたけ', 'まいたけ', 'エリンギ', 'ミニトマト', 'ズッキーニ', 'パプリカ', 'セロリ', 'オクラ', '長ねぎ', 'にら', 'みょうが', '三つ葉', '春菊', '水菜', 'チンゲン菜', 'カブ', 'ラディッシュ', 'とうもろこし', '枝豆', 'そら豆', 'スナップえんどう', 'グリーンピース', '山芋', '里芋', 'タケノコ', 'ごま', '生姜', 'にんにく',

  // 肉・魚・卵
  '鶏もも肉', '鶏むね肉', '豚肉', '豚バラ肉', '豚ひき肉', '牛肉', '牛ひき肉', '合いびき肉', 'ベーコン', 'ウインナー', 'ハム', '卵', '鮭', 'サバ', 'アジ', 'イワシ', 'タラ', 'ブリ', 'マグロ', 'カツオ', 'サンマ', 'ホタテ', 'エビ', 'イカ', 'タコ', 'しらす', 'ちくわ', 'かまぼこ', 'ツナ缶', 'カニカマ',

  // 乳製品・豆製品
  '牛乳', 'ヨーグルト', 'バター', 'チーズ', '生クリーム', '豆腐', '厚揚げ', '油揚げ', '納豆', 'おから', '豆乳', '高野豆腐', 'みそ',

  // 穀類・粉類
  'ごはん', '米', 'パン', '食パン', 'うどん', 'そば', 'そうめん', 'パスタ', 'スパゲッティ', 'マカロニ', '小麦粉', '片栗粉', 'パン粉', 'コーンスターチ', 'もち米', 'お餅', '春巻きの皮', '餃子の皮',

  // 調味料・油
  '砂糖', '塩', 'しょうゆ', 'みそ', '酢', 'みりん', '酒', 'ごま油', 'オリーブオイル', 'サラダ油', 'バルサミコ酢', 'ケチャップ', 'マヨネーズ', 'ウスターソース', '中濃ソース', 'とんかつソース', 'ポン酢', 'めんつゆ', 'カレー粉', 'コンソメ', '鶏ガラスープの素', 'だしの素', '顆粒だし', '白だし', '豆板醤', 'コチュジャン', 'ナンプラー', 'オイスターソース', 'バター', 'マーガリン', 'レモン汁', '黒こしょう', '白こしょう', '七味唐辛子', '一味唐辛子', '山椒', 'カレー粉', 'ガラムマサラ', 'シナモン', 'ナツメグ', 'バジル', 'オレガノ', 'ローリエ', 'パセリ', 'ディル', 'タイム', 'ローズマリー', 'クミン', 'コリアンダー',

  // 果物・ナッツ
  'りんご', 'バナナ', 'みかん', 'いちご', 'ぶどう', 'もも', 'すいか', 'メロン', 'キウイ', 'パイナップル', 'さくらんぼ', '柿', '梨', 'ブルーベリー', 'ラズベリー', 'アボカド', 'レモン', 'オレンジ', 'グレープフルーツ', 'マンゴー', 'くるみ', 'アーモンド', 'カシューナッツ', 'ピーナッツ', 'マカダミアナッツ',

  // その他
  'コーンフレーク', 'グラノーラ', 'はちみつ', 'ジャム', 'チョコレート', 'ココア', 'ゼラチン', '寒天', 'バニラエッセンス', '抹茶', 'きなこ', 'あんこ', '白玉粉', 'もち粉', '片栗粉', 'ベーキングパウダー', '重曹', 'ドライイースト', 'ピザ用チーズ', 'とろけるチーズ', 'スライスチーズ', 'クリームチーズ', 'カッテージチーズ', 'モッツァレラチーズ', 'パルメザンチーズ', 'リコッタチーズ',
];

function RecipeGenerator() {
  const navigate = useNavigate();
  const [ingredients, setIngredients] = useState([{ name: '', amount: '', unit: '' }]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [servings, setServings] = useState(2);

  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = {
      ...newIngredients[index],
      [field]: value,
    };
    setIngredients(newIngredients);
  };

  const addIngredient = () => {
    setIngredients([...ingredients, { name: '', amount: '', unit: '' }]);
  };

  const removeIngredient = (index) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const names = ingredients.map(ing => ing.name).filter(Boolean);
      const res = await generateRecipeWithAI(names, servings);
      navigate(`/recipes/${res.recipe.id}`);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          材料からレシピを生成
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              手持ちの材料を入力してください
            </Typography>
            {ingredients.map((ingredient, index) => (
              <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Autocomplete
                  freeSolo
                  options={ingredientOptions}
                  inputValue={ingredient.name}
                  onInputChange={(_, newValue) => handleIngredientChange(index, 'name', newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="材料名"
                      required
                    />
                  )}
                  sx={{ minWidth: 150 }}
                />
                <TextField
                  label="量"
                  value={ingredient.amount}
                  onChange={(e) => handleIngredientChange(index, 'amount', e.target.value)}
                  required
                />
                <FormControl required sx={{ minWidth: 100 }}>
                  <InputLabel>単位</InputLabel>
                  <Select
                    value={ingredient.unit}
                    label="単位"
                    onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                  >
                    {unitOptions.map((option) => (
                      <MenuItem key={option} value={option}>{option}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <IconButton
                  color="error"
                  onClick={() => removeIngredient(index)}
                  disabled={ingredients.length === 1}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
            <Button
              startIcon={<AddIcon />}
              onClick={addIngredient}
              variant="outlined"
              sx={{ mt: 2 }}
            >
              材料を追加
            </Button>
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="何人前"
              type="number"
              value={servings}
              onChange={(e) => setServings(Number(e.target.value))}
              required
              sx={{ mb: 1 }}
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
                variant="contained"
                color="primary"
                onClick={handleGenerate}
                disabled={loading || ingredients.some(ing => !ing.name || !ing.amount || !ing.unit)}
              >
                {loading ? <CircularProgress size={24} /> : 'レシピを生成'}
              </Button>
            </Box>
          </Grid>
        </Grid>
        {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
        {loading && (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            minHeight="300px"
          >
            <RestaurantMenuIcon style={{ fontSize: 60, color: '#4CAF50' }} />
            <Typography variant="h6" sx={{ mt: 2 }}>
              AIが自動でレシピを生成中！
            </Typography>
            <CircularProgress sx={{ mt: 2 }} />
          </Box>
        )}
        {result && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5">{result.recipe.title}</Typography>
            <Typography>{result.recipe.description}</Typography>
            <pre>{result.recipe.instructions}</pre>
            <Typography variant="h6" sx={{ mt: 2 }}>バリエーション</Typography>
            <ul>
              {result.variations.map((v, i) => (
                <li key={i}>
                  <strong>{v.title}</strong>: {v.description}
                  <pre>{Array.isArray(v.instructions) ? v.instructions.join('\n') : v.instructions}</pre>
                </li>
              ))}
            </ul>
          </Box>
        )}
      </Paper>
    </Container>
  );
}

export default RecipeGenerator; 