# セットアップ手順

## 1. リポジトリをクローン
```
git clone <このリポジトリのURL>
cd <プロジェクトディレクトリ>
```

## 2. Python依存パッケージのインストール
```
cd backend
pip install -r requirements.txt
```

## 3. Node.js依存パッケージのインストール
```
cd ../frontend
npm install
```

## 4. .envファイルの作成
`backend/.env.example` を参考に `backend/.env` を作成し、OpenAIのAPIキーを記入してください。

```
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## 5. サーバーの起動
### バックエンド
```
cd backend
uvicorn app.main:app --reload
```

### フロントエンド
```
cd frontend
npm start
```

---

## 注意事項
- OpenAI APIキーは各自で取得してください。
- APIキーは絶対に公開しないでください。
- `.env`ファイルは `.gitignore` に追加されています。 