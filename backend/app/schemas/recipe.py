from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class IngredientBase(BaseModel):
    name: str
    amount: str
    unit: str
    calories: Optional[float] = None
    protein: Optional[float] = None
    fat: Optional[float] = None
    carbs: Optional[float] = None
    season: Optional[str] = None
    category: Optional[str] = None
    is_vegetarian: Optional[bool] = False
    is_vegan: Optional[bool] = False

class IngredientCreate(IngredientBase):
    pass

class Ingredient(IngredientBase):
    id: int

    class Config:
        orm_mode = True
        from_attributes = True

class RecipeBase(BaseModel):
    title: str
    description: Optional[str] = None
    instructions: str
    difficulty: str
    cooking_time: int
    servings: int
    image_url: Optional[str] = None
    season: Optional[str] = None
    cuisine_type: Optional[str] = None

class RecipeCreate(RecipeBase):
    ingredients: List[IngredientCreate]

class Recipe(RecipeBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    ingredients: List[Ingredient]

    class Config:
        orm_mode = True
        from_attributes = True 