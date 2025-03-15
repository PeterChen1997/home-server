"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ExternalLink, Lock, WifiOff } from "lucide-react";
import { cn, isInternalUrl, isInLocalNetwork } from "@/lib/utils";
import type { LinkWithRelations } from "@/lib/types";

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
  const isInternal = isInternalUrl(link.url);
  const [iconSrc, setIconSrc] = useState<string>(
    iconBase64 || "/placeholder-icon.svg"
  );
  const [isInLocalNet, setIsInLocalNet] = useState<boolean | null>(null);
  const [isLoadingNetwork, setIsLoadingNetwork] = useState(true);

  // 当组件挂载后，检测是否在局域网内
  useEffect(() => {
    const checkNetwork = async () => {
      try {
        const inLocal = await isInLocalNetwork();
        setIsInLocalNet(inLocal);
      } catch (error) {
        console.error("Network detection error:", error);
        setIsInLocalNet(false);
      } finally {
        setIsLoadingNetwork(false);
      }
    };

    checkNetwork();
  }, []);

  // 图片加载错误的处理器
  const handleImageError = () => {
    setIconSrc("/placeholder-icon.svg");
  };

  // 判断内网链接是否可访问
  const isInaccessible =
    isInternal && isInLocalNet === false && link.isInternalOnly;

  return (
    <Link
      href={isInaccessible ? "#" : link.url}
      target={isInaccessible ? "_self" : "_blank"}
      rel="noopener noreferrer"
      onClick={(e) => isInaccessible && e.preventDefault()}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-lg border bg-card p-4 text-card-foreground transition-all hover:shadow-md",
        link.isInternalOnly &&
          !isInaccessible &&
          "border-amber-200 bg-amber-50/50 dark:border-amber-900/50 dark:bg-amber-950/10",
        isInaccessible &&
          "border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/50 opacity-60 cursor-not-allowed"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 overflow-hidden rounded-md border bg-background">
            <Image
              src={iconSrc}
              alt={link.title}
              width={40}
              height={40}
              className="object-contain p-1"
              onError={handleImageError}
            />
          </div>
          <div>
            <h3
              className={cn(
                "font-medium group-hover:underline",
                isInaccessible && "group-hover:no-underline"
              )}
            >
              {link.title}
            </h3>
            {showCategory && link.category && (
              <p className="text-xs text-muted-foreground">
                {link.category.name}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {link.isInternalOnly && (
            <span
              className={cn(
                "flex h-6 items-center rounded-full px-2 text-xs font-medium",
                isInaccessible
                  ? "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                  : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
              )}
            >
              <Lock className="mr-1 h-3 w-3" />
              内网
            </span>
          )}
          {isInaccessible && (
            <span className="flex h-6 items-center rounded-full bg-red-100 px-2 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-300">
              <WifiOff className="mr-1 h-3 w-3" />
              不可用
            </span>
          )}
          <ExternalLink className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      {link.description && (
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
          {link.description}
        </p>
      )}

      {link.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {link.tags.map((tag) => (
            <span
              key={tag.id}
              className={cn(
                "inline-flex h-5 items-center rounded-full px-2 text-xs font-medium",
                isInaccessible
                  ? "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                  : ""
              )}
              style={
                !isInaccessible && tag.color
                  ? {
                      backgroundColor: `${tag.color}20`,
                      color: tag.color,
                    }
                  : undefined
              }
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
