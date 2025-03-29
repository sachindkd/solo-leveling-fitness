import React from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Shield } from "lucide-react";

interface NavigationProps {
  currentTab: string;
}

export default function Navigation({ currentTab }: NavigationProps) {
  const [location] = useLocation();
  const { user } = useAuth();
  
  const tabs = [
    { name: "Dashboard", path: "/" },
    { name: "Training", path: "/training" },
    { name: "Quests", path: "/quests" },
    { name: "Jobs", path: "/jobs" },
    { name: "Shop", path: "/shop" },
    { name: "Leaderboard", path: "/leaderboard" },
  ];
  
  return (
    <nav className="bg-primary border-b border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex -mb-px overflow-x-auto hide-scrollbar justify-between">
          <div className="flex">
            {tabs.map((tab) => {
              const isActive = tab.path === location;
              return (
                <Link key={tab.name} href={tab.path}>
                  <div className={`nav-tab px-4 py-4 font-medium cursor-pointer ${
                    isActive ? "active text-white" : "text-gray-400 hover:text-gray-300"
                  }`}>
                    <span>{tab.name}</span>
                  </div>
                </Link>
              );
            })}
          </div>
          
          {user?.isAdmin && (
            <div>
              <Link href="/architect">
                <div className={`nav-tab px-4 py-4 font-medium flex items-center cursor-pointer ${
                  location === "/architect" ? "active text-secondary" : "text-secondary text-opacity-70 hover:text-opacity-100"
                }`}>
                  <Shield className="h-4 w-4 mr-1" />
                  <span>Architect</span>
                </div>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
