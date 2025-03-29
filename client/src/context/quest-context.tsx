import React, { createContext, useContext, ReactNode } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { UserQuest, Quest } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface DetailedUserQuest extends UserQuest {
  quest?: Quest;
}

type QuestContextType = {
  activeQuests: DetailedUserQuest[] | undefined;
  completedQuests: DetailedUserQuest[] | undefined;
  availableQuests: Quest[] | undefined;
  isLoading: boolean;
  error: Error | null;
  acceptQuest: (questId: number) => Promise<void>;
  updateQuestProgress: (userQuestId: number, amount: number) => Promise<void>;
  generateNewQuest: () => Promise<void>;
};

const QuestContext = createContext<QuestContextType | undefined>(undefined);

export function QuestProvider({ children }: { children: ReactNode }) {
  // Fetch active quests
  const { 
    data: activeQuests, 
    isLoading: loadingActive, 
    error: activeError 
  } = useQuery<DetailedUserQuest[]>({
    queryKey: ["/api/user-quests/active"],
  });

  // Fetch completed quests
  const { 
    data: completedQuests, 
    isLoading: loadingCompleted, 
    error: completedError 
  } = useQuery<DetailedUserQuest[]>({
    queryKey: ["/api/user-quests/completed"],
  });

  // Fetch available quests
  const { 
    data: availableQuests, 
    isLoading: loadingAvailable, 
    error: availableError 
  } = useQuery<Quest[]>({
    queryKey: ["/api/quests/active"],
  });

  // Mutation for accepting a quest
  const acceptQuestMutation = useMutation({
    mutationFn: async (questId: number) => {
      const response = await apiRequest("POST", "/api/user-quests", { questId });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user-quests/active"] });
    },
  });

  // Mutation for updating quest progress
  const updateProgressMutation = useMutation({
    mutationFn: async ({ userQuestId, amount }: { userQuestId: number; amount: number }) => {
      const response = await apiRequest("POST", `/api/user-quests/${userQuestId}/progress`, { amount });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user-quests/active"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user-quests/completed"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
  });

  // Mutation for generating a new quest
  const generateQuestMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/quests/generate", {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user-quests/active"] });
    },
  });

  const acceptQuest = async (questId: number) => {
    await acceptQuestMutation.mutateAsync(questId);
  };

  const updateQuestProgress = async (userQuestId: number, amount: number) => {
    await updateProgressMutation.mutateAsync({ userQuestId, amount });
  };

  const generateNewQuest = async () => {
    await generateQuestMutation.mutateAsync();
  };

  const isLoading = loadingActive || loadingCompleted || loadingAvailable;
  const error = activeError || completedError || availableError;

  return (
    <QuestContext.Provider
      value={{
        activeQuests,
        completedQuests,
        availableQuests,
        isLoading,
        error,
        acceptQuest,
        updateQuestProgress,
        generateNewQuest,
      }}
    >
      {children}
    </QuestContext.Provider>
  );
}

export function useQuest() {
  const context = useContext(QuestContext);
  if (context === undefined) {
    throw new Error("useQuest must be used within a QuestProvider");
  }
  return context;
}
