"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ArrowUpRight, ExternalLink } from "lucide-react";

export interface CoolCardProps {
  title: string;
  description?: string;
  icon?: string | React.ReactNode;
  link: string;
  isExternal?: boolean;
  className?: string;
  tags?: string[];
  color?: string;
}

export function CoolCard({
  title,
  description,
  icon,
  link,
  isExternal = true,
  className,
  tags = [],
  color = "#7c3aed", // 默认紫色
}: CoolCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  // 将颜色转换为RGB格式以便创建渐变
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 124, g: 58, b: 237 }; // 默认紫色
  };

  const rgb = hexToRgb(color);

  return (
    <motion.div
      className={cn(
        "group relative overflow-hidden rounded-xl bg-white dark:bg-gray-900 shadow-lg transition-all duration-300 hover:shadow-xl dark:hover:shadow-primary/10",
        isHovered ? "scale-[1.03]" : "scale-100",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* 背景渐变效果 */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle at top right, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.8), transparent 70%)`,
        }}
      />

      {/* 卡片内容 */}
      <div className="relative z-10 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {/* 图标 */}
            {icon && typeof icon === "string" ? (
              <div
                className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 shadow-sm"
                style={{ borderBottom: `2px solid ${color}` }}
              >
                <Image
                  src={icon}
                  alt={title}
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
            ) : icon ? (
              <div
                className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 shadow-sm"
                style={{ borderBottom: `2px solid ${color}` }}
              >
                {icon}
              </div>
            ) : null}

            {/* 标题 */}
            <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
          </div>

          {/* 外部链接图标 */}
          <motion.div
            animate={{
              rotate: isHovered ? 0 : -45,
              scale: isHovered ? 1.1 : 1,
            }}
            transition={{ duration: 0.2 }}
            className="text-gray-400 dark:text-gray-500 group-hover:text-primary"
          >
            {isExternal ? (
              <ExternalLink className="h-5 w-5" />
            ) : (
              <ArrowUpRight className="h-5 w-5" />
            )}
          </motion.div>
        </div>

        {/* 描述 */}
        {description && (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {description}
          </p>
        )}

        {/* 标签 */}
        {tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:text-gray-200"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 链接覆盖整个卡片 */}
      <Link
        href={link}
        target={isExternal ? "_blank" : "_self"}
        rel={isExternal ? "noopener noreferrer" : ""}
        className="absolute inset-0 z-20"
        aria-label={`访问 ${title}`}
      >
        <span className="sr-only">访问 {title}</span>
      </Link>

      {/* 悬停时的底部边框效果 */}
      <div
        className="absolute bottom-0 left-0 h-1 w-0 group-hover:w-full transition-all duration-300"
        style={{ backgroundColor: color }}
      />
    </motion.div>
  );
}
