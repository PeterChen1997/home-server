"use client";

import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";
import { ReactNode } from "react";

interface ScrollButtonProps {
  targetId: string;
  children: ReactNode;
  className?: string;
}

const ScrollButton = ({
  targetId,
  children,
  className = "",
}: ScrollButtonProps) => {
  const handleScroll = () => {
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <Button
      onClick={handleScroll}
      className={`group flex items-center gap-2 transition-all duration-300 hover:gap-3 ${className}`}
    >
      {children}
      <ArrowDown className="h-4 w-4 transition-transform duration-300 group-hover:translate-y-1" />
    </Button>
  );
};

export default ScrollButton;
