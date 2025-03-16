import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Start seeding database...");

  // 创建管理员用户
  const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "password";
  const hashedPassword = await hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: "管理员",
      password: hashedPassword,
      role: "admin",
    },
  });

  console.log(`Created admin user: ${admin.email}`);

  // 创建一些初始分类
  const categories = [
    { name: "个人网站", description: "我的个人网站集合", color: "#3b82f6" },
    { name: "家庭网络", description: "家庭局域网站点", color: "#8b5cf6" },
    { name: "工具", description: "常用工具站点", color: "#22c55e" },
    { name: "资源", description: "资源网站", color: "#f59e0b" },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {
        description: category.description,
        color: category.color,
      },
      create: category,
    });
  }

  console.log(`Created ${categories.length} categories`);

  // 创建一些初始标签
  const tags = [
    { name: "工作", color: "#0ea5e9" },
    { name: "学习", color: "#22c55e" },
    { name: "娱乐", color: "#f59e0b" },
    { name: "内网", color: "#8b5cf6" },
    { name: "公网", color: "#ec4899" },
    { name: "开发", color: "#3b82f6" },
    { name: "设计", color: "#f43f5e" },
    { name: "文档", color: "#14b8a6" },
    { name: "视频", color: "#ef4444" },
    { name: "音乐", color: "#8b5cf6" },
    { name: "工具", color: "#64748b" },
    { name: "社交", color: "#06b6d4" },
    { name: "购物", color: "#fb7185" },
    { name: "金融", color: "#84cc16" },
    { name: "资讯", color: "#f97316" },
    { name: "云服务", color: "#6366f1" },
    { name: "游戏", color: "#9333ea" },
    { name: "生活", color: "#16a34a" },
    { name: "办公", color: "#0284c7" },
    { name: "博客", color: "#d946ef" },
    { name: "摄影", color: "#db2777" },
    { name: "AI", color: "#475569" },
  ];

  for (const tag of tags) {
    await prisma.tag.upsert({
      where: { name: tag.name },
      update: { color: tag.color },
      create: tag,
    });
  }

  console.log(`Created ${tags.length} tags`);

  // 创建一些示例链接
  const workCategory = await prisma.category.findUnique({
    where: { name: "工具" },
  });
  const homeCategory = await prisma.category.findUnique({
    where: { name: "家庭网络" },
  });

  const internalTag = await prisma.tag.findUnique({ where: { name: "内网" } });
  const publicTag = await prisma.tag.findUnique({ where: { name: "公网" } });
  const workTag = await prisma.tag.findUnique({ where: { name: "工作" } });

  if (workCategory && homeCategory && internalTag && publicTag && workTag) {
    // 示例公网链接
    const publicLink = await prisma.link.upsert({
      where: { id: "1" },
      update: {},
      create: {
        title: "GitHub",
        url: "https://github.com",
        description: "代码托管平台",
        isInternalOnly: false,
        categoryId: workCategory.id,
      },
    });

    // 添加标签到链接
    await prisma.link.update({
      where: { id: publicLink.id },
      data: {
        tags: {
          connect: [{ id: publicTag.id }, { id: workTag.id }],
        },
      },
    });

    // 示例内网链接
    const internalLink = await prisma.link.upsert({
      where: { id: "2" },
      update: {},
      create: {
        title: "家庭NAS",
        url: "http://nas.local",
        description: "家庭存储服务器",
        isInternalOnly: true,
        categoryId: homeCategory.id,
      },
    });

    // 添加标签到链接
    await prisma.link.update({
      where: { id: internalLink.id },
      data: {
        tags: {
          connect: [{ id: internalTag.id }],
        },
      },
    });

    console.log("Created sample links");
  }

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
