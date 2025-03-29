import React, { createContext, useContext, ReactNode } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Workout } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

type WorkoutContextType = {
  recommendedWorkout: Workout | undefined;
  allWorkouts: Workout[] | undefined;
  isLoading: boolean;
  error: Error | null;
  completeWorkout: (statType: string, amount: number) => Promise<void>;
};

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export function WorkoutProvider({ children }: { children: ReactNode }) {
  // Fetch recommended workout
  const { data: recommendedWorkout, isLoading: loadingRecommended, error: recommendedError } = useQuery<Workout>({
    queryKey: ["/api/workouts/recommended"],
  });

  // Fetch all workouts
  const { data: allWorkouts, isLoading: loadingAll, error: allError } = useQuery<Workout[]>({
    queryKey: ["/api/workouts"],
  });

  // Mutation for completing workouts
  const trainMutation = useMutation({
    mutationFn: async ({ stat, amount }: { stat: string; amount: number }) => {
      const response = await apiRequest("POST", `/api/training/${stat}`, { amount });
      return response.json();
    },
    onSuccess: () => {
      // Invalidate queries that might be affected
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user-quests/active"] });
    },
  });

  const completeWorkout = async (statType: string, amount: number) => {
    await trainMutation.mutateAsync({ stat: statType, amount });
  };

  const isLoading = loadingRecommended || loadingAll;
  const error = recommendedError || allError;

  return (
    <WorkoutContext.Provider
      value={{
        recommendedWorkout,
        allWorkouts,
        isLoading,
        error,
        completeWorkout,
      }}
    >
      {children}
    </WorkoutContext.Provider>
  );
}

export function useWorkout() {
  const context = useContext(WorkoutContext);
  if (context === undefined) {
    throw new Error("useWorkout must be used within a WorkoutProvider");
  }
  return context;
}
