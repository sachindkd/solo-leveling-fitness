import React, { useState } from "react";
import AppLayout from "@/components/layout/app-layout";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";

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
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { RankBadge } from "@/components/ui/rank-badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { STATS, RANKS, JOBS } from "@shared/schema";
import { STAT_NAMES, RANK_DESCRIPTION } from "@/lib/constants";
import { 
  Users, 
  ShieldAlert, 
  Search, 
  AlertTriangle, 
  Loader2, 
  Edit, 
  Trash2,
  Info as InfoIcon
} from "lucide-react";

export default function ArchitectPanel() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [editingUser, setEditingUser] = useState<any>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);

  // Fetch users data
  const { data: users, isLoading: loadingUsers } = useQuery({
    queryKey: ["/api/users"]
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

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: any }) => {
      return (await apiRequest("PATCH", `/api/users/${id}`, data)).json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Hunter updated",
        description: "The hunter has been updated successfully.",
      });
      setEditingUser(null);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update hunter",
        description: error.message || "An error occurred",
        variant: "destructive"
      });
    }
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Hunter deleted",
        description: "The hunter has been deleted successfully.",
      });
      setDeleteConfirmOpen(false);
      setUserToDelete(null);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete hunter",
        description: error.message || "An error occurred",
        variant: "destructive"
      });
    }
  });

  // Form submission handler
  const onSubmitUser = (data: z.infer<typeof userFormSchema>) => {
    if (editingUser) {
      updateUserMutation.mutate({ id: editingUser.id, data });
    }
  };

  // Helper for handling delete
  const handleDelete = () => {
    if (!userToDelete) return;
    deleteUserMutation.mutate(userToDelete);
  };

  // Helper for editing users
  const handleEdit = (user: any) => {
    setEditingUser(user);
    
    userForm.reset({
      username: user.username,
      rank: user.rank,
      job: user.job,
      level: user.level,
      xp: user.xp,
      coins: user.coins,
      stats: {
        strength: user.stats.strength,
        stamina: user.stats.stamina,
        speed: user.stats.speed,
        endurance: user.stats.endurance
      }
    });
  };

  // Filter users based on search
  const filteredUsers = searchQuery 
    ? users?.filter((user: any) => 
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.rank.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.job.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : users;

  // If user is not an admin, redirect or show access denied
  if (!user?.isAdmin) {
    return (
      <AppLayout currentTab="Architect">
        <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
          <ShieldAlert className="h-16 w-16 text-destructive mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-gray-400 mb-6 text-center max-w-md">
            You do not have access to the Architect Panel. Only users with architect privileges can access this area.
          </p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout currentTab="Architect">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Architect Panel</h2>
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
                  <p className="text-sm text-gray-400">Architect Access</p>
                  <p className="font-medium text-white">Hunter Management</p>
                </div>
              </div>
              <div className="h-10 border-l border-gray-700 hidden md:block"></div>
              <div className="flex items-center">
                <Users className="h-6 w-6 text-accent mr-2" />
                <div>
                  <p className="text-sm text-gray-400">Registered Hunters</p>
                  <p className="font-medium text-white">{(Array.isArray(users) ? users.length : 0)} Hunters</p>
                </div>
              </div>
              <div className="h-10 border-l border-gray-700 hidden md:block"></div>
              <div className="flex items-center">
                <InfoIcon className="h-6 w-6 text-blue-400 mr-2" />
                <div>
                  <p className="text-sm text-gray-400">Panel Status</p>
                  <p className="font-medium text-white">User Management Only</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white">Manage Hunters</h3>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search hunters..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-primary-dark border-gray-700"
              />
            </div>
          </div>
          
          <div className="p-4 bg-blue-900 bg-opacity-20 border border-blue-500 border-opacity-30 rounded-md mb-6">
            <div className="flex items-start">
              <InfoIcon className="h-5 w-5 text-blue-400 mr-2 mt-0.5" />
              <div>
                <p className="text-sm text-white mb-1 font-medium">Important Information</p>
                <p className="text-sm text-blue-100">
                  The Architect Panel has been simplified to focus only on hunter management. System-level features have been temporarily disabled to ensure stability.
                </p>
              </div>
            </div>
          </div>

          {loadingUsers ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-secondary" />
            </div>
          ) : !filteredUsers || filteredUsers.length === 0 ? (
            <div className="bg-primary-dark p-6 rounded-lg text-center">
              <AlertTriangle className="h-8 w-8 text-warning mx-auto mb-2" />
              <p className="text-gray-400">No hunters found</p>
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
                        <p className="text-xs text-gray-400">{user.isAdmin ? "Architect" : "Hunter"}</p>
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
                            onClick={() => handleEdit(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-primary border-gray-700">
                          <DialogHeader>
                            <DialogTitle className="text-white">Edit Hunter</DialogTitle>
                            <DialogDescription>
                              Update hunter information and stats
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
                                  ) : "Update Hunter"}
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
                          setUserToDelete(user.id);
                          setDeleteConfirmOpen(true);
                        }}
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
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="bg-primary border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this hunter? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-destructive bg-opacity-10 p-4 rounded-md border border-destructive border-opacity-50 flex items-start">
              <AlertTriangle className="h-5 w-5 text-destructive mr-2 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-destructive">Warning</p>
                <p className="text-xs text-destructive text-opacity-90">
                  Deleting this hunter will remove all associated data including quests, workouts, and items.
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
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : "Delete Hunter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}