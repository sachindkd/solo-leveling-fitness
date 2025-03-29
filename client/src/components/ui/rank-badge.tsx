import React from "react";
import { RANK_COLORS } from "@/lib/constants";

interface RankBadgeProps {
  rank: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function RankBadge({ rank, size = "md", className = "" }: RankBadgeProps) {
  const sizeClasses = {
    sm: "w-6 h-6 text-xs",
    md: "w-10 h-10 text-base",
    lg: "w-14 h-14 text-xl",
  };
  
  const rankColor = RANK_COLORS[rank as keyof typeof RANK_COLORS] || "bg-gray-700 text-white";
  
  return (
    <div 
      className={`rank-badge ${rankColor} ${sizeClasses[size]} rounded-full flex items-center justify-center font-bold font-rajdhani ${className}`}
    >
      {rank}
    </div>
  );
}
