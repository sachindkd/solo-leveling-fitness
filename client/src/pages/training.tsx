import React, { useState } from "react";
import AppLayout from "@/components/layout/app-layout";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Workout } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ProgressBar } from "@/components/ui/progress-bar";
import { STAT_COLORS, STAT_NAMES } from "@/lib/constants";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { ActivitySquare, Dumbbell, Heart, Timer, Zap, ChevronRight, Award } from "lucide-react";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

const StatIcon = ({ stat }: { stat: string }) => {
  switch (stat) {
    case "strength":
      return <Dumbbell className="h-5 w-5 text-red-500" />;
    case "stamina":
      return <Heart className="h-5 w-5 text-green-500" />;
    case "speed":
      return <Zap className="h-5 w-5 text-blue-500" />;
    case "endurance":
      return <Timer className="h-5 w-5 text-purple-500" />;
    default:
      return <ActivitySquare className="h-5 w-5 text-gray-500" />;
  }
};

export default function Training() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("recommended");
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [completingWorkout, setCompletingWorkout] = useState(false);
  const [progressValue, setProgressValue] = useState(0);
  const [completedExercises, setCompletedExercises] = useState<number[]>([]);

  // Fetch recommended workout
  const { data: recommendedWorkout, isLoading: loadingRecommended } = useQuery<Workout>({
    queryKey: ["/api/workouts/recommended"],
    enabled: activeTab === "recommended"
  });

  // Fetch all workouts
  const { data: allWorkouts, isLoading: loadingAll } = useQuery<Workout[]>({
    queryKey: ["/api/workouts"],
    enabled: activeTab === "all"
  });

  // Filter workouts by rank
  const workoutsByRank = user ? allWorkouts?.filter(w => w.targetRank === user.rank) : [];
  
  // Filter workouts by job
  const workoutsByJob = user ? allWorkouts?.filter(w => w.targetJob === user.job) : [];

  // Mutation for completing workout
  const trainMutation = useMutation({
    mutationFn: async ({ stat, amount }: { stat: string; amount: number }) => {
      const response = await apiRequest("POST", `/api/training/${stat}`, { amount });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user-quests/active"] });
    }
  });

  const startWorkout = (workout: Workout) => {
    setSelectedWorkout(workout);
    setCompletingWorkout(true);
    setProgressValue(0);
    setCompletedExercises([]);
  };

  const completeExercise = (index: number) => {
    const newCompleted = [...completedExercises, index];
    setCompletedExercises(newCompleted);
    
    // Update progress
    const progressPercent = (newCompleted.length / selectedWorkout!.exercises.length) * 100;
    setProgressValue(progressPercent);
    
    // If all exercises are completed, finish workout
    if (newCompleted.length === selectedWorkout!.exercises.length) {
      finishWorkout();
    }
  };

  const finishWorkout = async () => {
    // Calculate training amount based on workout
    const trainingAmount = 5 + Math.floor(selectedWorkout!.exercises.length / 2);
    
    await trainMutation.mutateAsync({
      stat: selectedWorkout!.targetStat,
      amount: trainingAmount
    });
    
    // Reset state
    setTimeout(() => {
      setCompletingWorkout(false);
      setSelectedWorkout(null);
      setProgressValue(0);
      setCompletedExercises([]);
    }, 2000);
  };

  const cancelWorkout = () => {
    setCompletingWorkout(false);
    setSelectedWorkout(null);
    setProgressValue(0);
    setCompletedExercises([]);
  };

  const renderWorkoutCard = (workout: Workout) => (
    <Card key={workout.id} className="bg-primary-dark border-gray-700 hover:bg-opacity-70 transition-all">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-white">{workout.title}</CardTitle>
            <CardDescription>{workout.description}</CardDescription>
          </div>
          <div className="p-2 bg-opacity-20 rounded-md bg-secondary">
            <StatIcon stat={workout.targetStat} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {workout.exercises.slice(0, 3).map((exercise, i) => (
            <div key={i} className="flex justify-between items-center text-sm">
              <span className="text-white">{exercise.name}</span>
              <span className="text-gray-400">{exercise.sets} × {exercise.reps}</span>
            </div>
          ))}
          {workout.exercises.length > 3 && (
            <p className="text-xs text-gray-500">+ {workout.exercises.length - 3} more exercises</p>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center space-x-1">
            <StatIcon stat={workout.targetStat} />
            <span className="text-xs text-gray-400">Boosts {STAT_NAMES[workout.targetStat as keyof typeof STAT_NAMES]}</span>
          </div>
          <Button 
            variant="secondary" 
            onClick={() => startWorkout(workout)}
            size="sm"
          >
            Start
          </Button>
        </div>
      </CardFooter>
    </Card>
  );

  if (completingWorkout && selectedWorkout) {
    return (
      <AppLayout currentTab="Training">
        <Card className="bg-primary border-gray-700 mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-white text-xl">Current Workout: {selectedWorkout.title}</CardTitle>
                <CardDescription>{selectedWorkout.description}</CardDescription>
              </div>
              <Button 
                variant="destructive" 
                onClick={cancelWorkout}
                size="sm"
              >
                Cancel
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-400">Workout Progress</span>
                <span className="text-sm text-secondary">{Math.round(progressValue)}%</span>
              </div>
              <Progress value={progressValue} className="h-2" />
            </div>
            
            <div className="space-y-4 mt-6">
              {selectedWorkout.exercises.map((exercise, index) => (
                <div 
                  key={index} 
                  className={`p-4 rounded-md flex justify-between items-center 
                    ${completedExercises.includes(index) 
                      ? 'bg-secondary bg-opacity-20 border-secondary' 
                      : 'bg-primary-dark bg-opacity-60 border-gray-700'} 
                    border transition-all`}
                >
                  <div>
                    <h3 className="font-medium text-white mb-1">{exercise.name}</h3>
                    <p className="text-sm text-gray-400">{exercise.sets} sets × {exercise.reps}</p>
                  </div>
                  {completedExercises.includes(index) ? (
                    <div className="p-2 rounded-full bg-secondary bg-opacity-20">
                      <Award className="h-5 w-5 text-secondary" />
                    </div>
                  ) : (
                    <Button 
                      onClick={() => completeExercise(index)}
                      variant="outline"
                      size="sm"
                    >
                      Complete
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <div className="w-full flex justify-center">
              {progressValue === 100 ? (
                <div className="text-center">
                  <div className="text-lg font-bold text-green-500 mb-2">Workout Complete!</div>
                  <div className="text-gray-400">Great job! Your {STAT_NAMES[selectedWorkout.targetStat as keyof typeof STAT_NAMES]} has increased.</div>
                </div>
              ) : (
                <div className="text-center text-gray-400">
                  Complete all exercises to finish your workout
                </div>
              )}
            </div>
          </CardFooter>
        </Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout currentTab="Training">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-6">Training Center</h2>
        
        {/* User Stats */}
        <Card className="bg-gradient-to-r from-primary to-primary-dark border-gray-700 mb-8">
          <CardContent className="p-6">
            <h3 className="text-lg font-medium text-white mb-4">Your Stats</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {user && Object.entries(user.stats).map(([stat, value]) => (
                <div key={stat} className="bg-primary-light bg-opacity-40 rounded-md p-3">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <StatIcon stat={stat} />
                      <span className="font-medium text-white ml-2">{STAT_NAMES[stat as keyof typeof STAT_NAMES]}</span>
                    </div>
                    <div className="text-sm font-bold text-white">{value}</div>
                  </div>
                  <ProgressBar 
                    value={value} 
                    max={100} 
                    color={STAT_COLORS[stat as keyof typeof STAT_COLORS]} 
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-primary-dark">
            <TabsTrigger value="recommended">Recommended</TabsTrigger>
            <TabsTrigger value="byRank">By Rank</TabsTrigger>
            <TabsTrigger value="byJob">By Job</TabsTrigger>
            <TabsTrigger value="all">All Workouts</TabsTrigger>
          </TabsList>
          
          <div className="mt-6">
            <TabsContent value="recommended">
              {loadingRecommended ? (
                <div className="h-40 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-secondary" />
                </div>
              ) : recommendedWorkout ? (
                <div>
                  <h3 className="text-lg font-medium text-white mb-4">Recommended for You</h3>
                  {renderWorkoutCard(recommendedWorkout)}
                </div>
              ) : (
                <div className="text-gray-400 text-center p-8">
                  No recommended workouts available.
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="byRank">
              {loadingAll ? (
                <div className="h-40 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-secondary" />
                </div>
              ) : workoutsByRank && workoutsByRank.length > 0 ? (
                <div>
                  <h3 className="text-lg font-medium text-white mb-4">
                    Workouts for {user?.rank}-Rank Hunters
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {workoutsByRank.map(workout => renderWorkoutCard(workout))}
                  </div>
                </div>
              ) : (
                <div className="text-gray-400 text-center p-8">
                  No workouts available for your rank.
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="byJob">
              {loadingAll ? (
                <div className="h-40 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-secondary" />
                </div>
              ) : workoutsByJob && workoutsByJob.length > 0 ? (
                <div>
                  <h3 className="text-lg font-medium text-white mb-4">
                    Workouts for {user?.job}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {workoutsByJob.map(workout => renderWorkoutCard(workout))}
                  </div>
                </div>
              ) : (
                <div className="text-gray-400 text-center p-8">
                  No workouts available for your job class.
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="all">
              {loadingAll ? (
                <div className="h-40 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-secondary" />
                </div>
              ) : allWorkouts && allWorkouts.length > 0 ? (
                <div>
                  <h3 className="text-lg font-medium text-white mb-4">All Available Workouts</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {allWorkouts.map(workout => renderWorkoutCard(workout))}
                  </div>
                </div>
              ) : (
                <div className="text-gray-400 text-center p-8">
                  No workouts available.
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </AppLayout>
  );
}
