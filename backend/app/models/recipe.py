from sqlalchemy import Column, Integer, String, Float, ForeignKey, Table, Boolean, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base

# レシピと食材の中間テーブル
recipe_ingredient = Table(
    'recipe_ingredient',
    Base.metadata,
    Column('recipe_id', Integer, ForeignKey('recipes.id')),
    Column('ingredient_id', Integer, ForeignKey('ingredients.id'))
)

# 食材の相性テーブル
ingredient_compatibility = Table(
    'ingredient_compatibility',
    Base.metadata,
    Column('ingredient1_id', Integer, ForeignKey('ingredients.id')),
    Column('ingredient2_id', Integer, ForeignKey('ingredients.id')),
    Column('compatibility_score', Float),
    Column('notes', String)
)

class Recipe(Base):
    __tablename__ = "recipes"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String)
    instructions = Column(String)
    difficulty = Column(String)  # easy, medium, hard
    cooking_time = Column(Integer)  # 分単位
    servings = Column(Integer)
    image_url = Column(String, nullable=True)
    season = Column(String)  # spring, summer, autumn, winter
    cuisine_type = Column(String)  # japanese, chinese, italian, etc.
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # リレーションシップ
    ingredients = relationship("Ingredient", secondary=recipe_ingredient, back_populates="recipes")
    cooking_methods = relationship("CookingMethod", secondary="recipe_cooking_method")
    seasonings = relationship("Seasoning", secondary="recipe_seasoning")

class Ingredient(Base):
    __tablename__ = "ingredients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    amount = Column(String, nullable=True)
    unit = Column(String)  # g, ml, 個など
    calories = Column(Float, nullable=True)
    protein = Column(Float, nullable=True)
    fat = Column(Float, nullable=True)
    carbs = Column(Float, nullable=True)
    season = Column(String)  # spring, summer, autumn, winter
    category = Column(String)  # vegetable, meat, fish, etc.
    is_vegetarian = Column(Boolean, default=False)
    is_vegan = Column(Boolean, default=False)
    
    # リレーションシップ
    recipes = relationship("Recipe", secondary=recipe_ingredient, back_populates="ingredients")
    compatible_with = relationship(
        "Ingredient",
        secondary=ingredient_compatibility,
        primaryjoin=id==ingredient_compatibility.c.ingredient1_id,
        secondaryjoin=id==ingredient_compatibility.c.ingredient2_id,
        backref="compatible_ingredients"
    )

class CookingMethod(Base):
    __tablename__ = "cooking_methods"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String)
    difficulty = Column(String)
    time_required = Column(Integer)  # 分単位
    temperature = Column(Integer, nullable=True)  # 摂氏
    equipment = Column(String)

class Seasoning(Base):
    __tablename__ = "seasonings"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    category = Column(String)  # salt, sugar, spice, etc.
    description = Column(String)
    usage_notes = Column(String)

# レシピと調理方法の中間テーブル
recipe_cooking_method = Table(
    'recipe_cooking_method',
    Base.metadata,
    Column('recipe_id', Integer, ForeignKey('recipes.id')),
    Column('cooking_method_id', Integer, ForeignKey('cooking_methods.id')),
    Column('order', Integer),
    Column('duration', Integer)  # 分単位
)

# レシピと調味料の中間テーブル
recipe_seasoning = Table(
    'recipe_seasoning',
    Base.metadata,
    Column('recipe_id', Integer, ForeignKey('recipes.id')),
    Column('seasoning_id', Integer, ForeignKey('seasonings.id')),
    Column('amount', String),
    Column('unit', String)
) 