import React from "react";
import AppLayout from "@/components/layout/app-layout";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { RankBadge } from "@/components/ui/rank-badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { useToast } from "@/hooks/use-toast";
import { RANK_REQUIREMENTS, JOB_PERKS, RANK_DESCRIPTION } from "@/lib/constants";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Shield, Sword, Clock, Zap, Crown, Flame, ArrowUpCircle, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";

// Job icons mapping
const JOB_ICONS = {
  "Novice Hunter": <Shield className="h-8 w-8 text-gray-400" />,
  "Assassin": <Zap className="h-8 w-8 text-blue-400" />,
  "Berserker": <Sword className="h-8 w-8 text-red-400" />,
  "Mage": <Flame className="h-8 w-8 text-purple-400" />,
  "Tank": <Shield className="h-8 w-8 text-green-400" />,
  "Warlock": <Clock className="h-8 w-8 text-orange-400" />,
  "Shadow Monarch": <Crown className="h-8 w-8 text-yellow-400" />
};

export default function Jobs() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Mutation for ranking up
  const rankUpMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/rank-up", {});
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Rank Up Successful!",
        description: `Congratulations! You've ranked up to ${data.newRank}-Rank and unlocked the ${data.newJob} job.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Rank Up Failed",
        description: error.message || "You don't meet the requirements for rank up.",
        variant: "destructive",
      });
    }
  });

  const handleRankUp = () => {
    rankUpMutation.mutate();
  };

  // Check if user can rank up
  const canRankUp = () => {
    if (!user) return false;
    
    const rankIndex = ["E", "D", "C", "B", "A", "S", "SS"].indexOf(user.rank);
    if (rankIndex >= 6) return false; // Already at max rank
    
    const nextRank = ["E", "D", "C", "B", "A", "S", "SS"][rankIndex + 1];
    const requirements = RANK_REQUIREMENTS[nextRank as keyof typeof RANK_REQUIREMENTS];
    
    if (!requirements) return false;
    
    // Check level requirement
    if (user.level < requirements.level) return false;
    
    // Check stats requirements
    for (const stat of ["strength", "stamina", "speed", "endurance"]) {
      if (user.stats[stat] < requirements.stats) return false;
    }
    
    return true;
  };

  // Get requirements for next rank
  const getNextRankRequirements = () => {
    if (!user) return null;
    
    const rankIndex = ["E", "D", "C", "B", "A", "S", "SS"].indexOf(user.rank);
    if (rankIndex >= 6) return null; // Already at max rank
    
    const nextRank = ["E", "D", "C", "B", "A", "S", "SS"][rankIndex + 1];
    return RANK_REQUIREMENTS[nextRank as keyof typeof RANK_REQUIREMENTS];
  };

  if (!user) {
    return (
      <AppLayout currentTab="Jobs">
        <div className="h-40 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-secondary" />
        </div>
      </AppLayout>
    );
  }

  // Define jobs array
  const jobs = [
    { name: "Novice Hunter", rank: "E", unlocked: true },
    { name: "Assassin", rank: "D", unlocked: ["D", "C", "B", "A", "S", "SS"].includes(user.rank) },
    { name: "Berserker", rank: "C", unlocked: ["C", "B", "A", "S", "SS"].includes(user.rank) },
    { name: "Mage", rank: "B", unlocked: ["B", "A", "S", "SS"].includes(user.rank) },
    { name: "Tank", rank: "A", unlocked: ["A", "S", "SS"].includes(user.rank) },
    { name: "Warlock", rank: "S", unlocked: ["S", "SS"].includes(user.rank) },
    { name: "Shadow Monarch", rank: "SS", unlocked: ["SS"].includes(user.rank) }
  ];

  // Get current job
  const currentJob = jobs.find(job => job.name === user.job);

  const nextRankRequirements = getNextRankRequirements();
  const isPendingRankUp = rankUpMutation.isPending;

  return (
    <AppLayout currentTab="Jobs">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-6">Hunter Jobs</h2>
        
        {/* Current Job & Rank Info */}
        <Card className="bg-gradient-to-r from-primary to-primary-dark border-gray-700 mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row justify-between gap-6">
              {/* Current Job */}
              <div className="w-full md:w-2/3">
                <h3 className="text-lg font-medium text-white mb-4">Your Current Job</h3>
                <div className="bg-primary-dark bg-opacity-70 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-start">
                    <div className="p-3 bg-primary-light bg-opacity-30 rounded-md mr-4">
                      {JOB_ICONS[currentJob?.name as keyof typeof JOB_ICONS] || <Shield className="h-8 w-8 text-gray-400" />}
                    </div>
                    <div>
                      <div className="flex items-center mb-2">
                        <h4 className="text-xl font-bold text-white mr-3">{currentJob?.name}</h4>
                        <RankBadge rank={user.rank} size="sm" />
                      </div>
                      <p className="text-gray-400 text-sm mb-3">{RANK_DESCRIPTION[user.rank as keyof typeof RANK_DESCRIPTION]} Hunter</p>
                      
                      <div className="space-y-2 mt-4">
                        {JOB_PERKS[user.job as keyof typeof JOB_PERKS]?.map((perk, index) => (
                          <div key={index} className="flex items-center text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            <span className="text-white">{perk}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Rank Up Info */}
              <div className="w-full md:w-1/3">
                <h3 className="text-lg font-medium text-white mb-4">Rank Information</h3>
                <div className="bg-primary-dark bg-opacity-70 rounded-lg p-4 border border-gray-700">
                  {user.rank === "SS" ? (
                    <div className="text-center py-4">
                      <Crown className="h-12 w-12 text-yellow-400 mx-auto mb-3" />
                      <h4 className="text-xl font-bold text-white mb-2">Maximum Rank Achieved</h4>
                      <p className="text-gray-400">You've reached the pinnacle of hunter ranks!</p>
                    </div>
                  ) : nextRankRequirements ? (
                    <>
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center">
                          <RankBadge rank={user.rank} size="sm" className="mr-2" />
                          <ArrowUpCircle className="h-5 w-5 text-secondary mx-2" />
                          <RankBadge 
                            rank={["E", "D", "C", "B", "A", "S", "SS"][["E", "D", "C", "B", "A", "S", "SS"].indexOf(user.rank) + 1]} 
                            size="sm" 
                          />
                        </div>
                        <span className="text-sm text-gray-400">
                          Next: {["Novice Hunter", "Assassin", "Berserker", "Mage", "Tank", "Warlock", "Shadow Monarch"][["E", "D", "C", "B", "A", "S", "SS"].indexOf(user.rank) + 1]}
                        </span>
                      </div>
                      
                      <div className="space-y-3 mb-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-400">Required Level</span>
                            <span className={user.level >= nextRankRequirements.level ? "text-green-500" : "text-red-400"}>
                              {user.level} / {nextRankRequirements.level}
                            </span>
                          </div>
                          <ProgressBar 
                            value={Math.min(user.level, nextRankRequirements.level)} 
                            max={nextRankRequirements.level} 
                            color={user.level >= nextRankRequirements.level ? "bg-green-500" : "bg-secondary"} 
                          />
                        </div>
                        
                        {Object.entries(user.stats).map(([stat, value]) => (
                          <div key={stat}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-400">{stat.charAt(0).toUpperCase() + stat.slice(1)}</span>
                              <span className={value >= nextRankRequirements.stats ? "text-green-500" : "text-red-400"}>
                                {value} / {nextRankRequirements.stats}
                              </span>
                            </div>
                            <ProgressBar 
                              value={Math.min(value, nextRankRequirements.stats)} 
                              max={nextRankRequirements.stats} 
                              color={value >= nextRankRequirements.stats ? "bg-green-500" : "bg-secondary"} 
                            />
                          </div>
                        ))}
                      </div>
                      
                      <Button 
                        onClick={handleRankUp}
                        disabled={!canRankUp() || isPendingRankUp}
                        className="w-full"
                        variant={canRankUp() ? "default" : "outline"}
                      >
                        {isPendingRankUp ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : canRankUp() ? (
                          <ArrowUpCircle className="h-4 w-4 mr-2" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 mr-2" />
                        )}
                        {canRankUp() ? "Rank Up Now" : "Requirements Not Met"}
                      </Button>
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-3" />
                      <p className="text-gray-400">Error loading rank requirements</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* All Jobs */}
        <h3 className="text-xl font-bold text-white mb-4">All Hunter Jobs</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {jobs.map(job => {
            const isCurrentJob = job.name === user.job;
            const jobPerks = JOB_PERKS[job.name as keyof typeof JOB_PERKS] || [];
            
            return (
              <Card 
                key={job.name} 
                className={`job-card ${job.unlocked ? "unlocked" : ""} ${isCurrentJob ? "selected" : ""} bg-primary-dark border-gray-700`}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center">
                        <RankBadge rank={job.rank} size="sm" className="mr-2" />
                        <CardTitle className="text-white">{job.name}</CardTitle>
                      </div>
                      <CardDescription>{RANK_DESCRIPTION[job.rank as keyof typeof RANK_DESCRIPTION]} Hunter</CardDescription>
                    </div>
                    <div className={`p-3 rounded-md ${job.unlocked ? "bg-primary-light bg-opacity-30" : "bg-gray-800 bg-opacity-50"}`}>
                      {JOB_ICONS[job.name as keyof typeof JOB_ICONS] || <Shield className="h-8 w-8 text-gray-400" />}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {job.unlocked ? (
                    <div className="space-y-2">
                      {jobPerks.map((perk, index) => (
                        <div key={index} className="flex items-center text-sm">
                          <CheckCircle className={`h-4 w-4 ${isCurrentJob ? "text-green-500" : "text-gray-500"} mr-2`} />
                          <span className={isCurrentJob ? "text-white" : "text-gray-400"}>{perk}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-2">
                      <p className="text-sm text-gray-500">Reach {job.rank}-Rank to unlock</p>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  {isCurrentJob ? (
                    <div className="w-full text-center py-1 px-3 bg-secondary bg-opacity-20 rounded text-secondary text-sm">
                      Current Job
                    </div>
                  ) : job.unlocked ? (
                    <div className="w-full text-center py-1 px-3 bg-green-500 bg-opacity-20 rounded text-green-500 text-sm">
                      Unlocked
                    </div>
                  ) : (
                    <div className="w-full text-center py-1 px-3 bg-gray-700 bg-opacity-20 rounded text-gray-500 text-sm">
                      Locked
                    </div>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
