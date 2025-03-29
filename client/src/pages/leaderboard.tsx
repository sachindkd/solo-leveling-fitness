import React, { useState } from "react";
import AppLayout from "@/components/layout/app-layout";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RankBadge } from "@/components/ui/rank-badge";
import { RANK_COLORS } from "@/lib/constants";
import { Loader2, Search, Medal, Trophy, Award } from "lucide-react";
import { User } from "@shared/schema";
import { Input } from "@/components/ui/input";

interface UserWithTotalXp extends Omit<User, "password"> {
  totalXp: number;
}

export default function Leaderboard() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [rankFilter, setRankFilter] = useState("all");
  
  // Fetch leaderboard data
  const { data: leaderboard, isLoading } = useQuery<UserWithTotalXp[]>({
    queryKey: ["/api/leaderboard"],
  });
  
  if (isLoading) {
    return (
      <AppLayout currentTab="Leaderboard">
        <div className="h-40 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-secondary" />
        </div>
      </AppLayout>
    );
  }
  
  if (!leaderboard) {
    return (
      <AppLayout currentTab="Leaderboard">
        <div className="text-center p-8">
          <p className="text-gray-400">Failed to load leaderboard data</p>
        </div>
      </AppLayout>
    );
  }
  
  // Filter leaderboard based on search and rank
  const filteredLeaderboard = leaderboard.filter(hunter => {
    const matchesSearch = searchQuery === "" || 
      hunter.username.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRank = rankFilter === "all" || hunter.rank === rankFilter;
    
    return matchesSearch && matchesRank;
  });
  
  // Find current user's position
  const currentUserPosition = leaderboard.findIndex(h => h.id === user?.id) + 1;
  
  // Get top 3 players for the podium
  const topThree = leaderboard.slice(0, 3);
  
  const renderPodium = () => {
    if (topThree.length === 0) return null;
    
    return (
      <div className="flex flex-col md:flex-row items-end justify-center gap-4 mb-10 mt-6">
        {/* Second Place */}
        {topThree.length > 1 && (
          <div className="flex flex-col items-center">
            <div className="mb-2">
              <div className="w-16 h-16 rounded-full bg-silver overflow-hidden border-4 border-gray-300 flex items-center justify-center">
                <span className="text-3xl font-bold text-white">{topThree[1].username[0].toUpperCase()}</span>
              </div>
            </div>
            <div className="text-center">
              <p className="font-bold text-white">{topThree[1].username}</p>
              <div className="flex items-center justify-center space-x-1">
                <RankBadge rank={topThree[1].rank} size="sm" />
                <p className="text-sm text-gray-400">{topThree[1].job}</p>
              </div>
              <p className="text-secondary font-medium">{topThree[1].totalXp.toLocaleString()} XP</p>
            </div>
            <div className="bg-primary-light bg-opacity-70 h-24 w-20 rounded-t-md mt-2 flex items-center justify-center">
              <Medal className="h-8 w-8 text-gray-300" />
            </div>
          </div>
        )}
        
        {/* First Place */}
        <div className="flex flex-col items-center">
          <div className="mb-2">
            <div className="w-20 h-20 rounded-full bg-gold overflow-hidden border-4 border-yellow-500 flex items-center justify-center">
              <span className="text-4xl font-bold text-white">{topThree[0].username[0].toUpperCase()}</span>
            </div>
          </div>
          <div className="text-center">
            <p className="font-bold text-white text-lg">{topThree[0].username}</p>
            <div className="flex items-center justify-center space-x-1">
              <RankBadge rank={topThree[0].rank} size="sm" />
              <p className="text-sm text-gray-400">{topThree[0].job}</p>
            </div>
            <p className="text-secondary font-medium">{topThree[0].totalXp.toLocaleString()} XP</p>
          </div>
          <div className="bg-primary-light bg-opacity-70 h-32 w-24 rounded-t-md mt-2 flex items-center justify-center">
            <Trophy className="h-10 w-10 text-yellow-500" />
          </div>
        </div>
        
        {/* Third Place */}
        {topThree.length > 2 && (
          <div className="flex flex-col items-center">
            <div className="mb-2">
              <div className="w-14 h-14 rounded-full bg-bronze overflow-hidden border-4 border-amber-700 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">{topThree[2].username[0].toUpperCase()}</span>
              </div>
            </div>
            <div className="text-center">
              <p className="font-bold text-white">{topThree[2].username}</p>
              <div className="flex items-center justify-center space-x-1">
                <RankBadge rank={topThree[2].rank} size="sm" />
                <p className="text-sm text-gray-400">{topThree[2].job}</p>
              </div>
              <p className="text-secondary font-medium">{topThree[2].totalXp.toLocaleString()} XP</p>
            </div>
            <div className="bg-primary-light bg-opacity-70 h-16 w-18 rounded-t-md mt-2 flex items-center justify-center">
              <Award className="h-6 w-6 text-amber-700" />
            </div>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <AppLayout currentTab="Leaderboard">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-6">Hunter Rankings</h2>
        
        {/* Stats Card */}
        {user && (
          <Card className="bg-gradient-to-r from-primary to-primary-dark border-gray-700 mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="mb-4 md:mb-0">
                  <h3 className="text-lg font-medium text-white mb-2">Your Ranking</h3>
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center overflow-hidden mr-3">
                      <span className="text-white font-bold">{user.username[0].toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="font-medium text-white">{user.username}</p>
                      <div className="flex items-center">
                        <RankBadge rank={user.rank} size="sm" className="mr-2" />
                        <p className="text-sm text-gray-400">{user.job}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-gray-400 mb-1">Current Position</p>
                  <div className="text-4xl font-bold text-secondary">#{currentUserPosition}</div>
                </div>
                <div className="text-center">
                  <p className="text-gray-400 mb-1">Total XP</p>
                  <div className="text-2xl font-bold text-white">
                    {leaderboard.find(h => h.id === user.id)?.totalXp.toLocaleString() || 0} XP
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-gray-400 mb-1">Current Level</p>
                  <div className="text-2xl font-bold text-white">Level {user.level}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Podium */}
        {renderPodium()}
        
        {/* Filter Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <div className="relative w-full md:w-64 mb-4 md:mb-0">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search hunters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-primary-dark border-gray-700"
            />
          </div>
          
          <Tabs defaultValue="all" value={rankFilter} onValueChange={setRankFilter}>
            <TabsList className="bg-primary-dark">
              <TabsTrigger value="all">All Ranks</TabsTrigger>
              <TabsTrigger value="E">E Rank</TabsTrigger>
              <TabsTrigger value="D">D Rank</TabsTrigger>
              <TabsTrigger value="C">C Rank</TabsTrigger>
              <TabsTrigger value="B">B Rank</TabsTrigger>
              <TabsTrigger value="A">A Rank</TabsTrigger>
              <TabsTrigger value="S">S Rank</TabsTrigger>
              <TabsTrigger value="SS">SS Rank</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        {/* Leaderboard Table */}
        <div className="bg-primary-dark rounded-lg overflow-hidden">
          <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-700 font-medium text-gray-400">
            <div className="col-span-1">Rank</div>
            <div className="col-span-5">Hunter</div>
            <div className="col-span-2 text-center">Level</div>
            <div className="col-span-2 text-center">Hunter Rank</div>
            <div className="col-span-2 text-right">Total XP</div>
          </div>
          
          <div className="divide-y divide-gray-700">
            {filteredLeaderboard.length === 0 ? (
              <div className="p-6 text-center text-gray-400">
                No hunters found matching your filters
              </div>
            ) : (
              filteredLeaderboard.map((hunter, index) => {
                const isCurrentUser = hunter.id === user?.id;
                const position = leaderboard.findIndex(h => h.id === hunter.id) + 1;
                
                // Generate a deterministic color for each user
                const colors = ["bg-secondary", "bg-accent", "bg-green-500", "bg-blue-500", "bg-purple-500"];
                const colorIndex = hunter.id % colors.length;
                const bgColor = colors[colorIndex];
                
                return (
                  <div 
                    key={hunter.id} 
                    className={`grid grid-cols-12 gap-4 p-4 ${isCurrentUser ? 'bg-secondary bg-opacity-10' : 'hover:bg-primary-light hover:bg-opacity-30'} transition-colors`}
                  >
                    <div className="col-span-1 flex items-center">
                      {position <= 3 ? (
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          position === 1 ? 'bg-yellow-500' : position === 2 ? 'bg-gray-300' : 'bg-amber-700'
                        }`}>
                          <span className="font-bold text-primary-dark">{position}</span>
                        </div>
                      ) : (
                        <span className={`font-medium ${isCurrentUser ? 'text-secondary' : 'text-gray-400'}`}>{position}</span>
                      )}
                    </div>
                    <div className="col-span-5 flex items-center">
                      <div className={`w-8 h-8 rounded-full ${bgColor} flex items-center justify-center overflow-hidden mr-3`}>
                        <span className="text-white font-bold">{hunter.username[0].toUpperCase()}</span>
                      </div>
                      <div>
                        <p className={`font-medium ${isCurrentUser ? 'text-white' : 'text-gray-200'}`}>{hunter.username}</p>
                        <p className="text-sm text-gray-400">{hunter.job}</p>
                      </div>
                    </div>
                    <div className="col-span-2 flex items-center justify-center">
                      <span className={`font-medium ${isCurrentUser ? 'text-white' : 'text-gray-300'}`}>Level {hunter.level}</span>
                    </div>
                    <div className="col-span-2 flex items-center justify-center">
                      <RankBadge rank={hunter.rank} size="sm" />
                    </div>
                    <div className="col-span-2 flex items-center justify-end">
                      <span className="font-bold text-secondary">{hunter.totalXp.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
