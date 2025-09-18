import dotenv from "dotenv";

// 環境変数を読み込み
dotenv.config({ path: "./env.local" });

console.log("🔍 環境変数の確認:");
console.log("DATABASE_URL:", process.env.DATABASE_URL ? "設定済み" : "未設定");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("PORT:", process.env.PORT);

// 接続文字列の形式をチェック
if (process.env.DATABASE_URL) {
  const url = process.env.DATABASE_URL;
  console.log("\n📋 接続文字列の形式チェック:");
  console.log("URL長:", url.length);
  console.log("postgres://で始まる:", url.startsWith("postgres://"));
  console.log("@が含まれる:", url.includes("@"));
  console.log(":が含まれる:", url.includes(":"));

  // 安全のため、パスワード部分を隠す
  const maskedUrl = url.replace(/:\w+@/, ":***@");
  console.log("マスクされたURL:", maskedUrl);
}
