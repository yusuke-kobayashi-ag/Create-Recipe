from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict
from pydantic import BaseModel
from ..crud.recipe import get_recipe, get_recipes, create_recipe, update_recipe, delete_recipe
from ..schemas.recipe import Recipe, RecipeCreate, Recipe as RecipeSchema
from ..database import get_db
from ..services.openai_service import OpenAIService

router = APIRouter()
openai_service = OpenAIService()

class RecipeGenerationRequest(BaseModel):
    ingredients: List[str]
    servings: int

@router.post("/recipes/", response_model=Recipe)
def create_recipe_endpoint(recipe: RecipeCreate, db: Session = Depends(get_db)):
    """
    レシピを作成するエンドポイント
    
    リクエスト例:
    {
        "title": "カレーライス",
        "description": "簡単なカレーライスのレシピ",
        "instructions": "1. 材料を切る\n2. 炒める\n3. 煮込む",
        "difficulty": "easy",
        "cooking_time": 30,
        "servings": 4,
        "image_url": "https://example.com/curry.jpg",
        "season": "all",
        "cuisine_type": "japanese",
        "ingredients": [
            {
                "name": "にんじん",
                "unit": "本",
                "calories": 30.0,
                "protein": 0.6,
                "fat": 0.1,
                "carbs": 7.0,
                "season": "winter",
                "category": "vegetable",
                "is_vegetarian": true,
                "is_vegan": true
            }
        ]
    }
    """
    return create_recipe(db=db, recipe=recipe)

@router.get("/recipes/", response_model=List[Recipe])
def read_recipes(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    recipes = get_recipes(db, skip=skip, limit=limit)
    return recipes

@router.get("/recipes/{recipe_id}", response_model=Recipe)
def read_recipe(recipe_id: int, db: Session = Depends(get_db)):
    db_recipe = get_recipe(db, recipe_id=recipe_id)
    if db_recipe is None:
        raise HTTPException(status_code=404, detail="Recipe not found")
    return db_recipe

@router.put("/recipes/{recipe_id}", response_model=Recipe)
def update_recipe_endpoint(recipe_id: int, recipe: RecipeCreate, db: Session = Depends(get_db)):
    db_recipe = update_recipe(db, recipe_id=recipe_id, recipe=recipe)
    if db_recipe is None:
        raise HTTPException(status_code=404, detail="Recipe not found")
    return db_recipe

@router.delete("/recipes/{recipe_id}", response_model=RecipeSchema)
def delete_recipe_endpoint(recipe_id: int, db: Session = Depends(get_db)):
    db_recipe = delete_recipe(db, recipe_id=recipe_id)
    if db_recipe is None:
        raise HTTPException(status_code=404, detail="Recipe not found")
    return RecipeSchema.from_orm(db_recipe)

@router.post("/recipes/generate/ai", response_model=Dict)
def generate_recipe_with_ai(request: RecipeGenerationRequest, db: Session = Depends(get_db)):
    """AIを使用してレシピを生成"""
    try:
        # OpenAIを使用してレシピを生成
        recipe = openai_service.generate_recipe(request.ingredients, request.servings)
    
        if not recipe:
            raise HTTPException(status_code=500, detail="レシピの生成に失敗しました")
        
        # 生成されたレシピをデータベースに保存
        recipe_create = RecipeCreate(
            title=recipe["title"],
            description=recipe["description"],
            instructions=recipe["instructions"],
            difficulty=recipe["difficulty"],
            cooking_time=recipe["cooking_time"],
            servings=recipe["servings"],
            ingredients=[
                {
                    "name": ing["name"],
                    "unit": ing["unit"],
                    "amount": ing["amount"],
                    "calories": ing["calories"],  # カロリー情報は後で更新可能
                    "protein": ing["protein"],
                    "fat": ing["fat"],
                    "carbs": ing["carbs"],
                    "season": ing["season"],
                    "category": ing["category"],
                    "is_vegetarian": ing["is_vegetarian"],  # デフォルト値
                    "is_vegan": True  # デフォルト値
                }
                for ing in recipe["ingredients"]
            ]
        )
        
        created_recipe = create_recipe(db=db, recipe=recipe_create)
        
        # 生成されたレシピとバリエーションを返す
        variations = openai_service.get_recipe_variations(recipe)
        
        # レスポンスからtipsフィールドを削除
        response = {
            "recipe": created_recipe,
            "variations": variations
        }
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 