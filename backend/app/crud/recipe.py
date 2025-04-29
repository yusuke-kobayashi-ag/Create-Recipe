from sqlalchemy.orm import Session
from ..models.recipe import Recipe, Ingredient
from ..schemas.recipe import RecipeCreate, IngredientCreate
from datetime import datetime

def get_recipe(db: Session, recipe_id: int):
    db_recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if db_recipe:
        # レスポンス用の辞書を作成
        response_dict = {
            "id": db_recipe.id,
            "title": db_recipe.title,
            "description": db_recipe.description,
            "instructions": db_recipe.instructions,
            "difficulty": db_recipe.difficulty,
            "cooking_time": db_recipe.cooking_time,
            "servings": db_recipe.servings,
            "image_url": db_recipe.image_url,
            "season": db_recipe.season,
            "cuisine_type": db_recipe.cuisine_type,
            "created_at": db_recipe.created_at,
            "updated_at": db_recipe.updated_at,
            "ingredients": [
                {
                    "id": ing.id,
                    "name": ing.name,
                    "unit": ing.unit,
                    "calories": ing.calories,
                    "amount": ing.amount,
                    "protein": ing.protein,
                    "fat": ing.fat,
                    "carbs": ing.carbs,
                    "season": ing.season,
                    "category": ing.category,
                    "is_vegetarian": ing.is_vegetarian,
                    "is_vegan": ing.is_vegan
                }
                for ing in db_recipe.ingredients
            ]
        }
        return response_dict
    return None

def get_recipes(db: Session, skip: int = 0, limit: int = 100):
    db_recipes = db.query(Recipe).offset(skip).limit(limit).all()
    return [
        {
            "id": recipe.id,
            "title": recipe.title,
            "description": recipe.description,
            "instructions": recipe.instructions,
            "difficulty": recipe.difficulty,
            "cooking_time": recipe.cooking_time,
            "servings": recipe.servings,
            "image_url": recipe.image_url,
            "season": recipe.season,
            "cuisine_type": recipe.cuisine_type,
            "created_at": recipe.created_at,
            "updated_at": recipe.updated_at,
            "ingredients": [
                {
                    "id": ing.id,
                    "name": ing.name,
                    "unit": ing.unit,
                    "amount": ing.amount,
                    "calories": ing.calories,
                    "protein": ing.protein,
                    "fat": ing.fat,
                    "carbs": ing.carbs,
                    "season": ing.season,
                    "category": ing.category,
                    "is_vegetarian": ing.is_vegetarian,
                    "is_vegan": ing.is_vegan
                }
                for ing in recipe.ingredients
            ]
        }
        for recipe in db_recipes
    ]

def create_recipe(db: Session, recipe: RecipeCreate):
    # 食材を作成
    db_ingredients = []
    for ingredient in recipe.ingredients:
        db_ingredient = Ingredient(**ingredient.dict())
        db.add(db_ingredient)
        db_ingredients.append(db_ingredient)
    
    db_recipe = Recipe(
        title=recipe.title,
        description=recipe.description,
        instructions=recipe.instructions,
        difficulty=recipe.difficulty,
        cooking_time=recipe.cooking_time,
        servings=recipe.servings,
        image_url=recipe.image_url,
        season=recipe.season,
        cuisine_type=recipe.cuisine_type,
        ingredients=db_ingredients,
        created_at=datetime.now()
    )
    db.add(db_recipe)
    db.commit()
    db.refresh(db_recipe)
    return get_recipe(db, db_recipe.id)

def update_recipe(db: Session, recipe_id: int, recipe: RecipeCreate):
    db_recipe = get_recipe(db, recipe_id)
    if db_recipe:
        # 既存の食材を削除
        db_recipe.ingredients = []
        
        # 新しい食材を作成
        db_ingredients = []
        for ingredient in recipe.ingredients:
            db_ingredient = Ingredient(**ingredient.dict())
            db.add(db_ingredient)
            db_ingredients.append(db_ingredient)
        
        # レシピを更新
        for key, value in recipe.dict(exclude={'ingredients'}).items():
            setattr(db_recipe, key, value)
        
        db_recipe.ingredients = db_ingredients
        db.commit()
        db.refresh(db_recipe)
    return db_recipe

def get_recipe_instance(db: Session, recipe_id: int):
    return db.query(Recipe).filter(Recipe.id == recipe_id).first()

def delete_recipe(db: Session, recipe_id: int):
    db_recipe = get_recipe_instance(db, recipe_id)
    if db_recipe:
        db.delete(db_recipe)
        db.commit()
    return db_recipe 