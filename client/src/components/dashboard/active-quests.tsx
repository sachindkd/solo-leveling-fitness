import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ProgressBar } from "@/components/ui/progress-bar";
import { formatDistanceToNow } from "date-fns";
import { UserQuest, Quest } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

interface DetailedUserQuest extends UserQuest {
  quest?: Quest;
}

export default function ActiveQuests() {
  const { data: quests, isLoading } = useQuery<DetailedUserQuest[]>({
    queryKey: ["/api/user-quests/active"],
  });
  
  const updateQuestProgress = async (userQuestId: number, amount: number) => {
    await apiRequest("POST", `/api/user-quests/${userQuestId}/progress`, { amount });
    // Invalidate the active quests query to refetch
    queryClient.invalidateQueries({ queryKey: ["/api/user-quests/active"] });
  };
  
  if (isLoading) {
    return (
      <div className="card p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold font-sans text-white">Active Quests</h3>
        </div>
        <div className="h-40 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="card p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold font-sans text-white">Active Quests</h3>
        <Link href="/quests">
          <button className="text-sm text-secondary font-medium hover:text-secondary-light transition-colors">
            View All
          </button>
        </Link>
      </div>
      
      <div className="space-y-4">
        {quests && quests.length > 0 ? (
          quests.map((userQuest) => {
            const quest = userQuest.quest;
            if (!quest) return null;
            
            const expiresAt = new Date(quest.expiresAt);
            const timeLeft = formatDistanceToNow(expiresAt, { addSuffix: true });
            const progressPercentage = (userQuest.progress / quest.requiredAmount) * 100;
            
            return (
              <div key={userQuest.id} className="quest-card bg-primary-dark bg-opacity-60 p-4 rounded-md">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center mb-2">
                      <span className={`px-2 py-1 ${quest.type === 'daily' ? 'bg-secondary-dark' : 'bg-accent-dark'} rounded text-xs font-medium text-white mr-2`}>
                        {quest.type === 'daily' ? 'Daily' : 'Weekly'}
                      </span>
                      <h4 className="font-medium text-white">{quest.title}</h4>
                    </div>
                    <p className="text-sm text-gray-400 mb-3">{quest.description}</p>
                    <div className="flex items-center text-xs text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Expires {timeLeft}
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="flex items-center mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-accent mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-accent font-medium">+{quest.coinReward}</span>
                    </div>
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-secondary mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span className="text-secondary font-medium">+{quest.xpReward} XP</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <ProgressBar 
                    value={userQuest.progress} 
                    max={quest.requiredAmount} 
                    color="bg-secondary" 
                  />
                  <div className="flex justify-between mt-1 text-xs">
                    <span className="text-gray-400">{userQuest.progress} / {quest.requiredAmount}</span>
                    <span className="text-gray-400">{Math.round(progressPercentage)}%</span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-primary-dark bg-opacity-60 p-6 rounded-md text-center">
            <p className="text-gray-400 mb-4">No active quests found</p>
            <Link href="/quests">
              <button className="bg-secondary hover:bg-secondary-dark text-white font-medium py-2 px-4 rounded-md transition-colors">
                Find New Quests
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
