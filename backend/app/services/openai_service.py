import os
import json
from openai import OpenAI
from typing import List, Dict
from dotenv import load_dotenv
import traceback
import re

load_dotenv()

class OpenAIService:
    def __init__(self):
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEYが設定されていません。.envファイルを確認してください。")
        self.client = OpenAI(api_key=api_key)
        self.model = "gpt-3.5-turbo"

    def generate_recipe(self, ingredients: List[str], servings: int) -> Dict:
        """食材からレシピを生成"""
        prompt = f"""
        以下の食材と調味料のみを使用して、オーブンなど専門的な調理機器を使わない、{servings}人前の美味しいレシピを生成してください。食材は指定された分量以上は使わないようにしてください。しかし、指定された分量以下で作ることはかまいません。：
        {', '.join(ingredients)}

        各食材について「量（amount）」と「単位（unit）」と「カロリー（calories, kcal）」は必ず実際の数値や目安を入れてください。空欄や「-」やnullは禁止です。必ず全ての食材に値を入れてください。

        ※注意：amountは必ず数値（例: 1, 2, 0.5）か、分数の場合は必ず文字列（例: "1/4", "1/2"）で返してください。amountに1/4や1/2のような数式は使わず、必ず"1/4"のような文字列にしてください。

        以下の形式でJSONを返してください：
        {{
            "title": "レシピのタイトル",
            "description": "レシピの簡単な説明（加える食材や調味料の量も明記してください）",
            "instructions": "調理手順（番号付きリスト）",
            "difficulty": "easy/medium/hard",
            "cooking_time": 調理時間（分）,
            "servings": 何人分,
            "ingredients": [
                {{
                    "name": "食材名",
                    "amount": 数値または文字列,
                    "unit": "単位",
                    "calories": 数値(kcal),
                    "protein": null,
                    "fat": null,
                    "carbs": null,
                    "season": null,
                    "category": null,
                    "is_vegetarian": true,
                    "is_vegan": true
                }}
            ]
        }}
        """

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "あなたは料理の専門家です。与えられた食材と調味料のみを使って、美味しくて実用的なレシピを提案してください。必ず指定された形式のJSONを返してください。"},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=3000
            )
            
            # レスポンスからJSONを抽出
            recipe_json = response.choices[0].message.content
            print("AIからの生JSONレスポンス:\n", recipe_json)
            # JSON文字列をPythonオブジェクトに変換
            recipe = json.loads(recipe_json)
            print("パース後のレシピ辞書:\n", recipe)
            
            # 必須フィールドの存在確認
            required_fields = ["title", "description", "instructions", "difficulty", "cooking_time", "servings", "ingredients"]
            for field in required_fields:
                if field not in recipe:
                    raise ValueError(f"必須フィールド '{field}' が欠落しています")
            
            # 型の確認と変換
            recipe["cooking_time"] = int(recipe["cooking_time"])
            recipe["servings"] = int(recipe["servings"])
            
            # 食材の形式を修正
            for ingredient in recipe["ingredients"]:
                if "amount" not in ingredient:
                    ingredient["amount"] = "(未入力)"
                if "calories" not in ingredient:
                    ingredient["calories"] = 0
                if "unit" not in ingredient or ingredient["unit"] is None:
                    ingredient["unit"] = ""
                if "protein" not in ingredient:
                    ingredient["protein"] = None
                if "fat" not in ingredient:
                    ingredient["fat"] = None
                if "carbs" not in ingredient:
                    ingredient["carbs"] = None
                if "season" not in ingredient:
                    ingredient["season"] = None
                if "category" not in ingredient:
                    ingredient["category"] = None
                if "is_vegetarian" not in ingredient:
                    ingredient["is_vegetarian"] = True
                if "is_vegan" not in ingredient:
                    ingredient["is_vegan"] = True
            
            # 不要なフィールドを削除
            if "tips" in recipe:
                del recipe["tips"]
            
            return recipe
            
        except json.JSONDecodeError as e:
            print(f"JSONの解析に失敗しました: {str(e)}")
            traceback.print_exc()
            raise Exception(f"レシピの生成中にエラーが発生しました: JSONの解析に失敗しました")
        except Exception as e:
            print(f"Error generating recipe: {str(e)}")
            traceback.print_exc()
            raise Exception(f"レシピの生成中にエラーが発生しました: {str(e)}")

    def get_recipe_variations(self, recipe: Dict) -> List[Dict]:
        """既存のレシピのバリエーションを生成"""
        prompt = f"""
        以下のレシピのバリエーションを3つ、絶対にJSON配列のみで返してください。説明や前置き、コードブロック、コメント、余計なテキストは一切不要です。
        {recipe['title']}
        {recipe['description']}

        [
          {{
            "title": "バリエーションのタイトル",
            "description": "変更点の説明",
            "instructions": "調理手順（番号付きリスト）",
            "difficulty": "easy/medium/hard",
            "cooking_time": 調理時間（分）,
            "servings": 何人分,
            "ingredients": [
              {{
                "name": "食材名",
                "amount": 数値または文字列,
                "unit": "単位",
                "calories": 数値(kcal),
                "protein": null,
                "fat": null,
                "carbs": null,
                "season": null,
                "category": null,
                "is_vegetarian": true,
                "is_vegan": true
              }}
            ]
          }}
        ]
        """

        def extract_json_array(text):
            match = re.search(r'\[.*\]', text, re.DOTALL)
            if match:
                return match.group(0)
            return text

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "あなたは料理の専門家です。既存のレシピを基に、新しいバリエーションを提案してください。必ず指定された形式のJSONを返してください。"},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.8,
                max_tokens=3000
            )
            
            # レスポンスからJSONを抽出
            variations_json = response.choices[0].message.content
            print("AIからのバリエーション生レスポンス:\n", variations_json)
            variations_json = extract_json_array(variations_json)
            variations = json.loads(variations_json)
            
            # 各バリエーションの型を確認
            for variation in variations:
                variation["cooking_time"] = int(variation["cooking_time"])
                variation["servings"] = int(variation["servings"])
                
                # 食材の形式を修正
                for ingredient in variation["ingredients"]:
                    if "amount" in ingredient:
                        del ingredient["amount"]
                    if "calories" not in ingredient:
                        ingredient["calories"] = None
                    if "protein" not in ingredient:
                        ingredient["protein"] = None
                    if "fat" not in ingredient:
                        ingredient["fat"] = None
                    if "carbs" not in ingredient:
                        ingredient["carbs"] = None
                    if "season" not in ingredient:
                        ingredient["season"] = None
                    if "category" not in ingredient:
                        ingredient["category"] = None
                    if "is_vegetarian" not in ingredient:
                        ingredient["is_vegetarian"] = True
                    if "is_vegan" not in ingredient:
                        ingredient["is_vegan"] = True
                
                # 不要なフィールドを削除
                if "tips" in variation:
                    del variation["tips"]
            
            return variations
            
        except json.JSONDecodeError as e:
            print(f"JSONの解析に失敗しました: {str(e)}")
            traceback.print_exc()
            raise Exception(f"レシピのバリエーション生成中にエラーが発生しました: JSONの解析に失敗しました")
        except Exception as e:
            print(f"Error generating recipe variations: {str(e)}")
            traceback.print_exc()
            raise Exception(f"レシピのバリエーション生成中にエラーが発生しました: {str(e)}") 