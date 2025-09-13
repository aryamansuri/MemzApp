import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LogProvider } from "@/contexts/LogContext";
import Index from "./pages/Index";
import LogDetail from "./pages/LogDetail";
import NotFound from "./pages/NotFound";
import SignInPage from "./pages/SignInPage";
import { useEffect, useState } from "react";
import { auth } from "@/firebase";
import { onAuthStateChanged, User, signOut } from "firebase/auth";

import { allowedEmails } from "./allowedEmails";

const queryClient = new QueryClient();

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return null;


  if (!user || !user.email || !allowedEmails.includes(user.email)) {
    return <SignInPage onSignIn={() => window.location.reload()} />;
  }

  const handleLogout = async () => {
    await signOut(auth);
    window.location.reload();
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LogProvider>
          <Toaster />
          <Sonner />
          <div className="w-full flex justify-end p-4">
            <button
              onClick={handleLogout}
              className="btn btn-outline btn-sm"
              style={{ marginRight: 8 }}
            >
              Logout
            </button>
          </div>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/log/:id" element={<LogDetail />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </LogProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
