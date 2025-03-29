import React, { useState } from "react";
import AppLayout from "@/components/layout/app-layout";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";

// Date handling helper functions
const safeToISOString = (date: Date | string | null | undefined): string => {
  try {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return '';
    return dateObj.toISOString().slice(0, 16);
  } catch {
    return '';
  }
};

const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>, onChange: (date: Date) => void) => {
  try {
    const date = new Date(e.target.value);
    if (!isNaN(date.getTime())) {
      onChange(date);
    }
  } catch (error) {
    console.error("Invalid date:", error);
  }
};

const formatDate = (date: string | Date): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return 'Invalid date';
    return format(dateObj, "MMM d, yyyy HH:mm");
  } catch {
    return 'Invalid date';
  }
};

const calculateDuration = (startDate: string | Date, endDate: string | Date): string => {
  try {
    const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
    const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 'Invalid duration';
    
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return `${days} days`;
  } catch {
    return 'Invalid duration';
  }
};

const getEventStatus = (startDate: string | Date, endDate: string | Date): JSX.Element => {
  try {
    const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
    const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
    const now = new Date();
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return <span className="text-gray-400">Unknown</span>;
    }
    
    if (now < start) {
      return <span className="text-blue-400">Upcoming</span>;
    } else if (now > end) {
      return <span className="text-red-400">Ended</span>;
    } else {
      return <span className="text-green-400">Active</span>;
    }
  } catch {
    return <span className="text-gray-400">Unknown</span>;
  }
};
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger, 
  DialogClose 
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { RankBadge } from "@/components/ui/rank-badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertQuestSchema, insertWorkoutSchema, insertShopItemSchema, insertEventSchema, STATS, RANKS, JOBS } from "@shared/schema";
import { STAT_NAMES, RANK_DESCRIPTION } from "@/lib/constants";
import { 
  Users, 
  ClipboardList, 
  Dumbbell, 
  ShoppingBag, 
  Calendar, 
  PlusCircle, 
  Trash2, 
  Edit, 
  Search, 
  AlertTriangle, 
  Loader2, 
  Award,
  ShieldAlert,
  Trophy,
  Star,
  Info as InfoIcon
} from "lucide-react";

