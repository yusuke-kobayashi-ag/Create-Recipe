from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api import recipes

app = FastAPI(title="Recipe Creator API")

# CORSの設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 開発環境では全てのオリジンを許可
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ルーターの追加
app.include_router(recipes.router, prefix="/api/v1")

@app.get("/")
async def root():
    return {"message": "Welcome to Recipe Creator API"} 