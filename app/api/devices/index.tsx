import type { NextApiRequest, NextApiResponse } from "next";
import { wake } from "wake_on_lan";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case "GET":
      // 获取设备列表
      break;

    case "POST":
      // 添加新设备
      break;

    case "PUT":
      // 更新设备
      break;

    case "DELETE":
      // 删除设备
      break;

    default:
      res.status(405).json({ message: "Method not allowed" });
  }
}

// WOL 唤醒设备的 API
export async function wakeDevice(macAddress: string) {
  return new Promise((resolve, reject) => {
    wake(macAddress, (error) => {
      if (error) reject(error);
      resolve(true);
    });
  });
}
