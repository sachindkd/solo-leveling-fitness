import { Switch } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";
import Training from "@/pages/training";
import Quests from "@/pages/quests";
import Jobs from "@/pages/jobs";
import Shop from "@/pages/shop";
import Leaderboard from "@/pages/leaderboard";
import AdminPanel from "@/pages/admin-panel";
import { ProtectedRoute, AdminRoute } from "./lib/protected-route";
import { AuthProvider } from "./hooks/use-auth";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={Dashboard} />
      <ProtectedRoute path="/training" component={Training} />
      <ProtectedRoute path="/quests" component={Quests} />
      <ProtectedRoute path="/jobs" component={Jobs} />
      <ProtectedRoute path="/shop" component={Shop} />
      <ProtectedRoute path="/leaderboard" component={Leaderboard} />
      <AdminRoute path="/admin" component={AdminPanel} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
