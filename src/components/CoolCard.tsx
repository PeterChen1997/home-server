"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { cn, isUrlAccessibleInLocalNetwork } from "@/lib/utils";
import { motion } from "framer-motion";
import { ArrowUpRight, ExternalLink, WifiOff, Lock, Globe } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useNetwork } from "@/contexts/NetworkContext";

export interface CoolCardProps {
  title: string;
  description?: string;
  icon?: string | React.ReactNode;
  link: string;
  externalUrl?: string; // 添加外网URL属性
  isExternal?: boolean;
  className?: string;
  tags?: string[];
  color?: string;
  isInternalOnly?: boolean; // 添加内部链接标记
}

export function CoolCard({
  title,
  description,
  icon,
  link,
  externalUrl,
  isExternal = true,
  className,
  tags = [],
  color = "#7c3aed", // 默认紫色
  isInternalOnly = false, // 默认非内部链接
}: CoolCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isAccessible, setIsAccessible] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { useInternalNetwork } = useNetwork();
  const [effectiveUrl, setEffectiveUrl] = useState<string>(link);

  // 根据网络环境和URL设置选择有效URL
  useEffect(() => {
    // 如果只有外部URL，使用外部URL
    if (!link && externalUrl) {
      setEffectiveUrl(externalUrl);
    }
    // 如果有外部URL且选择了外网模式
    else if (externalUrl && !useInternalNetwork) {
      setEffectiveUrl(externalUrl);
    }
    // 如果选择了内网模式或只有内部URL
    else if (link) {
      setEffectiveUrl(link);
    }
    // 如果两者都没有，使用空字符串
    else {
      setEffectiveUrl("");
    }
  }, [link, externalUrl, useInternalNetwork]);

  // 检查内网链接可访问性
  useEffect(() => {
    // 如果链接是内部链接，检查可访问性
    if (isInternalOnly) {
      setIsLoading(true);
      isUrlAccessibleInLocalNetwork(effectiveUrl)
        .then((result) => {
          setIsAccessible(result);
        })
        .catch(() => {
          setIsAccessible(false);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      // 非内网链接总是可访问
      setIsAccessible(true);
    }
  }, [effectiveUrl, isInternalOnly]);

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

  // 同时有内外网URL
  const hasBothUrls = link && externalUrl;

  // 当外网模式下使用内网链接时
  const isInternalOnlyWithExternalMode =
    isInternalOnly && !useInternalNetwork && !externalUrl;

  // 计算链接状态
  const shouldShowWarning =
    (isInternalOnly && (isAccessible === false || isAccessible === null)) ||
    isInternalOnlyWithExternalMode;

  return (
    <motion.div
      className={cn(
        "group relative overflow-hidden rounded-xl bg-white dark:bg-gray-900 shadow-lg transition-all duration-300 hover:shadow-xl dark:hover:shadow-primary/10",
        isHovered ? "scale-[1.03]" : "scale-100",
        shouldShowWarning
          ? "hover:border-yellow-500/50"
          : "hover:border-primary/50",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* 内网链接警告提示 */}
      {shouldShowWarning && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-background/20 backdrop-blur-[1px] rounded-xl overflow-hidden pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="flex flex-col items-center bg-background/90 px-4 py-3 rounded-md shadow-sm border border-yellow-500/30">
            <WifiOff className="h-5 w-5 text-yellow-500 mb-2" />
            <div className="text-center">
              <p className="text-xs font-medium text-foreground mb-1">
                {isInternalOnlyWithExternalMode
                  ? "仅内网可用"
                  : "内网链接检测不可访问"}
              </p>
              <p className="text-xs text-muted-foreground">点击仍可尝试访问</p>
            </div>
          </div>
        </div>
      )}

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

            {/* 标题和链接状态指示器 */}
            <div className="flex flex-col">
              <div className="flex items-center">
                <h3 className="text-xl font-semibold tracking-tight">
                  {title}
                </h3>

                {/* 显示内网链接状态图标 */}
                {isInternalOnly && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="text-xs ml-2">
                          {isLoading ? (
                            <span className="animate-pulse">⋯</span>
                          ) : isAccessible ? (
                            <span className="text-green-500">
                              <Lock className="h-4 w-4" />
                            </span>
                          ) : (
                            <span className="text-yellow-500 animate-pulse">
                              <WifiOff className="h-4 w-4" />
                            </span>
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        {isLoading
                          ? "正在检测链接可访问性..."
                          : isAccessible
                          ? "内网链接可访问"
                          : "内网链接检测不可访问，可尝试点击"}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}

                {/* 显示当前网络模式 */}
                {hasBothUrls && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="text-xs ml-2">
                          <span
                            className={
                              useInternalNetwork
                                ? "text-green-500"
                                : "text-blue-500"
                            }
                          >
                            {useInternalNetwork ? (
                              <Lock className="h-4 w-4" />
                            ) : (
                              <Globe className="h-4 w-4" />
                            )}
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        {useInternalNetwork
                          ? "使用内网链接访问"
                          : "使用外网链接访问"}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>

              {/* 描述 */}
              {description && (
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {description}
                </p>
              )}
            </div>
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
        href={effectiveUrl}
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
