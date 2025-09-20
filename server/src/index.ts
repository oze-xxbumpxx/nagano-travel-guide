import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

// データベース接続のインポート
import sequelize, { testConnection, syncDatabase } from "./config/database";

// モデルのインポート
import TravelPlan from "./models/TravelPlan";
import Accommodation from "./models/Accommodation";
import Attraction from "./models/Attraction";

// モデルの初期化
const models = {
  TravelPlan,
  Accommodation,
  Attraction,
};

// モデルの関係性を初期化
Object.values(models).forEach((model: any) => {
  if (model.associate) {
    model.associate(models);
  }
});

// ルートのインポート（手動で追加してください）
// import travelRoutes from './routes/travelRoutes';
// import attractionRoutes from './routes/attractionRoutes';
// import accommodationRoutes from './routes/accommodationRoutes';

// ミドルウェアのインポート
import { errorHandler } from "./middleware/errorHandler";
import travelRoutes from "./routes/travelRoutes";
import accommodationRoutes from "./routes/accommodationRoutes";

// 環境変数の読み込み
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// レート制限の設定
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分
  max: 100, // リクエスト制限
  message: "Too many requests from this IP, please try again later.",
});

// ミドルウェアの設定
app.use(helmet());
app.use(limiter);
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// PostgreSQL接続
const connectDB = async () => {
  try {
    await testConnection();
    await syncDatabase();
    console.log("✅ PostgreSQL connected and synchronized successfully");
  } catch (error) {
    console.error("❌ PostgreSQL connection error:", error);
    console.log("⚠️  Continuing without database connection for now...");
    console.log(
      "💡 Please check your Supabase project settings and connection string"
    );
    // process.exit(1); // 一時的にコメントアウト
  }
};

// ルートの設定（手動で追加してください）
app.use("/api/travel", travelRoutes);
app.use("/api/accommodations", accommodationRoutes);
// app.use('/api/accommodations', accommodationRoutes);

// ヘルスチェック
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "長野県奈良井旅行のしおり API is running!",
    timestamp: new Date().toISOString(),
  });
});

// エラーハンドリング
app.use(errorHandler);

// 404ハンドラー
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Route not found",
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// サーバー起動
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📱 Health check: http://localhost:${PORT}/api/health`);
  });
};

startServer().catch(console.error);

export default app;
