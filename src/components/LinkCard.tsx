"use client";

import Link from "next/link";
import Image from "next/image";
import { ExternalLink, Lock } from "lucide-react";
import { cn, getLinkIcon, isInternalUrl } from "@/lib/utils";
import type { LinkWithRelations } from "@/lib/types";

interface LinkCardProps {
  link: LinkWithRelations;
  showCategory?: boolean;
}

export function LinkCard({ link, showCategory = true }: LinkCardProps) {
  const isInternal = isInternalUrl(link.url);
  const iconUrl = getLinkIcon(link);

  return (
    <Link
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-lg border bg-card p-4 text-card-foreground shadow transition-all hover:shadow-md",
        link.isInternalOnly &&
          "border-amber-200 bg-amber-50/50 dark:bg-amber-950/10"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 overflow-hidden rounded-md border">
            <Image
              src={iconUrl}
              alt={link.title}
              width={40}
              height={40}
              className="object-contain"
            />
          </div>
          <div>
            <h3 className="font-medium group-hover:underline">{link.title}</h3>
            {showCategory && link.category && (
              <p className="text-xs text-muted-foreground">
                {link.category.name}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {link.isInternalOnly && (
            <span className="flex h-6 items-center rounded-full bg-amber-100 px-2 text-xs font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
              <Lock className="mr-1 h-3 w-3" />
              内网
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
              className="inline-flex h-5 items-center rounded-full px-2 text-xs font-medium"
              style={{
                backgroundColor: tag.color ? `${tag.color}20` : "#e5e7eb",
                color: tag.color || "#4b5563",
              }}
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
