import React from "react";
import Header from "./header";
import Navigation from "./navigation";

interface AppLayoutProps {
  children: React.ReactNode;
  currentTab: string;
}

export default function AppLayout({ children, currentTab }: AppLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-primary-dark">
      <Header />
      <Navigation currentTab={currentTab} />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-6">
          {children}
        </div>
      </main>
    </div>
  );
}
