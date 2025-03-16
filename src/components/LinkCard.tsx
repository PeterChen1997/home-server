"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ExternalLink,
  Lock,
  WifiOff,
  Copy,
  CheckCheck,
  Share2,
  ArrowUpRightFromSquare,
  Globe,
  FileText,
  Briefcase,
  Server,
} from "lucide-react";
import {
  cn,
  isInternalUrl,
  isInLocalNetwork,
  isUrlAccessibleInLocalNetwork,
} from "@/lib/utils";
import type { LinkWithRelations } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

interface LinkCardProps {
  link: LinkWithRelations;
  showCategory?: boolean;
  iconBase64?: string;
}

export function LinkCard({
  link,
  showCategory = true,
  iconBase64,
}: LinkCardProps) {
  const [isAccessible, setIsAccessible] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [effectiveUrl, setEffectiveUrl] = useState<string>(link.url);
  const [isInLocalNet, setIsInLocalNet] = useState(false);
  const [iconError, setIconError] = useState(false);

  // 复制链接到剪贴板
  const copyToClipboard = () => {
    navigator.clipboard.writeText(effectiveUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 分享链接
  const shareLink = () => {
    if (navigator.share) {
      navigator
        .share({
          title: link.title,
          text: link.description || "",
          url: effectiveUrl,
        })
        .catch(console.error);
    } else {
      copyToClipboard();
    }
  };

  // 检查当前是否在本地网络中
  useEffect(() => {
    const checkLocalNetwork = async () => {
      // 使用当前浏览器位置URL作为参考
      const result = await isInLocalNetwork(window.location.href);
      setIsInLocalNet(result);
    };
    checkLocalNetwork();
  }, []);

  // 根据当前网络环境选择URL
  useEffect(() => {
    // 如果只有外部URL，使用外部URL
    if (!link.url && link.externalUrl) {
      setEffectiveUrl(link.externalUrl);
    }
    // 如果有外部URL且不在本地网络中，使用外部URL
    else if (link.externalUrl && !isInLocalNet) {
      setEffectiveUrl(link.externalUrl);
    }
    // 如果只有内部URL，使用内部URL
    else if (link.url) {
      setEffectiveUrl(link.url);
    }
    // 如果两者都没有（理论上不会发生，因为表单验证至少需要一个），使用空字符串
    else {
      setEffectiveUrl("");
    }
  }, [link.url, link.externalUrl, isInLocalNet]);

  // 检查内网链接可访问性
  useEffect(() => {
    // 如果链接是内部链接，检查可访问性
    if (link.isInternalOnly) {
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
  }, [effectiveUrl, link.isInternalOnly]);

  // 根据链接类型获取默认图标
  const defaultIcon = useMemo(() => {
    if (iconError || !iconBase64) {
      // 检查链接类型，返回相应的图标
      if (isInternalUrl(link.url) || link.isInternalOnly) {
        return <Server className="h-5 w-5 text-primary/70" />;
      } else if (
        link.url.includes("github.com") ||
        (link.externalUrl && link.externalUrl.includes("github.com"))
      ) {
        return (
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.207 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.73.083-.73 1.205.085 1.838 1.236 1.838 1.236 1.07 1.835 2.807 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.4 3-.405 1.02.005 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12" />
          </svg>
        );
      } else if (
        link.url.includes("google.com") ||
        (link.externalUrl && link.externalUrl.includes("google.com"))
      ) {
        return (
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
            <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
          </svg>
        );
      } else if (
        (link.url &&
          (link.url.includes("docs") || link.url.includes("document"))) ||
        (link.externalUrl &&
          (link.externalUrl.includes("docs") ||
            link.externalUrl.includes("document")))
      ) {
        return <FileText className="h-5 w-5 text-blue-500" />;
      } else if (
        link.tags.some(
          (tag) => tag.name.includes("工作") || tag.name.includes("办公")
        )
      ) {
        return <Briefcase className="h-5 w-5 text-amber-500" />;
      } else {
        return <Globe className="h-5 w-5 text-primary/70" />;
      }
    }
    return null;
  }, [
    iconBase64,
    link.url,
    link.externalUrl,
    link.isInternalOnly,
    link.tags,
    iconError,
  ]);

  // 计算链接状态 - 只用于显示警告，不再禁用链接
  const shouldShowWarning =
    link.isInternalOnly && (isAccessible === false || isAccessible === null);

  return (
    <Card
      className={cn(
        "group transition-all duration-300 hover:shadow-md dark:hover:shadow-primary/10 relative",
        shouldShowWarning
          ? "hover:border-yellow-500/50 cursor-pointer bg-muted/20"
          : "hover:border-primary/50 cursor-pointer"
      )}
    >
      {shouldShowWarning && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/20 backdrop-blur-[1px] rounded-lg overflow-hidden pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="flex flex-col items-center bg-background/90 px-4 py-3 rounded-md shadow-sm border border-yellow-500/30">
            <WifiOff className="h-5 w-5 text-yellow-500 mb-2" />
            <div className="text-center">
              <p className="text-xs font-medium text-foreground mb-1">
                内网链接检测不可访问
              </p>
              <p className="text-xs text-muted-foreground">
                检测可能不准确，点击仍可尝试
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col h-full">
        <CardHeader className="flex flex-row items-center space-x-4 p-4">
          <div
            className={cn(
              "flex-shrink-0 w-10 h-10 overflow-hidden rounded-md bg-background flex items-center justify-center border shadow-sm group-hover:border-primary/50 group-hover:shadow-md transition-all duration-300",
              shouldShowWarning &&
                "border-yellow-500/30 group-hover:border-yellow-500/50"
            )}
          >
            {iconBase64 && !iconError ? (
              <div className="flex items-center justify-center w-full h-full">
                <Image
                  src={iconBase64}
                  alt={`${link.title} icon`}
                  width={32}
                  height={32}
                  className={cn(
                    "object-contain max-w-[32px] max-h-[32px] group-hover:scale-110 transition-transform duration-300",
                    shouldShowWarning && "opacity-80"
                  )}
                  onError={() => {
                    setIconError(true);
                  }}
                  loading="lazy"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center w-full h-full">
                {defaultIcon || (
                  <div className="h-6 w-6 flex items-center justify-center bg-primary/5 rounded">
                    <span className="text-sm font-semibold text-primary">
                      {link.title.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex-1 space-y-1">
            <CardTitle className="flex items-center justify-between text-base font-medium leading-tight line-clamp-1 flex">
              <span>{link.title}</span>

              <div className="flex items-center gap-1 ml-2">
                {/* 显示内网链接状态图标 */}
                {link.isInternalOnly && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="text-xs">
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

                {/* 同时有内部和外部URL时显示双链标记 */}
                {link.externalUrl && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="text-xs">
                          <span className="text-blue-500">
                            <ArrowUpRightFromSquare className="h-4 w-4" />
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        {isInLocalNet ? "使用内网链接访问" : "使用外网链接访问"}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </CardTitle>
            {link.description && (
              <CardDescription className="text-xs line-clamp-1">
                {link.description}
              </CardDescription>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0 px-4 pb-0 flex-grow">
          <div className="text-xs text-muted-foreground truncate mb-3 flex items-center justify-between">
            <span className="truncate pr-2">{effectiveUrl}</span>
            <div className="flex gap-1 flex-shrink-0">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 relative z-10"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        copyToClipboard();
                      }}
                    >
                      {copied ? (
                        <CheckCheck className="h-3 w-3 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    {copied ? "已复制!" : "复制链接"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 relative z-10"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        shareLink();
                      }}
                    >
                      <Share2 className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">分享链接</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-wrap gap-1.5 p-4 pt-1 mt-auto">
          {/* 分类标签 */}
          {showCategory && link.category && (
            <Badge variant="outline" className="bg-primary/5 text-xs">
              {link.category.name}
            </Badge>
          )}

          {/* 标签列表 */}
          {link.tags &&
            link.tags.length > 0 &&
            link.tags.map((tag) => (
              <Badge
                key={tag.id}
                variant="secondary"
                className="text-xs"
                style={{
                  backgroundColor: tag.color ? `${tag.color}20` : undefined,
                  color: tag.color || undefined,
                }}
              >
                {tag.name}
              </Badge>
            ))}
        </CardFooter>
      </div>

      {/* 移除条件判断，始终允许点击 */}
      <Link
        href={effectiveUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute inset-0 z-0"
      >
        <span className="sr-only">访问 {link.title}</span>
      </Link>
    </Card>
  );
}
