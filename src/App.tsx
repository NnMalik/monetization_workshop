import { useState, useEffect } from 'react';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Alert, AlertDescription } from './components/ui/alert';
import { LoginPage } from './components/LoginPage';
import { Dashboard } from './components/Dashboard';
import { LiveLogStream } from './components/LiveLogStream';
import { ScenarioBrief } from './components/ScenarioBrief';
import { DefenseGame } from './components/DefenseGame';
import { FacilitatorDashboard } from './components/FacilitatorDashboard';
import { projectId, publicAnonKey } from './utils/supabase/info';
import { 
  Shield, 
  Settings, 
  BarChart3, 
  ScrollText,
  FileText,
  LogOut,
  Users,
  Crown
} from 'lucide-react';

interface UserSession {
  sessionId: string;
  username: string;
  role: 'facilitator' | 'participant';
}

interface SimulationState {
  isActive: boolean;
  scenarioId?: string;
  currentStep?: number;
  isResolved?: boolean;
  resolvedBy?: string;
}

export default function App() {
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [currentSection, setCurrentSection] = useState('dashboard');
  const [simulationState, setSimulationState] = useState<SimulationState>({ isActive: false });

  const sections = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'logs', label: 'Live Logs', icon: ScrollText },
    { id: 'defense', label: 'Defense Protocol', icon: Shield },
  ];

  // Poll for simulation state updates
  useEffect(() => {
    if (!userSession) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-af10fea3/simulation/current`, {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        });
        
        if (response.ok) {
          const simulation = await response.json();
          setSimulationState(simulation);
        }
      } catch (error) {
        console.error('Failed to fetch simulation state:', error);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [userSession]);

  const handleLogin = (sessionId: string, role: string, username: string) => {
    const userSession = {
      sessionId,
      username,
      role: role as 'facilitator' | 'participant'
    };
    
    setUserSession(userSession);
    // Store session ID for use in other components
    localStorage.setItem('workshop_session_id', sessionId);
  };

  const handleLogout = () => {
    setUserSession(null);
    setCurrentSection('dashboard');
    setSimulationState({ isActive: false });
    // Clear stored session
    localStorage.removeItem('workshop_session_id');
  };

  const handleStartScenario = async (scenarioId: string) => {
    if (!userSession || userSession.role !== 'facilitator') return;

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-af10fea3/simulation/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          scenarioId,
          sessionId: userSession.sessionId
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setSimulationState(result.simulationState);
      }
    } catch (error) {
      console.error('Failed to start scenario:', error);
    }
  };

  const handleStopScenario = () => {
    setSimulationState({ isActive: false });
  };

  if (!userSession) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // Show facilitator dashboard for facilitators
  if (userSession.role === 'facilitator') {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
                  <Shield className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold">API Monetization Defense Workshop</h1>
                  <p className="text-sm text-muted-foreground">
                    Facilitator Control Panel • {userSession.username}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {simulationState.isActive && (
                  <Badge variant="destructive" className="animate-pulse">
                    🔴 INCIDENT ACTIVE
                  </Badge>
                )}
                <Badge variant="outline" className="flex items-center gap-1">
                  <Crown className="w-3 h-3" />
                  Facilitator
                </Badge>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-1" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Facilitator Dashboard */}
        <main className="container mx-auto px-4 py-6">
          <FacilitatorDashboard
            userSession={userSession}
            simulationState={simulationState}
            onStartScenario={handleStartScenario}
            onStopScenario={handleStopScenario}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
                <Shield className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">API Monetization Defense Workshop</h1>
                <p className="text-sm text-muted-foreground">
                  Live Training Environment • {userSession.username}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {simulationState.isActive && (
                <Badge variant="destructive" className="animate-pulse">
                  🔴 INCIDENT ACTIVE
                </Badge>
              )}
              <Badge variant="outline" className="flex items-center gap-1">
                {userSession.role === 'facilitator' ? (
                  <>
                    <Crown className="w-3 h-3" />
                    Facilitator
                  </>
                ) : (
                  <>
                    <Users className="w-3 h-3" />
                    Participant
                  </>
                )}
              </Badge>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-1" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b bg-card/50">
        <div className="container mx-auto px-4">
          <Tabs value={currentSection} onValueChange={setCurrentSection} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <TabsTrigger key={section.id} value={section.id} className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    {section.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>
        </div>
      </nav>

      {/* Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <Tabs value={currentSection} onValueChange={setCurrentSection}>
              {/* Dashboard */}
              <TabsContent value="dashboard">
                <Dashboard 
                  simulationActive={simulationState.isActive}
                  scenarioId={simulationState.scenarioId}
                  currentStep={simulationState.currentStep}
                />
              </TabsContent>

              {/* Live Logs */}
              <TabsContent value="logs">
                <LiveLogStream 
                  simulationActive={simulationState.isActive}
                  scenarioId={simulationState.scenarioId}
                  currentStep={simulationState.currentStep}
                />
              </TabsContent>

              {/* Defense Protocol */}
              <TabsContent value="defense">
                <DefenseGame 
                  simulationActive={simulationState.isActive}
                  scenarioId={simulationState.scenarioId}
                  attackId={simulationState.attackId}
                  userSession={userSession}
                  onComplete={() => {
                    // Refresh simulation state after completion
                    setTimeout(() => {
                      fetch(`https://${projectId}.supabase.co/functions/v1/make-server-af10fea3/simulation/current`, {
                        headers: { 'Authorization': `Bearer ${publicAnonKey}` },
                      })
                      .then(res => res.json())
                      .then(setSimulationState)
                      .catch(console.error);
                    }, 1000);
                  }}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar - Scenario Brief */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <ScenarioBrief
                simulationActive={simulationState.isActive}
                scenarioId={simulationState.scenarioId}
                currentStep={simulationState.currentStep}
                userRole={userSession.role}
                onStartScenario={handleStartScenario}
                isResolved={simulationState.isResolved}
                resolvedBy={simulationState.resolvedBy}
              />
            </div>
          </div>
        </div>

        {/* Workshop Instructions */}
        {!simulationState.isActive && (
          <Alert className="mt-6">
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>Workshop Instructions:</strong>
              {userSession.role === 'facilitator' ? (
                <span>
                  {' '}Use the Scenario Brief panel to launch incidents for participants. 
                  Monitor their progress and guide the discussion through each phase of the attack.
                </span>
              ) : (
                <span>
                  {' '}Explore the Dashboard and Live Logs to understand normal operations. 
                  When an incident starts, investigate the patterns and use the Defense Protocol to neutralize threats! 🛡️
                </span>
              )}
            </AlertDescription>
          </Alert>
        )}
      </main>
    </div>
  );
}