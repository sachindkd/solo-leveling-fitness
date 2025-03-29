import React, { useState } from "react";
import AppLayout from "@/components/layout/app-layout";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProgressBar } from "@/components/ui/progress-bar";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { Loader2, Clock, Trophy, Plus, Sparkles, Zap } from "lucide-react";
import { UserQuest, Quest } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { STAT_NAMES } from "@/lib/constants";

interface DetailedUserQuest extends UserQuest {
  quest?: Quest;
}

export default function Quests() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("active");
  
  // Fetch user's active quests
  const { 
    data: activeQuests,
    isLoading: loadingActive 
  } = useQuery<DetailedUserQuest[]>({
    queryKey: ["/api/user-quests/active"],
    enabled: activeTab === "active"
  });
  
  // Fetch user's completed quests
  const { 
    data: completedQuests,
    isLoading: loadingCompleted 
  } = useQuery<DetailedUserQuest[]>({
    queryKey: ["/api/user-quests/completed"],
    enabled: activeTab === "completed"
  });
  
  // Fetch available quests
  const { 
    data: availableQuests,
    isLoading: loadingAvailable 
  } = useQuery<Quest[]>({
    queryKey: ["/api/quests/active"],
    enabled: activeTab === "available"
  });

  // Mutation for generating new quests
  const generateQuestMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/quests/generate", {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quests/active"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user-quests/active"] });
      toast({
        title: "New Quest Generated",
        description: "A quest has been generated just for you.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate a quest. Try again later.",
        variant: "destructive",
      });
    }
  });

  // Mutation for accepting a quest
  const acceptQuestMutation = useMutation({
    mutationFn: async (questId: number) => {
      const response = await apiRequest("POST", "/api/user-quests", { questId });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user-quests/active"] });
      toast({
        title: "Quest Accepted",
        description: "You've accepted a new quest. Good luck, Hunter!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to accept quest. You may already have this quest.",
        variant: "destructive",
      });
    }
  });

  // Mutation for updating quest progress
  const updateProgressMutation = useMutation({
    mutationFn: async ({ userQuestId, amount }: { userQuestId: number; amount: number }) => {
      const response = await apiRequest("POST", `/api/user-quests/${userQuestId}/progress`, { amount });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/user-quests/active"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user-quests/completed"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      
      if (data.completed) {
        toast({
          title: "Quest Completed!",
          description: "You've completed a quest and received rewards.",
        });
      } else {
        toast({
          title: "Progress Updated",
          description: "Your quest progress has been updated.",
        });
      }
    }
  });

  const handleGenerateQuest = () => {
    generateQuestMutation.mutate();
  };

  const handleAcceptQuest = (questId: number) => {
    acceptQuestMutation.mutate(questId);
  };

  const handleUpdateProgress = (userQuestId: number) => {
    updateProgressMutation.mutate({ userQuestId, amount: 1 });
  };

  const renderActiveQuests = () => {
    if (loadingActive) {
      return (
        <div className="h-40 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-secondary" />
        </div>
      );
    }

    if (!activeQuests || activeQuests.length === 0) {
      return (
        <div className="text-center p-8 bg-primary-dark bg-opacity-60 rounded-lg">
          <p className="text-gray-400 mb-4">You don't have any active quests</p>
          <Button onClick={() => setActiveTab("available")}>Find Quests</Button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {activeQuests.map(userQuest => {
          const quest = userQuest.quest;
          if (!quest) return null;
          
          const expiresAt = new Date(quest.expiresAt);
          const timeLeft = formatDistanceToNow(expiresAt, { addSuffix: true });
          const progressPercentage = (userQuest.progress / quest.requiredAmount) * 100;
          
          return (
            <Card key={userQuest.id} className="bg-primary-dark border-gray-700">
              <CardHeader>
                <div className="flex justify-between">
                  <div>
                    <div className="flex items-center mb-2">
                      <span className={`px-2 py-1 text-xs font-medium text-white mr-2 rounded ${
                        quest.type === 'daily' ? 'bg-secondary-dark' : 'bg-accent-dark'
                      }`}>
                        {quest.type === 'daily' ? 'Daily' : 'Weekly'}
                      </span>
                      <CardTitle className="text-lg text-white">{quest.title}</CardTitle>
                    </div>
                    <CardDescription>{quest.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-xs text-gray-500 mb-4">
                  <Clock className="h-4 w-4 mr-1" />
                  Expires {timeLeft}
                </div>
                
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress: {userQuest.progress} / {quest.requiredAmount}</span>
                    <span>{Math.round(progressPercentage)}%</span>
                  </div>
                  <ProgressBar 
                    value={userQuest.progress} 
                    max={quest.requiredAmount} 
                    color="bg-secondary"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Target Stat:</span>
                    <span className="text-white">{STAT_NAMES[quest.targetStat as keyof typeof STAT_NAMES]}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">XP Reward:</span>
                    <span className="text-secondary">+{quest.xpReward} XP</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Coin Reward:</span>
                    <span className="text-accent">+{quest.coinReward} coins</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={() => handleUpdateProgress(userQuest.id)}
                  className="w-full"
                  variant="secondary"
                  disabled={updateProgressMutation.isPending}
                >
                  {updateProgressMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Zap className="h-4 w-4 mr-2" />
                  )}
                  Record Progress
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    );
  };

  const renderCompletedQuests = () => {
    if (loadingCompleted) {
      return (
        <div className="h-40 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-secondary" />
        </div>
      );
    }

    if (!completedQuests || completedQuests.length === 0) {
      return (
        <div className="text-center p-8 bg-primary-dark bg-opacity-60 rounded-lg">
          <p className="text-gray-400">You haven't completed any quests yet</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {completedQuests.map(userQuest => {
          const quest = userQuest.quest;
          if (!quest) return null;
          
          return (
            <Card key={userQuest.id} className="bg-primary-dark border-gray-700 border-opacity-50">
              <CardHeader>
                <div className="flex justify-between">
                  <div>
                    <div className="flex items-center mb-2">
                      <span className={`px-2 py-1 text-xs font-medium text-white mr-2 rounded ${
                        quest.type === 'daily' ? 'bg-secondary-dark' : 'bg-accent-dark'
                      }`}>
                        {quest.type === 'daily' ? 'Daily' : 'Weekly'}
                      </span>
                      <CardTitle className="text-lg text-white">{quest.title}</CardTitle>
                    </div>
                    <CardDescription>{quest.description}</CardDescription>
                  </div>
                  <Trophy className="h-6 w-6 text-green-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Completed</span>
                    <span>100%</span>
                  </div>
                  <ProgressBar 
                    value={quest.requiredAmount} 
                    max={quest.requiredAmount} 
                    color="bg-green-500"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Target Stat:</span>
                    <span className="text-white">{STAT_NAMES[quest.targetStat as keyof typeof STAT_NAMES]}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">XP Reward:</span>
                    <span className="text-secondary">+{quest.xpReward} XP</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Coin Reward:</span>
                    <span className="text-accent">+{quest.coinReward} coins</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  const renderAvailableQuests = () => {
    if (loadingAvailable) {
      return (
        <div className="h-40 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-secondary" />
        </div>
      );
    }

    // Create a button to generate a new quest
    const generateQuestButton = (
      <div className="mb-6">
        <Button 
          onClick={handleGenerateQuest}
          disabled={generateQuestMutation.isPending}
          variant="outline"
          className="border-dashed border-gray-600 hover:border-secondary hover:bg-secondary/10"
        >
          {generateQuestMutation.isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4 mr-2" />
          )}
          Generate AI Quest
        </Button>
      </div>
    );

    if (!availableQuests || availableQuests.length === 0) {
      return (
        <>
          {generateQuestButton}
          <div className="text-center p-8 bg-primary-dark bg-opacity-60 rounded-lg">
            <p className="text-gray-400">There are no quests available at the moment</p>
          </div>
        </>
      );
    }

    return (
      <>
        {generateQuestButton}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {availableQuests.map(quest => {
            const expiresAt = new Date(quest.expiresAt);
            const timeLeft = formatDistanceToNow(expiresAt, { addSuffix: true });
            
            return (
              <Card key={quest.id} className="bg-primary-dark border-gray-700">
                <CardHeader>
                  <div className="flex items-center mb-2">
                    <span className={`px-2 py-1 text-xs font-medium text-white mr-2 rounded ${
                      quest.type === 'daily' ? 'bg-secondary-dark' : 'bg-accent-dark'
                    }`}>
                      {quest.type === 'daily' ? 'Daily' : 'Weekly'}
                    </span>
                    <CardTitle className="text-lg text-white">{quest.title}</CardTitle>
                  </div>
                  <CardDescription>{quest.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-xs text-gray-500 mb-4">
                    <Clock className="h-4 w-4 mr-1" />
                    Expires {timeLeft}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Required:</span>
                      <span className="text-white">{quest.requiredAmount} {STAT_NAMES[quest.targetStat as keyof typeof STAT_NAMES]} activities</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">XP Reward:</span>
                      <span className="text-secondary">+{quest.xpReward} XP</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Coin Reward:</span>
                      <span className="text-accent">+{quest.coinReward} coins</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={() => handleAcceptQuest(quest.id)}
                    className="w-full"
                    disabled={acceptQuestMutation.isPending}
                  >
                    {acceptQuestMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4 mr-2" />
                    )}
                    Accept Quest
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </>
    );
  };

  return (
    <AppLayout currentTab="Quests">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-6">Quest Board</h2>
        
        <Tabs defaultValue="active" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-primary-dark">
            <TabsTrigger value="active">Active Quests</TabsTrigger>
            <TabsTrigger value="available">Available Quests</TabsTrigger>
            <TabsTrigger value="completed">Completed Quests</TabsTrigger>
          </TabsList>
          
          <div className="mt-6">
            <TabsContent value="active">
              {renderActiveQuests()}
            </TabsContent>
            
            <TabsContent value="available">
              {renderAvailableQuests()}
            </TabsContent>
            
            <TabsContent value="completed">
              {renderCompletedQuests()}
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </AppLayout>
  );
}