export default function AdminPanel() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("users");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{id: number, type: string} | null>(null);

  // Fetch users data
  const { data: users, isLoading: loadingUsers } = useQuery({
    queryKey: ["/api/users"],
    enabled: activeTab === "users"
  });

  // Fetch quests data
  const { data: quests, isLoading: loadingQuests } = useQuery({
    queryKey: ["/api/quests"],
    enabled: activeTab === "quests"
  });

  // Fetch workouts data
  const { data: workouts, isLoading: loadingWorkouts } = useQuery({
    queryKey: ["/api/workouts"],
    enabled: activeTab === "workouts"
  });

  // Fetch shop items data
  const { data: shopItems, isLoading: loadingShopItems } = useQuery({
    queryKey: ["/api/shop-items"],
    enabled: activeTab === "shop"
  });

  // Fetch events data
  const { data: events, isLoading: loadingEvents } = useQuery({
    queryKey: ["/api/events"],
    enabled: activeTab === "events"
  });

  // Query data loading state
  const isLoading = 
    (activeTab === "users" && loadingUsers) ||
    (activeTab === "quests" && loadingQuests) ||
    (activeTab === "workouts" && loadingWorkouts) ||
    (activeTab === "shop" && loadingShopItems) ||
    (activeTab === "events" && loadingEvents);

  // Create Forms with Zod validation
  // Quest Form
  const questForm = useForm<z.infer<typeof insertQuestSchema>>({
    resolver: zodResolver(insertQuestSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "daily",
      xpReward: 50,
      coinReward: 100,
      targetStat: "strength",
      requiredAmount: 5,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    }
  });

  // Workout Form (with schema containing nested exercises)
  const workoutSchema = insertWorkoutSchema.extend({
    exercises: z.array(
      z.object({
        name: z.string().min(1, "Exercise name is required"),
        sets: z.number().min(1, "At least 1 set required"),
        reps: z.string().min(1, "Reps are required")
      })
    )
  });

  const workoutForm = useForm<z.infer<typeof workoutSchema>>({
    resolver: zodResolver(workoutSchema),
    defaultValues: {
      title: "",
      description: "",
      exercises: [{ name: "", sets: 3, reps: "10" }],
      targetStat: "strength",
      targetRank: "E",
      targetJob: "Novice Hunter"
    }
  });

  // Shop Item Form
  const shopItemForm = useForm<z.infer<typeof insertShopItemSchema>>({
    resolver: zodResolver(insertShopItemSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 100,
      type: "booster",
      effectValue: 0
    }
  });

  // Event Form
  const eventForm = useForm<z.infer<typeof insertEventSchema>>({
    resolver: zodResolver(insertEventSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "rankup"
    }
  });

  // User Form (for editing users)
  const userFormSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    rank: z.string(),
    job: z.string(),
    level: z.number().min(1, "Level must be at least 1"),
    xp: z.number().min(0, "XP cannot be negative"),
    coins: z.number().min(0, "Coins cannot be negative"),
    stats: z.object({
      strength: z.number().min(1, "Strength must be at least 1").max(100, "Strength cannot exceed 100"),
      stamina: z.number().min(1, "Stamina must be at least 1").max(100, "Stamina cannot exceed 100"),
      speed: z.number().min(1, "Speed must be at least 1").max(100, "Speed cannot exceed 100"),
      endurance: z.number().min(1, "Endurance must be at least 1").max(100, "Endurance cannot exceed 100")
    })
  });

  const userForm = useForm<z.infer<typeof userFormSchema>>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: "",
      rank: "E",
      job: "Novice Hunter",
      level: 1,
      xp: 0,
      coins: 100,
      stats: {
        strength: 10,
        stamina: 10,
        speed: 10,
        endurance: 10
      }
    }
  });

  // Mutations
  // Create mutations
  const createQuestMutation = useMutation({
    mutationFn: async (data: z.infer<typeof insertQuestSchema>) => {
      return (await apiRequest("POST", "/api/quests", data)).json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quests"] });
      toast({
        title: "Quest created",
        description: "The quest has been created successfully.",
      });
      questForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create quest",
        description: error.message || "An error occurred",
        variant: "destructive"
      });
    }
  });

  const createWorkoutMutation = useMutation({
    mutationFn: async (data: z.infer<typeof workoutSchema>) => {
      return (await apiRequest("POST", "/api/workouts", data)).json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workouts"] });
      toast({
        title: "Workout created",
        description: "The workout has been created successfully.",
      });
      workoutForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create workout",
        description: error.message || "An error occurred",
        variant: "destructive"
      });
    }
  });

  const createShopItemMutation = useMutation({
    mutationFn: async (data: z.infer<typeof insertShopItemSchema>) => {
      return (await apiRequest("POST", "/api/shop-items", data)).json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shop-items"] });
      toast({
        title: "Shop item created",
        description: "The shop item has been created successfully.",
      });
      shopItemForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create shop item",
        description: error.message || "An error occurred",
        variant: "destructive"
      });
    }
  });

  const createEventMutation = useMutation({
    mutationFn: async (data: z.infer<typeof insertEventSchema>) => {
      return (await apiRequest("POST", "/api/events", data)).json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "Event created",
        description: "The event has been created successfully.",
      });
      eventForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create event",
        description: error.message || "An error occurred",
        variant: "destructive"
      });
    }
  });

  // Update mutations
  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: any }) => {
      return (await apiRequest("PATCH", `/api/users/${id}`, data)).json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "User updated",
        description: "The user has been updated successfully.",
      });
      setEditingItem(null);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update user",
        description: error.message || "An error occurred",
        variant: "destructive"
      });
    }
  });

  const updateQuestMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: any }) => {
      return (await apiRequest("PATCH", `/api/quests/${id}`, data)).json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quests"] });
      toast({
        title: "Quest updated",
        description: "The quest has been updated successfully.",
      });
      setEditingItem(null);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update quest",
        description: error.message || "An error occurred",
        variant: "destructive"
      });
    }
  });

  const updateWorkoutMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: any }) => {
      return (await apiRequest("PATCH", `/api/workouts/${id}`, data)).json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workouts"] });
      toast({
        title: "Workout updated",
        description: "The workout has been updated successfully.",
      });
      setEditingItem(null);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update workout",
        description: error.message || "An error occurred",
        variant: "destructive"
      });
    }
  });

  const updateShopItemMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: any }) => {
      return (await apiRequest("PATCH", `/api/shop-items/${id}`, data)).json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shop-items"] });
      toast({
        title: "Shop item updated",
        description: "The shop item has been updated successfully.",
      });
      setEditingItem(null);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update shop item",
        description: error.message || "An error occurred",
        variant: "destructive"
      });
    }
  });

  const updateEventMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: any }) => {
      return (await apiRequest("PATCH", `/api/events/${id}`, data)).json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "Event updated",
        description: "The event has been updated successfully.",
      });
      setEditingItem(null);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update event",
        description: error.message || "An error occurred",
        variant: "destructive"
      });
    }
  });

  // Delete mutations
  const deleteUserMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "User deleted",
        description: "The user has been deleted successfully.",
      });
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete user",
        description: error.message || "An error occurred",
        variant: "destructive"
      });
    }
  });

  const deleteQuestMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/quests/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quests"] });
      toast({
        title: "Quest deleted",
        description: "The quest has been deleted successfully.",
      });
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete quest",
        description: error.message || "An error occurred",
        variant: "destructive"
      });
    }
  });

  const deleteWorkoutMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/workouts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workouts"] });
      toast({
        title: "Workout deleted",
        description: "The workout has been deleted successfully.",
      });
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete workout",
        description: error.message || "An error occurred",
        variant: "destructive"
      });
    }
  });

  const deleteShopItemMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/shop-items/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shop-items"] });
      toast({
        title: "Shop item deleted",
        description: "The shop item has been deleted successfully.",
      });
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete shop item",
        description: error.message || "An error occurred",
        variant: "destructive"
      });
    }
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/events/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "Event deleted",
        description: "The event has been deleted successfully.",
      });
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete event",
        description: error.message || "An error occurred",
        variant: "destructive"
      });
    }
  });

  // Form submission handlers
  const onSubmitQuest = (data: z.infer<typeof insertQuestSchema>) => {
    if (editingItem) {
      updateQuestMutation.mutate({ id: editingItem.id, data });
    } else {
      createQuestMutation.mutate(data);
    }
  };

  const onSubmitWorkout = (data: z.infer<typeof workoutSchema>) => {
    if (editingItem) {
      updateWorkoutMutation.mutate({ id: editingItem.id, data });
    } else {
      createWorkoutMutation.mutate(data);
    }
  };

  const onSubmitShopItem = (data: z.infer<typeof insertShopItemSchema>) => {
    if (editingItem) {
      updateShopItemMutation.mutate({ id: editingItem.id, data });
    } else {
      createShopItemMutation.mutate(data);
    }
  };

  const onSubmitEvent = (data: z.infer<typeof insertEventSchema>) => {
    if (editingItem) {
      updateEventMutation.mutate({ id: editingItem.id, data });
    } else {
      createEventMutation.mutate(data);
    }
  };

  const onSubmitUser = (data: z.infer<typeof userFormSchema>) => {
    if (editingItem) {
      updateUserMutation.mutate({ id: editingItem.id, data });
    }
  };

  // Helper for handling delete
  const handleDelete = () => {
    if (!itemToDelete) return;

    const { id, type } = itemToDelete;
    
    switch (type) {
      case "user":
        deleteUserMutation.mutate(id);
        break;
      case "quest":
        deleteQuestMutation.mutate(id);
        break;
      case "workout":
        deleteWorkoutMutation.mutate(id);
        break;
      case "shopItem":
        deleteShopItemMutation.mutate(id);
        break;
      case "event":
        deleteEventMutation.mutate(id);
        break;
    }
  };

  // Helper for editing items
  const handleEdit = (item: any, type: string) => {
    setEditingItem(item);
    
    switch (type) {
      case "user":
        userForm.reset({
          username: item.username,
          rank: item.rank,
          job: item.job,
          level: item.level,
          xp: item.xp,
          coins: item.coins,
          stats: {
            strength: item.stats.strength,
            stamina: item.stats.stamina,
            speed: item.stats.speed,
            endurance: item.stats.endurance
          }
        });
        break;
      case "quest":
        questForm.reset({
          title: item.title,
          description: item.description,
          type: item.type,
          xpReward: item.xpReward,
          coinReward: item.coinReward,
          targetStat: item.targetStat,
          requiredAmount: item.requiredAmount,
          expiresAt: new Date(item.expiresAt)
        });
        break;
      case "workout":
        workoutForm.reset({
          title: item.title,
          description: item.description,
          exercises: item.exercises,
          targetStat: item.targetStat,
          targetRank: item.targetRank,
          targetJob: item.targetJob
        });
        break;
      case "shopItem":
        shopItemForm.reset({
          name: item.name,
          description: item.description,
          price: item.price,
          type: item.type,
          effectValue: item.effectValue
        });
        break;
      case "event":
        eventForm.reset({
          title: item.title,
          description: item.description,
          type: item.type
        });
        break;
    }
  };

  // Filter data based on search
  const filteredData = () => {
    if (!searchQuery) return activeTab === "users" ? users : 
                            activeTab === "quests" ? quests : 
                            activeTab === "workouts" ? workouts : 
                            activeTab === "shop" ? shopItems : 
                            events;

    const query = searchQuery.toLowerCase();

    switch (activeTab) {
      case "users":
        return users?.filter((user: any) => 
          user.username.toLowerCase().includes(query) ||
          user.rank.toLowerCase().includes(query) ||
          user.job.toLowerCase().includes(query)
        );
      case "quests":
        return quests?.filter((quest: any) => 
          quest.title.toLowerCase().includes(query) ||
          quest.description.toLowerCase().includes(query) ||
          quest.targetStat.toLowerCase().includes(query)
        );
      case "workouts":
        return workouts?.filter((workout: any) => 
          workout.title.toLowerCase().includes(query) ||
          workout.description.toLowerCase().includes(query) ||
          workout.targetStat.toLowerCase().includes(query) ||
          workout.targetRank.toLowerCase().includes(query) ||
          workout.targetJob.toLowerCase().includes(query)
        );
      case "shop":
        return shopItems?.filter((item: any) => 
          item.name.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.type.toLowerCase().includes(query)
        );
      case "events":
        return events?.filter((event: any) => 
          event.title.toLowerCase().includes(query) ||
          event.description.toLowerCase().includes(query) ||
          event.type.toLowerCase().includes(query)
        );
      default:
        return [];
    }
  };

  // Workout form specific helpers
  const addExercise = () => {
    const currentExercises = workoutForm.getValues().exercises || [];
    workoutForm.setValue("exercises", [
      ...currentExercises,
      { name: "", sets: 3, reps: "10" }
    ]);
  };

  const removeExercise = (index: number) => {
    const currentExercises = workoutForm.getValues().exercises || [];
    if (currentExercises.length <= 1) return;
    
    workoutForm.setValue("exercises", 
      currentExercises.filter((_, i) => i !== index)
    );
  };

  // Render functions for each tab
  const renderUsersTab = () => {
    const filteredUsers = filteredData();
    
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">Manage Users</h3>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-primary-dark border-gray-700"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-secondary" />
          </div>
        ) : !filteredUsers || filteredUsers.length === 0 ? (
          <div className="bg-primary-dark p-6 rounded-lg text-center">
            <AlertTriangle className="h-8 w-8 text-warning mx-auto mb-2" />
            <p className="text-gray-400">No users found</p>
          </div>
        ) : (
          <div className="bg-primary-dark rounded-lg overflow-hidden">
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-700 font-medium text-gray-400">
              <div className="col-span-3">Username</div>
              <div className="col-span-2">Rank / Job</div>
              <div className="col-span-1 text-center">Level</div>
              <div className="col-span-1 text-center">XP</div>
              <div className="col-span-1 text-center">Coins</div>
              <div className="col-span-2 text-center">Stats</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>
            
            <div className="divide-y divide-gray-700">
              {filteredUsers.map((user: any) => (
                <div key={user.id} className="grid grid-cols-12 gap-4 p-4 hover:bg-primary-light hover:bg-opacity-30 transition-colors">
                  <div className="col-span-3 flex items-center">
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center overflow-hidden mr-3">
                      <span className="text-white font-bold">{user.username[0].toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="font-medium text-white">{user.username}</p>
                      <p className="text-xs text-gray-400">{user.isAdmin ? "Admin" : "User"}</p>
                    </div>
                  </div>
                  <div className="col-span-2 flex items-center">
                    <RankBadge rank={user.rank} size="sm" className="mr-2" />
                    <span className="text-sm text-gray-300">{user.job}</span>
                  </div>
                  <div className="col-span-1 text-center flex items-center justify-center">
                    <span className="text-white">{user.level}</span>
                  </div>
                  <div className="col-span-1 text-center flex items-center justify-center">
                    <span className="text-secondary">{user.xp}</span>
                  </div>
                  <div className="col-span-1 text-center flex items-center justify-center">
                    <span className="text-accent">{user.coins}</span>
                  </div>
                  <div className="col-span-2 text-center flex items-center justify-center space-x-2">
                    <div className="text-xs text-red-500">S:{user.stats.strength}</div>
                    <div className="text-xs text-green-500">St:{user.stats.stamina}</div>
                    <div className="text-xs text-blue-500">Sp:{user.stats.speed}</div>
                    <div className="text-xs text-purple-500">E:{user.stats.endurance}</div>
                  </div>
                  <div className="col-span-2 flex items-center justify-end space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEdit(user, "user")}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-primary border-gray-700">
                        <DialogHeader>
                          <DialogTitle className="text-white">Edit User</DialogTitle>
                          <DialogDescription>
                            Update user information and stats
                          </DialogDescription>
                        </DialogHeader>
                        
                        <Form {...userForm}>
                          <form onSubmit={userForm.handleSubmit(onSubmitUser)} className="space-y-4">
                            <FormField
                              control={userForm.control}
                              name="username"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Username</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={userForm.control}
                                name="rank"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Rank</FormLabel>
                                    <Select
                                      onValueChange={field.onChange}
                                      defaultValue={field.value}
                                    >
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select rank" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent className="bg-primary border-gray-700">
                                        {RANKS.map((rank) => (
                                          <SelectItem key={rank} value={rank}>
                                            <div className="flex items-center">
                                              <RankBadge rank={rank} size="sm" className="mr-2" />
                                              <span>{rank}-Rank</span>
                                            </div>
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={userForm.control}
                                name="job"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Job</FormLabel>
                                    <Select
                                      onValueChange={field.onChange}
                                      defaultValue={field.value}
                                    >
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select job" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent className="bg-primary border-gray-700">
                                        {JOBS.map((job) => (
                                          <SelectItem key={job} value={job}>
                                            {job}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={userForm.control}
                                name="level"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Level</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="number" 
                                        {...field} 
                                        onChange={(e) => field.onChange(parseInt(e.target.value))} 
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={userForm.control}
                                name="xp"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>XP</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="number" 
                                        {...field} 
                                        onChange={(e) => field.onChange(parseInt(e.target.value))} 
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            
                            <FormField
                              control={userForm.control}
                              name="coins"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Coins</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      {...field} 
                                      onChange={(e) => field.onChange(parseInt(e.target.value))} 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <div>
                              <h4 className="text-sm font-medium mb-2">Stats</h4>
                              <div className="grid grid-cols-2 gap-4">
                                {STATS.map(stat => (
                                  <FormField
                                    key={stat}
                                    control={userForm.control}
                                    name={`stats.${stat}` as any}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>{STAT_NAMES[stat as keyof typeof STAT_NAMES]}</FormLabel>
                                        <FormControl>
                                          <Input 
                                            type="number" 
                                            {...field} 
                                            onChange={(e) => field.onChange(parseInt(e.target.value))} 
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                ))}
                              </div>
                            </div>
                            
                            <DialogFooter>
                              <Button 
                                type="submit" 
                                disabled={updateUserMutation.isPending}
                              >
                                {updateUserMutation.isPending ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Updating...
                                  </>
                                ) : "Update User"}
                              </Button>
                            </DialogFooter>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                    
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => {
                        setItemToDelete({ id: user.id, type: "user" });
                        setDeleteConfirmOpen(true);
                      }}
                      disabled={user.isAdmin} // Prevent deletion of admin users
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderQuestsTab = () => {
    const filteredQuests = filteredData();
    
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">Manage Quests</h3>
          <div className="flex space-x-4">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search quests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-primary-dark border-gray-700"
              />
            </div>

            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  onClick={() => {
                    setEditingItem(null);
                    questForm.reset({
                      title: "",
                      description: "",
                      type: "daily",
                      xpReward: 50,
                      coinReward: 100,
                      targetStat: "strength",
                      requiredAmount: 5,
                      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
                    });
                  }}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create Quest
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-primary border-gray-700">
                <DialogHeader>
                  <DialogTitle className="text-white">
                    {editingItem ? "Edit Quest" : "Create New Quest"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingItem ? "Update quest details" : "Add a new quest for hunters"}
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...questForm}>
                  <form onSubmit={questForm.handleSubmit(onSubmitQuest)} className="space-y-4">
                    <FormField
                      control={questForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Quest title" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={questForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Quest description" 
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={questForm.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Type</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-primary border-gray-700">
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={questForm.control}
                        name="targetStat"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Target Stat</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select stat" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-primary border-gray-700">
                                {STATS.map(stat => (
                                  <SelectItem key={stat} value={stat}>
                                    {STAT_NAMES[stat as keyof typeof STAT_NAMES]}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={questForm.control}
                        name="xpReward"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>XP Reward</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                {...field} 
                                onChange={(e) => field.onChange(parseInt(e.target.value))} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={questForm.control}
                        name="coinReward"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Coin Reward</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                {...field} 
                                onChange={(e) => field.onChange(parseInt(e.target.value))} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={questForm.control}
                      name="requiredAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Required Amount</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field} 
                              onChange={(e) => field.onChange(parseInt(e.target.value))} 
                            />
                          </FormControl>
                          <FormDescription>
                            The amount of activities needed to complete this quest
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={questForm.control}
                      name="expiresAt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expires At</FormLabel>
                          <FormControl>
                            <Input 
                              type="datetime-local" 
                              {...field} 
                              value={field.value ? new Date(field.value).toISOString().slice(0, 16) : ''}
                              onChange={(e) => field.onChange(new Date(e.target.value))} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <DialogFooter>
                      <Button 
                        type="submit" 
                        disabled={createQuestMutation.isPending || updateQuestMutation.isPending}
                      >
                        {(createQuestMutation.isPending || updateQuestMutation.isPending) ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            {editingItem ? "Updating..." : "Creating..."}
                          </>
                        ) : editingItem ? "Update Quest" : "Create Quest"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-secondary" />
          </div>
        ) : !filteredQuests || filteredQuests.length === 0 ? (
          <div className="bg-primary-dark p-6 rounded-lg text-center">
            <AlertTriangle className="h-8 w-8 text-warning mx-auto mb-2" />
            <p className="text-gray-400">No quests found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredQuests.map((quest: any) => (
              <Card key={quest.id} className="bg-primary-dark border-gray-700">
                <CardHeader>
                  <div className="flex justify-between">
                    <div>
                      <div className="flex items-center mb-2">
                        <span className={`px-2 py-1 text-xs font-medium text-white mr-2 rounded ${
                          quest.type === 'daily' ? 'bg-secondary-dark' : 'bg-accent-dark'
                        }`}>
                          {quest.type === 'daily' ? 'Daily' : 'Weekly'}
                        </span>
                        <CardTitle className="text-lg text-white">{quest.title}</CardTitle>
                      </div>
                      <CardDescription>{quest.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Target Stat:</span>
                      <span className="text-white">{STAT_NAMES[quest.targetStat as keyof typeof STAT_NAMES]}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Required Amount:</span>
                      <span className="text-white">{quest.requiredAmount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">XP Reward:</span>
                      <span className="text-secondary">+{quest.xpReward} XP</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Coin Reward:</span>
                      <span className="text-accent">+{quest.coinReward} coins</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Expires:</span>
                      <span className="text-white">{format(new Date(quest.expiresAt), "MMM d, yyyy HH:mm")}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end space-x-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleEdit(quest, "quest")}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                  
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => {
                      setItemToDelete({ id: quest.id, type: "quest" });
                      setDeleteConfirmOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderWorkoutsTab = () => {
    const filteredWorkouts = filteredData();
    
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">Manage Workouts</h3>
          <div className="flex space-x-4">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search workouts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-primary-dark border-gray-700"
              />
            </div>

            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  onClick={() => {
                    setEditingItem(null);
                    workoutForm.reset({
                      title: "",
                      description: "",
                      exercises: [{ name: "", sets: 3, reps: "10" }],
                      targetStat: "strength",
                      targetRank: "E",
                      targetJob: "Novice Hunter"
                    });
                  }}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create Workout
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-primary border-gray-700 max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-white">
                    {editingItem ? "Edit Workout" : "Create New Workout"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingItem ? "Update workout details" : "Add a new workout for hunters"}
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...workoutForm}>
                  <form onSubmit={workoutForm.handleSubmit(onSubmitWorkout)} className="space-y-4">
                    <FormField
                      control={workoutForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Workout title" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={workoutForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Workout description" 
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={workoutForm.control}
                        name="targetStat"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Target Stat</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select stat" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-primary border-gray-700">
                                {STATS.map(stat => (
                                  <SelectItem key={stat} value={stat}>
                                    {STAT_NAMES[stat as keyof typeof STAT_NAMES]}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={workoutForm.control}
                        name="targetRank"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Target Rank</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select rank" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-primary border-gray-700">
                                {RANKS.map(rank => (
                                  <SelectItem key={rank} value={rank}>
                                    {rank}-Rank
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={workoutForm.control}
                        name="targetJob"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Target Job</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select job" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-primary border-gray-700">
                                {JOBS.map(job => (
                                  <SelectItem key={job} value={job}>
                                    {job}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-medium">Exercises</h4>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={addExercise}
                        >
                          <PlusCircle className="h-4 w-4 mr-2" />
                          Add Exercise
                        </Button>
                      </div>
                      
                      {workoutForm.watch("exercises")?.map((_, index) => (
                        <div key={index} className="border border-gray-700 rounded-md p-4 space-y-3">
                          <div className="flex justify-between items-center">
                            <h5 className="text-sm font-medium">Exercise {index + 1}</h5>
                            <Button 
                              type="button" 
                              variant="destructive" 
                              size="sm"
                              onClick={() => removeExercise(index)}
                              disabled={workoutForm.watch("exercises")?.length <= 1}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4">
                            <FormField
                              control={workoutForm.control}
                              name={`exercises.${index}.name`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Exercise name" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={workoutForm.control}
                              name={`exercises.${index}.sets`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Sets</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      {...field} 
                                      onChange={(e) => field.onChange(parseInt(e.target.value))} 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={workoutForm.control}
                              name={`exercises.${index}.reps`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Reps</FormLabel>
                                  <FormControl>
                                    <Input placeholder="e.g. 10 or 30s" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <DialogFooter>
                      <Button 
                        type="submit" 
                        disabled={createWorkoutMutation.isPending || updateWorkoutMutation.isPending}
                      >
                        {(createWorkoutMutation.isPending || updateWorkoutMutation.isPending) ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            {editingItem ? "Updating..." : "Creating..."}
                          </>
                        ) : editingItem ? "Update Workout" : "Create Workout"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-secondary" />
          </div>
        ) : !filteredWorkouts || filteredWorkouts.length === 0 ? (
          <div className="bg-primary-dark p-6 rounded-lg text-center">
            <AlertTriangle className="h-8 w-8 text-warning mx-auto mb-2" />
            <p className="text-gray-400">No workouts found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredWorkouts.map((workout: any) => (
              <Card key={workout.id} className="bg-primary-dark border-gray-700">
                <CardHeader>
                  <div className="flex justify-between">
                    <div>
                      <CardTitle className="text-lg text-white">{workout.title}</CardTitle>
                      <CardDescription>{workout.description}</CardDescription>
                    </div>
                    <div className="flex items-center space-x-1">
                      <RankBadge rank={workout.targetRank} size="sm" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-white mb-2">Target Info</h4>
                      <div className="grid grid-cols-3 gap-2 bg-primary-light bg-opacity-20 rounded-md p-2">
                        <div className="text-center">
                          <div className="text-xs text-gray-400">Stat</div>
                          <div className="text-sm text-white">{STAT_NAMES[workout.targetStat as keyof typeof STAT_NAMES]}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-gray-400">Rank</div>
                          <div className="text-sm text-white">{workout.targetRank}-Rank</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-gray-400">Job</div>
                          <div className="text-sm text-white truncate">{workout.targetJob}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-white mb-2">Exercises ({workout.exercises.length})</h4>
                      <div className="space-y-2">
                        {workout.exercises.slice(0, 3).map((exercise: any, i: number) => (
                          <div key={i} className="flex justify-between items-center text-sm">
                            <span className="text-white">{exercise.name}</span>
                            <span className="text-gray-400">{exercise.sets} × {exercise.reps}</span>
                          </div>
                        ))}
                        {workout.exercises.length > 3 && (
                          <div className="text-xs text-gray-500">+ {workout.exercises.length - 3} more exercises</div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end space-x-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleEdit(workout, "workout")}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                  
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => {
                      setItemToDelete({ id: workout.id, type: "workout" });
                      setDeleteConfirmOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderShopTab = () => {
    const filteredItems = filteredData();
    
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">Manage Shop Items</h3>
          <div className="flex space-x-4">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-primary-dark border-gray-700"
              />
            </div>

            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  onClick={() => {
                    setEditingItem(null);
                    shopItemForm.reset({
                      name: "",
                      description: "",
                      price: 100,
                      type: "booster",
                      effectValue: 0
                    });
                  }}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create Item
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-primary border-gray-700">
                <DialogHeader>
                  <DialogTitle className="text-white">
                    {editingItem ? "Edit Shop Item" : "Create New Shop Item"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingItem ? "Update shop item details" : "Add a new item to the shop"}
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...shopItemForm}>
                  <form onSubmit={shopItemForm.handleSubmit(onSubmitShopItem)} className="space-y-4">
                    <FormField
                      control={shopItemForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Item name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={shopItemForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Item description" 
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={shopItemForm.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Type</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-primary border-gray-700">
                                <SelectItem value="booster">Booster</SelectItem>
                                <SelectItem value="cosmetic">Cosmetic</SelectItem>
                                <SelectItem value="gear">Gear</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={shopItemForm.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price (Coins)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                {...field} 
                                onChange={(e) => field.onChange(parseInt(e.target.value))} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={shopItemForm.control}
                      name="effectValue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Effect Value</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field} 
                              onChange={(e) => field.onChange(parseInt(e.target.value))} 
                            />
                          </FormControl>
                          <FormDescription>
                            Value used for booster multipliers, gear bonuses, etc. (0 if not applicable)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <DialogFooter>
                      <Button 
                        type="submit" 
                        disabled={createShopItemMutation.isPending || updateShopItemMutation.isPending}
                      >
                        {(createShopItemMutation.isPending || updateShopItemMutation.isPending) ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            {editingItem ? "Updating..." : "Creating..."}
                          </>
                        ) : editingItem ? "Update Item" : "Create Item"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-secondary" />
          </div>
        ) : !filteredItems || filteredItems.length === 0 ? (
          <div className="bg-primary-dark p-6 rounded-lg text-center">
            <AlertTriangle className="h-8 w-8 text-warning mx-auto mb-2" />
            <p className="text-gray-400">No shop items found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredItems.map((item: any) => {
              // Item type icons and colors
              const typeIcons = {
                "booster": <Zap className="h-5 w-5 text-yellow-400" />,
                "cosmetic": <Trophy className="h-5 w-5 text-purple-400" />,
                "gear": <Star className="h-5 w-5 text-blue-400" />
              };
              
              const typeColors = {
                "booster": "bg-yellow-500 bg-opacity-20 text-yellow-400",
                "cosmetic": "bg-purple-500 bg-opacity-20 text-purple-400",
                "gear": "bg-blue-500 bg-opacity-20 text-blue-400"
              };
              
              return (
                <Card key={item.id} className="bg-primary-dark border-gray-700">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-white">{item.name}</CardTitle>
                        <CardDescription>{item.description}</CardDescription>
                      </div>
                      <div className={`p-2 rounded-md ${typeColors[item.type as keyof typeof typeColors] || "bg-gray-700"}`}>
                        {typeIcons[item.type as keyof typeof typeIcons] || <ShoppingBag className="h-5 w-5" />}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">Type:</span>
                      <span className="text-white capitalize">{item.type}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">Price:</span>
                      <span className="text-accent">{item.price} coins</span>
                    </div>
                    
                    {item.effectValue > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Effect Value:</span>
                        <span className="text-white">{item.effectValue}</span>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-end space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEdit(item, "shopItem")}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                    </Dialog>
                    
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => {
                        setItemToDelete({ id: item.id, type: "shopItem" });
                        setDeleteConfirmOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderEventsTab = () => {
    const filteredEvents = filteredData();
    
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">Manage Events</h3>
          <div className="flex space-x-4">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-primary-dark border-gray-700"
              />
            </div>

            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  onClick={() => {
                    setEditingItem(null);
                    eventForm.reset({
                      title: "",
                      description: "",
                      type: "rankup"
                    });
                  }}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create Event
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-primary border-gray-700">
                <DialogHeader>
                  <DialogTitle className="text-white">
                    {editingItem ? "Edit Event" : "Create New Event"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingItem ? "Update event details" : "Add a new event for hunters"}
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...eventForm}>
                  <form onSubmit={eventForm.handleSubmit(onSubmitEvent)} className="space-y-4">
                    <FormField
                      control={eventForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Event title" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={eventForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Event description" 
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={eventForm.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-primary border-gray-700">
                              <SelectItem value="rankup">Rank Up Challenge</SelectItem>
                              <SelectItem value="doublexp">Double XP</SelectItem>
                              <SelectItem value="contest">Contest</SelectItem>
                              <SelectItem value="special">Special</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="p-3 rounded-md bg-gray-800 border border-gray-700 mb-4">
                      <div className="flex items-center space-x-2">
                        <InfoIcon className="h-5 w-5 text-blue-400" />
                        <p className="text-sm text-gray-300">Time-based features have been simplified to improve app stability.</p>
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <Button 
                        type="submit" 
                        disabled={createEventMutation.isPending || updateEventMutation.isPending}
                      >
                        {(createEventMutation.isPending || updateEventMutation.isPending) ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            {editingItem ? "Updating..." : "Creating..."}
                          </>
                        ) : editingItem ? "Update Event" : "Create Event"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-secondary" />
          </div>
        ) : !filteredEvents || filteredEvents.length === 0 ? (
          <div className="bg-primary-dark p-6 rounded-lg text-center">
            <AlertTriangle className="h-8 w-8 text-warning mx-auto mb-2" />
            <p className="text-gray-400">No events found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredEvents.map((event: any) => {
              // Event type colors
              const typeColors = {
                "rankup": "border-accent",
                "doublexp": "border-secondary",
                "contest": "border-purple-500",
                "special": "border-blue-500"
              };
              
              const typeTextColors = {
                "rankup": "text-accent",
                "doublexp": "text-secondary",
                "contest": "text-purple-500",
                "special": "text-blue-500"
              };
              
              return (
                <Card key={event.id} className="bg-primary-dark border-gray-700">
                  <CardHeader>
                    <div className="flex justify-between">
                      <div>
                        <CardTitle className="text-white">{event.title}</CardTitle>
                        <CardDescription>{event.description}</CardDescription>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs font-medium capitalize ${typeTextColors[event.type as keyof typeof typeTextColors] || "text-white"}`}>
                        {event.type}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">Created:</span>
                        <span className="text-white">{
                          (() => {
                            try {
                              const date = new Date(event.createdAt);
                              if (isNaN(date.getTime())) return 'Unknown';
                              return format(date, "MMM d, yyyy");
                            } catch (e) {
                              return 'Unknown';
                            }
                          })()
                        }</span>
                      </div>
                      
                      <div className="mt-4">
                        <div className={`p-2 rounded-md border-l-4 ${typeColors[event.type as keyof typeof typeColors] || "border-gray-500"} bg-primary-light bg-opacity-20`}>
                          <div className="text-xs text-gray-400">Event Type:</div>
                          <div className="text-sm font-medium capitalize">
                            <span className={typeTextColors[event.type as keyof typeof typeTextColors] || "text-white"}>
                              {event.type.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEdit(event, "event")}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                    </Dialog>
                    
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => {
                        setItemToDelete({ id: event.id, type: "event" });
                        setDeleteConfirmOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // If user is not an admin, redirect or show access denied
  if (!user?.isAdmin) {
    return (
      <AppLayout currentTab="Admin">
        <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
          <ShieldAlert className="h-16 w-16 text-destructive mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-gray-400 mb-6 text-center max-w-md">
            You do not have access to the Admin Panel. Only users with administrator privileges can access this area.
          </p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout currentTab="Admin">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Admin Panel</h2>
          <div className="bg-secondary bg-opacity-20 px-4 py-2 rounded-md">
            <span className="text-secondary font-medium">The Architect</span>
          </div>
        </div>

        <Card className="bg-gradient-to-r from-primary to-primary-dark border-gray-700 mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
              <div className="flex items-center">
                <ShieldAlert className="h-6 w-6 text-secondary mr-2" />
                <div>
                  <p className="text-sm text-gray-400">Admin Access</p>
                  <p className="font-medium text-white">Full System Control</p>
                </div>
              </div>
              <div className="h-10 border-l border-gray-700 hidden md:block"></div>
              <div className="flex items-center">
                <Users className="h-6 w-6 text-accent mr-2" />
                <div>
                  <p className="text-sm text-gray-400">Registered Users</p>
                  <p className="font-medium text-white">{(Array.isArray(users) ? users.length : 0)} Hunters</p>
                </div>
              </div>
              <div className="h-10 border-l border-gray-700 hidden md:block"></div>
              <div className="flex items-center">
                <ClipboardList className="h-6 w-6 text-green-400 mr-2" />
                <div>
                  <p className="text-sm text-gray-400">Active Quests</p>
                  <p className="font-medium text-white">{(Array.isArray(quests) ? quests.length : 0)} Quests</p>
                </div>
              </div>
              <div className="h-10 border-l border-gray-700 hidden md:block"></div>
              <div className="flex items-center">
                <Calendar className="h-6 w-6 text-blue-400 mr-2" />
                <div>
                  <p className="text-sm text-gray-400">Total Events</p>
                  <p className="font-medium text-white">
                    {(Array.isArray(events) ? events.length : 0)} Events
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Tabs defaultValue="users" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-primary-dark">
            <TabsTrigger value="users" className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="quests" className="flex items-center">
              <ClipboardList className="h-4 w-4 mr-2" />
              Quests
            </TabsTrigger>
            <TabsTrigger value="workouts" className="flex items-center">
              <Dumbbell className="h-4 w-4 mr-2" />
              Workouts
            </TabsTrigger>
            <TabsTrigger value="shop" className="flex items-center">
              <ShoppingBag className="h-4 w-4 mr-2" />
              Shop
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Events
            </TabsTrigger>
          </TabsList>
          
          <div className="mt-6">
            <TabsContent value="users">
              {renderUsersTab()}
            </TabsContent>
            
            <TabsContent value="quests">
              {renderQuestsTab()}
            </TabsContent>
            
            <TabsContent value="workouts">
              {renderWorkoutsTab()}
            </TabsContent>
            
            <TabsContent value="shop">
              {renderShopTab()}
            </TabsContent>
            
            <TabsContent value="events">
              {renderEventsTab()}
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="bg-primary border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this item? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-destructive bg-opacity-10 p-4 rounded-md border border-destructive border-opacity-50 flex items-start">
              <AlertTriangle className="h-5 w-5 text-destructive mr-2 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-destructive">Warning</p>
                <p className="text-xs text-destructive text-opacity-90">
                  Deleting this item may impact existing user data and system functionality.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={
                deleteUserMutation.isPending || 
                deleteQuestMutation.isPending ||
                deleteWorkoutMutation.isPending ||
                deleteShopItemMutation.isPending ||
                deleteEventMutation.isPending
              }
            >
              {(
                deleteUserMutation.isPending || 
                deleteQuestMutation.isPending ||
                deleteWorkoutMutation.isPending ||
                deleteShopItemMutation.isPending ||
                deleteEventMutation.isPending
              ) ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
