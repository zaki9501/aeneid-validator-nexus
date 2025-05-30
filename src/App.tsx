
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import Home from "./pages/Home";
import ValidatorsExplorer from "./pages/ValidatorsExplorer";
import ValidatorDetails from "./pages/ValidatorDetails";
import Leaderboard from "./pages/Leaderboard";
import RewardsAnalytics from "./pages/RewardsAnalytics";
import NetworkVisualization from "./pages/NetworkVisualization";
import Education from "./pages/Education";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/validators" element={<ValidatorsExplorer />} />
            <Route path="/validators/:address" element={<ValidatorDetails />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/rewards" element={<RewardsAnalytics />} />
            <Route path="/network" element={<NetworkVisualization />} />
            <Route path="/education" element={<Education />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
