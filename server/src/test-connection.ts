import { testConnection } from "./config/database";

// データベース接続テスト
const runTest = async () => {
  try {
    console.log("🔄 データベース接続をテスト中...");
    await testConnection();
    console.log("✅ データベース接続が成功しました！");
    process.exit(0);
  } catch (error) {
    console.error("❌ データベース接続に失敗しました:", error);
    process.exit(1);
  }
};

runTest();
