import React, { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { PlayCircle, ChevronDown, LogOut, Settings, User as UserIcon, HelpCircle } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const { user, logoutMutation } = useAuth();
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  const firstLetter = user?.username ? user.username[0].toUpperCase() : "U";
  
  return (
    <header className="bg-primary-dark shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <PlayCircle className="h-8 w-8 text-secondary" />
          <h1 className="text-xl font-bold font-sans tracking-wider text-white">RISE UP</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium text-accent">{user?.coins || 0}</span>
            </div>
            <div className="h-6 border-l border-gray-600"></div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center space-x-2 cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                <span className="text-white font-bold">{firstLetter}</span>
              </div>
              <span className="font-medium hidden md:inline text-white">{user?.username}</span>
              <ChevronDown className="h-5 w-5 text-gray-400" />
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end" className="w-48 bg-primary border border-gray-700">
              <DropdownMenuItem className="text-sm text-gray-300 hover:bg-primary-light cursor-pointer">
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-sm text-gray-300 hover:bg-primary-light cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-sm text-gray-300 hover:bg-primary-light cursor-pointer">
                <HelpCircle className="mr-2 h-4 w-4" />
                <span>Help</span>
              </DropdownMenuItem>
              
              {user?.isAdmin && (
                <>
                  <DropdownMenuSeparator className="bg-gray-700" />
                  <Link href="/admin">
                    <DropdownMenuItem className="text-sm text-secondary hover:bg-primary-light cursor-pointer">
                      <span>Admin Panel</span>
                    </DropdownMenuItem>
                  </Link>
                </>
              )}
              
              <DropdownMenuSeparator className="bg-gray-700" />
              <DropdownMenuItem 
                className="text-sm text-gray-300 hover:bg-primary-light cursor-pointer"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
