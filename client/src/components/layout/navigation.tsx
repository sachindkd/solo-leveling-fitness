import React from "react";
import { Link, useLocation } from "wouter";

interface NavigationProps {
  currentTab: string;
}

export default function Navigation({ currentTab }: NavigationProps) {
  const [location] = useLocation();
  
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
        <div className="flex -mb-px overflow-x-auto hide-scrollbar">
          {tabs.map((tab) => {
            const isActive = tab.path === location;
            return (
              <Link key={tab.name} href={tab.path}>
                <a className={`nav-tab px-4 py-4 font-medium ${
                  isActive ? "active text-white" : "text-gray-400 hover:text-gray-300"
                }`}>
                  <span>{tab.name}</span>
                </a>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
