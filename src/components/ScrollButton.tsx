"use client";

import React from "react";
import { Button } from "@/components/ui/button";

interface ScrollButtonProps {
  targetId: string;
  children: React.ReactNode;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

export default function ScrollButton({
  targetId,
  children,
  variant = "default",
  size = "lg",
}: ScrollButtonProps) {
  const handleClick = () => {
    const targetElement = document.getElementById(`${targetId}-section`);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <Button
      className="gap-1 group"
      variant={variant}
      size={size}
      onClick={handleClick}
      data-scroll-to={targetId}
    >
      {children}
    </Button>
  );
}
