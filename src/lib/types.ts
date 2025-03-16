import { Prisma } from "@prisma/client";
import type { PrismaClient } from "@prisma/client";

export type Link = Prisma.LinkUncheckedCreateInput;
export type Category = Prisma.CategoryUncheckedCreateInput;
export type Tag = Prisma.TagUncheckedCreateInput;

export interface LinkWithRelations {
  id: string;
  title: string;
  url: string;
  externalUrl?: string | null;
  description?: string | null;
  icon?: string | null;
  isInternalOnly: boolean;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  categoryId?: string | null;
  category?: {
    id: string;
    name: string;
    description?: string | null;
    color?: string | null;
  } | null;
  tags: {
    id: string;
    name: string;
    color?: string | null;
  }[];
}

export interface CategoryWithLinks {
  id: string;
  name: string;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
  links: {
    id: string;
    title: string;
    url: string;
  }[];
}

export interface TagWithLinks {
  id: string;
  name: string;
  color?: string | null;
  createdAt: Date;
  updatedAt: Date;
  links: {
    id: string;
    title: string;
    url: string;
  }[];
}

export type FilterOptions = {
  category?: string;
  tag?: string;
  visibility?: "all" | "internal" | "public";
  search?: string;
};

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type { PrismaClient };
