import React from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Workout } from "@shared/schema";

export default function TodaysWorkout() {
  const { user } = useAuth();
  
  const { data: workout, isLoading } = useQuery<Workout>({
    queryKey: ["/api/workouts/recommended"],
    refetchInterval: false,
  });
  
  const completeWorkout = async () => {
    if (!workout || !user) return;
    
    try {
      // Increase the target stat
      await apiRequest("POST", `/api/training/${workout.targetStat}`, { amount: 5 });
      
      // Invalidate user data to refresh stats
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      
      // Show success message
      // This would typically use toast notification
      alert("Workout completed! You gained XP and increased your stats.");
    } catch (error) {
      console.error("Failed to complete workout", error);
    }
  };
  
  if (isLoading) {
    return (
      <div className="card p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold font-sans text-white">Today's Workout</h3>
        </div>
        <div className="h-40 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
        </div>
      </div>
    );
  }
  
  if (!workout) {
    return (
      <div className="card p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold font-sans text-white">Today's Workout</h3>
        </div>
        <div className="bg-primary-dark bg-opacity-60 p-6 rounded-md text-center">
          <p className="text-gray-400 mb-4">No workout available</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="card p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold font-sans text-white">Today's Workout</h3>
        <div className="bg-secondary bg-opacity-20 rounded-md px-3 py-1">
          <span className="text-sm font-medium text-secondary">AI Recommended</span>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="bg-primary-dark bg-opacity-60 p-4 rounded-md">
          <h4 className="font-medium text-white mb-2">{workout.title}</h4>
          <p className="text-sm text-gray-400 mb-4">{workout.description}</p>
          
          <div className="space-y-3">
            {workout.exercises.map((exercise, index) => (
              <div key={index} className={`flex justify-between items-center ${
                index < workout.exercises.length - 1 ? 'border-b border-gray-700 pb-2' : ''
              }`}>
                <div>
                  <div className="font-medium text-white">{exercise.name}</div>
                  <div className="text-sm text-gray-400">{exercise.sets} sets × {exercise.reps}</div>
                </div>
                <button className="text-secondary hover:text-secondary-light transition-colors">
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
          
          <div className="mt-6">
            <button 
              onClick={completeWorkout}
              className="w-full bg-secondary hover:bg-secondary-dark text-white font-medium py-2 rounded-md transition-colors"
            >
              Start Workout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
