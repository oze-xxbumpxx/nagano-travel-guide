import { Sequelize } from "sequelize";
import dotenv from "dotenv";

// 環境変数を読み込み
dotenv.config();

// データベース接続の設定
const sequelize = new Sequelize(process.env.DATABASE_URL || "", {
  dialect: "postgres",
  logging: process.env.NODE_ENV === "development" ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true,
  },
});

// データベース接続テスト
export const testConnection = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log("✅ PostgreSQL connection has been established successfully.");
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error);
    throw error;
  }
};

// データベース同期（開発環境用）
export const syncDatabase = async (): Promise<void> => {
  try {
    await sequelize.sync({ alter: true });
    console.log("✅ Database synchronized successfully.");
  } catch (error) {
    console.error("❌ Database synchronization failed:", error);
    throw error;
  }
};

export default sequelize;
