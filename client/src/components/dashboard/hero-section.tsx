import React from "react";
import { useAuth } from "@/hooks/use-auth";
import { RankBadge } from "@/components/ui/rank-badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { STAT_COLORS, STAT_NAMES, RANK_DESCRIPTION, XP_PER_LEVEL } from "@/lib/constants";
import { StatType } from "@shared/schema";

export default function HeroSection() {
  const { user } = useAuth();
  
  if (!user) return null;
  
  const xpProgress = (user.xp / XP_PER_LEVEL) * 100;
  
  return (
    <div className="mb-8 bg-gradient-to-r from-primary to-primary-dark rounded-lg overflow-hidden shadow-md">
      <div className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
          <div className="mb-4 md:mb-0">
            <h2 className="text-2xl md:text-3xl font-bold font-sans text-white mb-1">Welcome Back, Hunter</h2>
            <p className="text-gray-400">Continue your journey to become the Shadow Monarch</p>
          </div>
          <div className="flex items-center space-x-2">
            <RankBadge rank={user.rank} />
            <div>
              <div className="text-sm text-gray-400">Current Rank</div>
              <div className="font-bold text-white">{user.rank}-Rank {RANK_DESCRIPTION[user.rank as keyof typeof RANK_DESCRIPTION]}</div>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <div className="text-sm font-medium text-gray-400">Level Progress ({user.xp}/{XP_PER_LEVEL})</div>
            <div className="text-sm font-medium text-secondary">{Math.round(xpProgress)}%</div>
          </div>
          <ProgressBar 
            value={user.xp} 
            max={XP_PER_LEVEL} 
            color="bg-secondary" 
          />
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <div>Level {user.level}</div>
            <div>Level {user.level + 1}</div>
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          {Object.entries(user.stats).map(([stat, value]) => (
            <div key={stat} className="bg-primary-light bg-opacity-40 rounded-md p-4">
              <div className="flex justify-between items-center mb-2">
                <div className="font-medium text-white">{STAT_NAMES[stat as StatType]}</div>
                <div className="text-sm font-bold text-white">{value}</div>
              </div>
              <ProgressBar 
                value={value} 
                max={100} 
                color={STAT_COLORS[stat as StatType]} 
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
