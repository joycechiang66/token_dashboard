import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { BudgetProvider } from "./contexts/BudgetContext";
import DepartmentOverview from "./pages/DepartmentOverview";
import DepartmentDetail from "./pages/DepartmentDetail";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={DepartmentOverview} />
      <Route path={"/department/:id"} component={DepartmentDetail} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
      >
        <BudgetProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </BudgetProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
