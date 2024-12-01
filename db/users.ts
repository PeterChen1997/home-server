import { sql } from "@vercel/postgres";
import type { User } from "@/lib/definitions";

export async function getUserByEmail(email: string): Promise<User | undefined> {
  try {
    // 直接使用 sql 标签模板来执行查询，它会自动处理连接
    const { rows } = await sql<User>`
      SELECT * FROM users 
      WHERE email = ${email}
    `;
    return rows[0];
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "invalid_connection_string"
    ) {
      console.error("数据库连接字符串无效，请检查环境变量配置");
      throw new Error("数据库配置错误");
    }

    console.error("获取用户失败:", error);
    throw new Error("获取用户失败");
  }
}
