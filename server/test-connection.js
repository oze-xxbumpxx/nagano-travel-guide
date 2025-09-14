const { Sequelize } = require("sequelize");
require("dotenv").config();

const testConnection = async () => {
  console.log("🔍 Testing database connection...");
  console.log("DATABASE_URL:", process.env.DATABASE_URL ? "Set" : "Not set");

  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL is not set in .env file");
    return;
  }

  // URLを隠して表示（セキュリティのため）
  const url = process.env.DATABASE_URL;
  const maskedUrl = url.replace(/:\/\/[^:]+:[^@]+@/, "://***:***@");
  console.log("Connection URL:", maskedUrl);

  const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "postgres",
    logging: console.log,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  });

  try {
    await sequelize.authenticate();
    console.log("✅ Database connection successful!");
  } catch (error) {
    console.error("❌ Database connection failed:");
    console.error("Error code:", error.original?.code);
    console.error("Error message:", error.message);

    if (error.original?.code === "ECONNREFUSED") {
      console.log("\n💡 Possible solutions:");
      console.log("1. Check if the DATABASE_URL is correct");
      console.log("2. Verify the host, port, username, and password");
      console.log("3. Check if the database server is running");
      console.log("4. Verify network connectivity");
    }
  } finally {
    await sequelize.close();
  }
};

testConnection();
