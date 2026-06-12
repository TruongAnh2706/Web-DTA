import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { AIChatWidget } from "@/components/AIChatWidget";
import { CustomCursor } from "@/components/CustomCursor";
import "./pages/games/styles/index.css";

// Lazy load pages for better performance
const Index = lazy(() => import("./pages/Index"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Auth = lazy(() => import("./pages/Auth"));
const Admin = lazy(() => import("./pages/Admin"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const NotFound = lazy(() => import("./pages/NotFound"));
const WebTools = lazy(() => import("./pages/WebTools"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const Profile = lazy(() => import("./pages/Profile"));
const Changelog = lazy(() => import("./pages/Changelog"));
const FAQ = lazy(() => import("./pages/FAQ"));
const About = lazy(() => import("./pages/About"));
const Products = lazy(() => import("./pages/Products"));
import RootLayout from "./components/layout/RootLayout";

// DTA Stealth Games
const WorkspaceHub = lazy(() => import("./pages/games/WorkspaceHub"));
const BattleshipGame = lazy(() => import("./pages/games/BattleshipGame"));
const CaroGame = lazy(() => import("./pages/games/CaroGame"));
const WordChainGame = lazy(() => import("./pages/games/WordChainGame"));
const HangmanGame = lazy(() => import("./pages/games/HangmanGame"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000, // 10 minutes - tăng từ 5 phút
      gcTime: 15 * 60 * 1000, // 15 minutes - cache lâu hơn
      retry: 1,
      refetchOnWindowFocus: false, // Tắt refetch khi focus window
      refetchOnReconnect: false, // Tắt refetch khi reconnect
    },
  },
});


const PageLoader = () => (
  <div className="h-screen w-full flex items-center justify-center bg-background">
    <Loader2 className="w-10 h-10 animate-spin text-primary" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} forcedTheme="dark">
      <LanguageProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route element={<RootLayout />}>
                    <Route path="/" element={<Index />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/app/:id" element={<ProductDetail />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/pricing" element={<Pricing />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/admin" element={<Admin />} />
                    <Route path="/tools" element={<WebTools />} />
                    <Route path="/blog" element={<Blog />} />
                    <Route path="/blog/:slug" element={<BlogPost />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/changelog" element={<Changelog />} />
                    <Route path="/faq" element={<FAQ />} />
                    <Route path="*" element={<NotFound />} />
                  </Route>

                  {/* DTA Stealth Games (Outside Layout) */}
                  <Route path="/workspace" element={<WorkspaceHub />} />
                  <Route path="/workspace/diagnostic" element={<BattleshipGame />} />
                  <Route path="/workspace/sheets" element={<CaroGame />} />
                  <Route path="/workspace/docs" element={<WordChainGame />} />
                  <Route path="/workspace/decrypt" element={<HangmanGame />} />
                </Routes>
                <AIChatWidget />
                <CustomCursor />
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
