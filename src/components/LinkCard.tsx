"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ExternalLink, Lock, WifiOff } from "lucide-react";
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

  // 检查内网链接可访问性
  useEffect(() => {
    // 如果链接是内部链接，检查可访问性
    if (link.isInternalOnly) {
      setIsLoading(true);
      isUrlAccessibleInLocalNetwork(link.url)
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
  }, [link.url, link.isInternalOnly]);

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
      <Link
        href={isDisabled ? "#" : link.url}
        target="_blank"
        rel="noopener noreferrer"
        className={cn("block h-full", isDisabled && "pointer-events-none")}
        {...ariaDisabled}
      >
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
            <CardTitle className="text-base font-medium leading-tight line-clamp-1">
              {link.title}
            </CardTitle>
            {link.description && (
              <CardDescription className="text-xs line-clamp-1">
                {link.description}
              </CardDescription>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0 px-4 pb-0">
          <div className="text-xs text-muted-foreground truncate mb-3">
            {link.url}
          </div>
        </CardContent>

        <CardFooter className="flex flex-wrap gap-1.5 p-4 pt-1">
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
              <Badge key={tag.id} variant="secondary" className="text-xs">
                {tag.name}
              </Badge>
            ))}

          {/* 内网标签 */}
          {link.isInternalOnly && (
            <Badge
              variant={isAccessible ? "default" : "destructive"}
              className="text-xs ml-auto"
            >
              {isLoading ? "检测中..." : isAccessible ? "可访问" : "不可访问"}
            </Badge>
          )}
        </CardFooter>
      </Link>
    </Card>
  );
}
