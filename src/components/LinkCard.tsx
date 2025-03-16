"use client";

import React, { useState, useEffect } from "react";
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
      const result = await isInLocalNetwork();
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

  // 计算链接状态
  const isDisabled = link.isInternalOnly && isAccessible === false;
  const ariaDisabled = isDisabled ? { "aria-disabled": true } : {};

  return (
    <Card
      className={cn(
        "group transition-all duration-300 hover:shadow-md dark:hover:shadow-primary/10",
        isDisabled
          ? "opacity-60 cursor-not-allowed bg-muted"
          : "hover:border-primary/50 cursor-pointer"
      )}
    >
      <div className="flex flex-col h-full">
        <CardHeader className="flex flex-row items-center space-x-4 p-4">
          <div className="h-10 w-10 overflow-hidden rounded-full bg-background flex items-center justify-center border">
            {iconBase64 ? (
              <Image
                src={iconBase64}
                alt={`${link.title} icon`}
                width={32}
                height={32}
                className="object-contain"
              />
            ) : (
              <div className="h-6 w-6 bg-primary/10 rounded-full" />
            )}
          </div>
          <div className="flex-1 space-y-1">
            <CardTitle className="flex items-center justify-between text-base font-medium leading-tight line-clamp-1">
              <span>{link.title}</span>

              <div className="flex items-center gap-1 ml-2">
                {/* 只在启用时显示网络状态图标 */}
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
                            <span className="text-red-500">
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
                          : "内网链接不可访问"}
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

      {!isDisabled && (
        <Link
          href={effectiveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-0 z-0"
          {...ariaDisabled}
        >
          <span className="sr-only">访问 {link.title}</span>
        </Link>
      )}
    </Card>
  );
}
