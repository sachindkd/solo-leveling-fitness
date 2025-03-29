import React from "react";
import { useAuth } from "@/hooks/use-auth";
import AppLayout from "@/components/layout/app-layout";
import HeroSection from "@/components/dashboard/hero-section";
import ActiveQuests from "@/components/dashboard/active-quests";
import TodaysWorkout from "@/components/dashboard/todays-workout";
import CurrentJob from "@/components/dashboard/current-job";
import TopHunters from "@/components/dashboard/top-hunters";
import UpcomingEvents from "@/components/dashboard/upcoming-events";
import { Loader2 } from "lucide-react";

export default function Dashboard() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-primary-dark">
        <Loader2 className="h-8 w-8 animate-spin text-secondary" />
      </div>
    );
  }

  if (!user) {
    return null; // This should be handled by the ProtectedRoute component
  }

  return (
    <AppLayout currentTab="Dashboard">
      {/* Hero Section with user stats */}
      <HeroSection />

      {/* Two Column Layout for desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Active Quests */}
          <ActiveQuests />

          {/* Today's Workout */}
          <TodaysWorkout />
        </div>

        <div className="space-y-6">
          {/* Current Job */}
          <CurrentJob />

          {/* Top Hunters */}
          <TopHunters />

          {/* Upcoming Events */}
          <UpcomingEvents />
        </div>
      </div>
    </AppLayout>
  );
}
