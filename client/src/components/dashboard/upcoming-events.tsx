import React from "react";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Event } from "@shared/schema";

export default function UpcomingEvents() {
  const { data: events, isLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  if (isLoading) {
    return (
      <div className="card p-6">
        <h3 className="text-xl font-bold font-sans text-white mb-4">Upcoming Events</h3>
        <div className="h-24 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
        </div>
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="card p-6">
        <h3 className="text-xl font-bold font-sans text-white mb-4">Upcoming Events</h3>
        <div className="bg-primary-dark bg-opacity-60 p-4 rounded-md text-center">
          <p className="text-gray-400">No upcoming events</p>
        </div>
      </div>
    );
  }

  // Sort events by start date and take first 2
  const upcomingEvents = [...events]
    .filter(event => new Date(event.startDate) > new Date())
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 2);

  if (upcomingEvents.length === 0) {
    return (
      <div className="card p-6">
        <h3 className="text-xl font-bold font-sans text-white mb-4">Upcoming Events</h3>
        <div className="bg-primary-dark bg-opacity-60 p-4 rounded-md text-center">
          <p className="text-gray-400">No upcoming events</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <h3 className="text-xl font-bold font-sans text-white mb-4">Upcoming Events</h3>
      
      <div className="space-y-3">
        {upcomingEvents.map(event => {
          const startDate = new Date(event.startDate);
          const timeUntil = formatDistanceToNow(startDate, { addSuffix: false });
          
          // Determine border color based on type
          let borderColor = "border-secondary";
          let textColor = "text-secondary";
          
          if (event.type === "rankup") {
            borderColor = "border-accent";
            textColor = "text-accent";
          } else if (event.type === "doublexp") {
            borderColor = "border-secondary";
            textColor = "text-secondary";
          }
          
          return (
            <div 
              key={event.id}
              className={`bg-primary-dark bg-opacity-60 p-3 rounded-md border-l-4 ${borderColor}`}
            >
              <div className="font-medium text-white mb-1">{event.title}</div>
              <div className="text-sm text-gray-400 mb-2">{event.description}</div>
              <div className={`flex items-center text-xs ${textColor}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Starts in {timeUntil}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
