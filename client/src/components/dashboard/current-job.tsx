import React from "react";
import { useAuth } from "@/hooks/use-auth";
import { ProgressBar } from "@/components/ui/progress-bar";
import { JOB_PERKS, RANK_REQUIREMENTS } from "@/lib/constants";
import { Swords } from "lucide-react";

export default function CurrentJob() {
  const { user } = useAuth();
  
  if (!user) return null;
  
  const { rank, job } = user;
  
  // Calculate progress to next rank
  const nextRankIndex = ["E", "D", "C", "B", "A", "S", "SS"].indexOf(rank) + 1;
  const isMaxRank = nextRankIndex >= 7; // SS is the max rank
  
  let progressPercentage = 0;
  let nextRank = "";
  let nextJob = "";
  
  if (!isMaxRank) {
    nextRank = ["E", "D", "C", "B", "A", "S", "SS"][nextRankIndex];
    nextJob = ["Novice Hunter", "Assassin", "Berserker", "Mage", "Tank", "Warlock", "Shadow Monarch"][nextRankIndex];
    
    // Calculate progress based on level
    const currentRequirement = RANK_REQUIREMENTS[rank as keyof typeof RANK_REQUIREMENTS];
    const nextRequirement = RANK_REQUIREMENTS[nextRank as keyof typeof RANK_REQUIREMENTS];
    
    if (currentRequirement && nextRequirement) {
      progressPercentage = Math.min(100, Math.max(0, 
        ((user.level - currentRequirement.level) / (nextRequirement.level - currentRequirement.level)) * 100
      ));
    }
  }
  
  // Get job perks
  const perks = JOB_PERKS[job as keyof typeof JOB_PERKS] || [];
  
  return (
    <div className="card p-6">
      <h3 className="text-xl font-bold font-sans text-white mb-6">Current Job</h3>
      
      <div className="bg-gradient-to-br from-primary to-primary-dark border border-gray-700 rounded-lg overflow-hidden">
        <div className="p-4">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="text-lg font-bold text-white mb-1">{job}</div>
              <div className="text-sm text-gray-400">{rank}-Rank Specialization</div>
            </div>
            <div className="p-2 bg-accent bg-opacity-20 rounded-md">
              <Swords className="h-6 w-6 text-accent" />
            </div>
          </div>
          
          <div className="space-y-3 mb-4">
            {perks.map((perk, index) => (
              <div key={index} className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-white">{perk}</span>
              </div>
            ))}
          </div>
          
          {!isMaxRank && (
            <>
              <div className="text-xs text-gray-400 mb-2">Next Job Unlock: {nextRank}-Rank ({nextJob})</div>
              <ProgressBar value={progressPercentage} max={100} color="bg-accent" />
            </>
          )}
          
          {isMaxRank && (
            <div className="text-xs text-accent mb-2">Maximum rank achieved: Shadow Monarch</div>
          )}
        </div>
      </div>
    </div>
  );
}
