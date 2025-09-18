import { syncDatabase } from "./config/database";
import "./models/TravelPlan";
import "./models/Attraction";
import "./models/Accommodation";

// データベース同期
const runSync = async () => {
  try {
    console.log("🔄 データベーステーブルを作成中...");
    await syncDatabase();
    console.log("✅ データベーステーブルの作成が完了しました！");
    console.log("📋 作成されたテーブル:");
    console.log("  - travel_plans (旅行プラン)");
    console.log("  - attractions (観光地)");
    console.log("  - accommodations (宿泊施設)");
    process.exit(0);
  } catch (error) {
    console.error("❌ データベース同期に失敗しました:", error);
    process.exit(1);
  }
};

runSync();
