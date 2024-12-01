import { config } from "dotenv";
import { sql } from "@vercel/postgres";
import { hash } from "bcryptjs";
import fs from "fs";
import path from "path";

// 加载环境变量
config();

async function seedDatabase() {
  try {
    // 读取 schema.sql 文件
    const schemaPath = path.join(process.cwd(), "app/db/schema.sql");
    const createTable = fs.readFileSync(schemaPath, "utf8");

    // 执行建表语句
    await sql.query(createTable);
    console.log("✅ 数据库表创建成功");

    // 可以在这里添加一些初始数据
    const hashedPassword = await hash("testtesttesttest", 10);
    await sql`
      INSERT INTO users (email, name, password)
      VALUES ('admin@example.com', 'Admin User', ${hashedPassword})
      ON CONFLICT (email) DO NOTHING;
    `;
    console.log("✅ 初始用户数据添加成功");
  } catch (error) {
    console.error("数据库初始化失败:", error);
    throw error;
  }
}

// 如果直接运行此文件则执行初始化
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log("✅ 数据库初始化完成");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ 数据库初始化失败:", error);
      process.exit(1);
    });
}
