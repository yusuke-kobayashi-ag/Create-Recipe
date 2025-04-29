from sqlalchemy.orm import Session
from ..models.recipe import Recipe, Ingredient, CookingMethod, Seasoning
from typing import List, Dict
import random
from datetime import datetime

class RecipeGenerator:
    def __init__(self, db: Session):
        self.db = db

    def get_season(self) -> str:
        """現在の季節を取得"""
        month = datetime.now().month
        if 3 <= month <= 5:
            return "spring"
        elif 6 <= month <= 8:
            return "summer"
        elif 9 <= month <= 11:
            return "autumn"
        else:
            return "winter"

    def get_compatible_ingredients(self, ingredients: List[Ingredient]) -> List[Ingredient]:
        """与えられた食材と相性の良い食材を取得"""
        compatible_ingredients = []
        for ingredient in ingredients:
            compatible = ingredient.compatible_with
            compatible_ingredients.extend(compatible)
        return list(set(compatible_ingredients))

    def get_seasonal_ingredients(self) -> List[Ingredient]:
        """旬の食材を取得"""
        current_season = self.get_season()
        return self.db.query(Ingredient).filter(Ingredient.season == current_season).all()

    def suggest_cooking_methods(self, ingredients: List[Ingredient]) -> List[CookingMethod]:
        """食材に適した調理方法を提案"""
        # 食材のカテゴリーに基づいて調理方法を選択
        categories = set(ing.category for ing in ingredients)
        methods = []
        
        if "meat" in categories:
            methods.extend(self.db.query(CookingMethod).filter(
                CookingMethod.name.in_(["grilling", "roasting", "stewing"])
            ).all())
        
        if "fish" in categories:
            methods.extend(self.db.query(CookingMethod).filter(
                CookingMethod.name.in_(["steaming", "poaching", "grilling"])
            ).all())
        
        if "vegetable" in categories:
            methods.extend(self.db.query(CookingMethod).filter(
                CookingMethod.name.in_(["stir-frying", "steaming", "roasting"])
            ).all())
        
        return list(set(methods))

    def suggest_seasonings(self, ingredients: List[Ingredient], cuisine_type: str) -> List[Seasoning]:
        """料理の種類に応じた調味料を提案"""
        seasonings = self.db.query(Seasoning).all()
        
        # 料理の種類に基づいて調味料をフィルタリング
        if cuisine_type == "japanese":
            return [s for s in seasonings if s.category in ["soy_sauce", "miso", "sake", "mirin"]]
        elif cuisine_type == "chinese":
            return [s for s in seasonings if s.category in ["oyster_sauce", "hoisin_sauce", "sesame_oil"]]
        elif cuisine_type == "italian":
            return [s for s in seasonings if s.category in ["olive_oil", "basil", "oregano", "parmesan"]]
        
        return seasonings

    def generate_recipe(self, input_ingredients: List[Dict]) -> Recipe:
        """レシピを生成"""
        # 入力された食材を取得
        ingredients = []
        for ing in input_ingredients:
            ingredient = self.db.query(Ingredient).filter(
                Ingredient.name == ing["name"]
            ).first()
            if ingredient:
                ingredients.append(ingredient)

        # 相性の良い食材を追加
        compatible_ingredients = self.get_compatible_ingredients(ingredients)
        additional_ingredients = random.sample(
            compatible_ingredients,
            min(3, len(compatible_ingredients))
        )
        ingredients.extend(additional_ingredients)

        # 旬の食材を追加
        seasonal_ingredients = self.get_seasonal_ingredients()
        if seasonal_ingredients:
            seasonal_ingredient = random.choice(seasonal_ingredients)
            if seasonal_ingredient not in ingredients:
                ingredients.append(seasonal_ingredient)

        # 調理方法を提案
        cooking_methods = self.suggest_cooking_methods(ingredients)
        if not cooking_methods:
            cooking_methods = self.db.query(CookingMethod).all()

        # 料理の種類を決定
        cuisine_types = ["japanese", "chinese", "italian", "french"]
        cuisine_type = random.choice(cuisine_types)

        # 調味料を提案
        seasonings = self.suggest_seasonings(ingredients, cuisine_type)

        # レシピを作成
        recipe = Recipe(
            title=f"{ingredients[0].name}を使った{cuisine_type}風レシピ",
            description=f"{', '.join(ing.name for ing in ingredients)}を使った美味しいレシピです。",
            instructions=self._generate_instructions(ingredients, cooking_methods, seasonings),
            difficulty="medium",
            cooking_time=sum(method.time_required for method in cooking_methods),
            servings=2,
            season=self.get_season(),
            cuisine_type=cuisine_type
        )

        # リレーションシップを設定
        recipe.ingredients = ingredients
        recipe.cooking_methods = cooking_methods
        recipe.seasonings = seasonings

        return recipe

    def _generate_instructions(self, ingredients: List[Ingredient], 
                             cooking_methods: List[CookingMethod],
                             seasonings: List[Seasoning]) -> str:
        """調理手順を生成"""
        instructions = []
        
        # 材料の準備
        instructions.append("材料の準備:")
        for i, ing in enumerate(ingredients, 1):
            instructions.append(f"{i}. {ing.name}を適量用意します。")

        # 調理手順
        instructions.append("\n調理手順:")
        for i, method in enumerate(cooking_methods, 1):
            instructions.append(f"{i}. {method.name}: {method.description}")

        # 味付け
        instructions.append("\n味付け:")
        for i, seasoning in enumerate(seasonings, 1):
            instructions.append(f"{i}. {seasoning.name}を{seasoning.usage_notes}")

        return "\n".join(instructions) 