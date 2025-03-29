import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { User } from "@shared/schema";

interface UserWithTotalXp extends Omit<User, "password"> {
  totalXp: number;
}

export default function TopHunters() {
  const { user } = useAuth();
  
  const { data: leaderboard, isLoading } = useQuery<UserWithTotalXp[]>({
    queryKey: ["/api/leaderboard"],
  });
  
  if (isLoading) {
    return (
      <div className="card p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold font-sans text-white">Top Hunters</h3>
        </div>
        <div className="h-40 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
        </div>
      </div>
    );
  }
  
  if (!leaderboard || leaderboard.length === 0) {
    return (
      <div className="card p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold font-sans text-white">Top Hunters</h3>
        </div>
        <div className="bg-primary-dark bg-opacity-60 p-6 rounded-md text-center">
          <p className="text-gray-400">No hunters found</p>
        </div>
      </div>
    );
  }
  
  // Find current user's rank
  const currentUserRank = leaderboard.findIndex(u => u.id === user?.id) + 1;
  
  // Take only top 3 plus current user if not in top 3
  const topHunters = leaderboard.slice(0, 3);
  let currentUserEntry = null;
  
  if (user && currentUserRank > 3) {
    currentUserEntry = leaderboard.find(u => u.id === user.id);
  }
  
  return (
    <div className="card p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold font-sans text-white">Top Hunters</h3>
        <Link href="/leaderboard">
          <button className="text-sm text-secondary font-medium hover:text-secondary-light transition-colors">
            View Full Ranking
          </button>
        </Link>
      </div>
      
      <div className="space-y-4">
        {topHunters.map((hunter, index) => {
          const isCurrentUser = hunter.id === user?.id;
          const userInitial = hunter.username[0].toUpperCase();
          
          // Generate a deterministic color for each user
          const colors = ["bg-secondary", "bg-accent", "bg-green-500", "bg-blue-500", "bg-purple-500"];
          const colorIndex = hunter.id % colors.length;
          const bgColor = colors[colorIndex];
          
          return (
            <div 
              key={hunter.id} 
              className={`flex items-center bg-primary-dark bg-opacity-60 p-3 rounded-md ${
                isCurrentUser ? 'border border-secondary border-opacity-50' : ''
              }`}
            >
              <div className={`w-6 text-center font-bold ${isCurrentUser ? 'text-secondary' : 'text-gray-400'} mr-3`}>
                {index + 1}
              </div>
              <div className={`w-8 h-8 rounded-full ${bgColor} flex items-center justify-center overflow-hidden mr-3`}>
                <span className="text-white font-bold">{userInitial}</span>
              </div>
              <div className="flex-1">
                <div className="font-medium text-white">{hunter.username}</div>
                <div className="text-xs text-gray-400">{hunter.job} • {hunter.rank} Rank</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-secondary">{hunter.totalXp.toLocaleString()} XP</div>
                <div className="text-xs text-gray-400">Level {hunter.level}</div>
              </div>
            </div>
          );
        })}
        
        {currentUserEntry && (
          <>
            <div className="border-t border-gray-700 my-2"></div>
            <div className="flex items-center bg-primary-dark bg-opacity-60 p-3 rounded-md border border-secondary border-opacity-50">
              <div className="w-6 text-center font-bold text-secondary mr-3">
                {currentUserRank}
              </div>
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center overflow-hidden mr-3">
                <span className="text-white font-bold">{currentUserEntry.username[0].toUpperCase()}</span>
              </div>
              <div className="flex-1">
                <div className="font-medium text-white">{currentUserEntry.username}</div>
                <div className="text-xs text-gray-400">{currentUserEntry.job} • {currentUserEntry.rank} Rank</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-secondary">{currentUserEntry.totalXp.toLocaleString()} XP</div>
                <div className="text-xs text-gray-400">Level {currentUserEntry.level}</div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
