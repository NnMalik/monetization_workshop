import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Progress } from './ui/progress';
import { 
  Activity, 
  AlertTriangle, 
  DollarSign, 
  Users, 
  Zap, 
  TrendingDown,
  TrendingUp,
  Shield,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';

interface Attack {
  id: string;
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  active: boolean;
  impact: {
    revenue: number;
    requests: number;
    customers: number;
  };
}

interface Metrics {
  totalRevenue: number;
  apiCalls: number;
  activeUsers: number;
  threatLevel: number;
  uptime: number;
}

export function ScenarioSimulator() {
  const [isRunning, setIsRunning] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [metrics, setMetrics] = useState<Metrics>({
    totalRevenue: 12500,
    apiCalls: 45680,
    activeUsers: 1240,
    threatLevel: 20,
    uptime: 99.8
  });

  const [attacks, setAttacks] = useState<Attack[]>([
    {
      id: 'rate-limit-bypass',
      type: 'Rate Limiting Bypass',
      description: 'Suspicious traffic patterns detected from rotating IP addresses',
      severity: 'medium',
      active: false,
      impact: { revenue: -150, requests: +2500, customers: 0 }
    },
    {
      id: 'auth-token-abuse',
      type: 'Authentication Token Abuse',
      description: 'API key being used from multiple geographic locations simultaneously',
      severity: 'high',
      active: false,
      impact: { revenue: -300, requests: +1200, customers: -5 }
    },
    {
      id: 'ddos-attack',
      type: 'DDoS Attack',
      description: 'Volumetric attack targeting expensive compute endpoints',
      severity: 'critical',
      active: false,
      impact: { revenue: -800, requests: +15000, customers: -25 }
    },
    {
      id: 'tier-violation',
      type: 'Pricing Tier Violation',
      description: 'Users batching requests to appear as single API calls',
      severity: 'medium',
      active: false,
      impact: { revenue: -200, requests: +800, customers: 0 }
    }
  ]);

  const [events, setEvents] = useState<string[]>([]);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setCurrentTime(prev => prev + 1);

      // Simulate attacks at different intervals
      if (currentTime === 5) {
        triggerAttack('rate-limit-bypass');
      } else if (currentTime === 12) {
        triggerAttack('auth-token-abuse');
      } else if (currentTime === 20) {
        triggerAttack('ddos-attack');
      } else if (currentTime === 8) {
        triggerAttack('tier-violation');
      }

      // Update metrics based on active attacks
      setMetrics(prev => {
        let newMetrics = { ...prev };
        
        attacks.forEach(attack => {
          if (attack.active) {
            newMetrics.totalRevenue += attack.impact.revenue;
            newMetrics.apiCalls += attack.impact.requests;
            newMetrics.activeUsers += attack.impact.customers;
          }
        });

        // Calculate threat level based on active attacks
        const activeCritical = attacks.filter(a => a.active && a.severity === 'critical').length;
        const activeHigh = attacks.filter(a => a.active && a.severity === 'high').length;
        const activeMedium = attacks.filter(a => a.active && a.severity === 'medium').length;
        
        newMetrics.threatLevel = Math.min(100, 
          activeCritical * 40 + activeHigh * 25 + activeMedium * 15
        );

        // Uptime decreases with critical attacks
        if (activeCritical > 0) {
          newMetrics.uptime = Math.max(85, newMetrics.uptime - 0.5);
        }

        return newMetrics;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, currentTime, attacks]);

  const triggerAttack = (attackId: string) => {
    setAttacks(prev => prev.map(attack => 
      attack.id === attackId 
        ? { ...attack, active: true }
        : attack
    ));

    const attack = attacks.find(a => a.id === attackId);
    if (attack) {
      setEvents(prev => [...prev, `${formatTime(currentTime)}: ${attack.type} detected!`]);
    }
  };

  const stopAttack = (attackId: string) => {
    setAttacks(prev => prev.map(attack => 
      attack.id === attackId 
        ? { ...attack, active: false }
        : attack
    ));

    const attack = attacks.find(a => a.id === attackId);
    if (attack) {
      setEvents(prev => [...prev, `${formatTime(currentTime)}: ${attack.type} mitigated`]);
    }
  };

  const resetSimulation = () => {
    setIsRunning(false);
    setCurrentTime(0);
    setMetrics({
      totalRevenue: 12500,
      apiCalls: 45680,
      activeUsers: 1240,
      threatLevel: 20,
      uptime: 99.8
    });
    setAttacks(prev => prev.map(attack => ({ ...attack, active: false })));
    setEvents([]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'secondary';
      case 'medium': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">🚨 Attack Monitor - War Room Dashboard</h2>
        <p className="text-muted-foreground">
          Watch the chaos unfold! See how attacks impact your API in real-time (Don't panic, it's just a simulation! 😅)
        </p>
      </div>

      {/* Simulation Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              🎮 Attack Simulation Control
            </span>
            <span className="text-lg font-mono bg-red-100 text-red-800 px-2 py-1 rounded">
              {isRunning ? '🔴 LIVE' : '⏸️ PAUSED'} {formatTime(currentTime)}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button 
              onClick={() => setIsRunning(!isRunning)}
              variant={isRunning ? "destructive" : "default"}
              size="lg"
            >
              {isRunning ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Stop the Madness! 🛑
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Release the Kraken! 🐙
                </>
              )}
            </Button>
            <Button onClick={resetSimulation} variant="outline">
              <RotateCcw className="w-4 h-4 mr-2" />
              Start Fresh 🔄
            </Button>
            <div className="flex-1">
              <Progress value={(currentTime / 30) * 100} className="w-full" />
              <p className="text-xs text-muted-foreground mt-1">
                ⏰ Attack Timeline (30 sec = 1 day) - Buckle up!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Metrics Dashboard */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue (24h)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.totalRevenue > 12500 ? (
                <span className="text-green-600 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Increasing
                </span>
              ) : (
                <span className="text-red-600 flex items-center gap-1">
                  <TrendingDown className="w-3 h-3" />
                  Decreasing
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Calls</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.apiCalls.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {attacks.some(a => a.active) ? (
                <span className="text-orange-600">Unusual activity</span>
              ) : (
                <span className="text-green-600">Normal traffic</span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.activeUsers < 1240 ? (
                <span className="text-red-600">Users dropping</span>
              ) : (
                <span className="text-green-600">Stable</span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Threat Level</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.threatLevel}%</div>
            <Progress 
              value={metrics.threatLevel} 
              className="mt-2"
              // @ts-ignore
              indicatorClassName={
                metrics.threatLevel > 70 ? "bg-red-500" :
                metrics.threatLevel > 40 ? "bg-orange-500" : "bg-green-500"
              }
            />
          </CardContent>
        </Card>
      </div>

      {/* Active Attacks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Active Threats
          </CardTitle>
          <CardDescription>
            Current attacks detected on your API monetization system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {attacks.map(attack => (
              <div 
                key={attack.id}
                className={`p-4 rounded-lg border ${
                  attack.active ? 'border-red-200 bg-red-50' : 'border-border bg-card'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{attack.type}</h4>
                      <Badge variant={getSeverityColor(attack.severity)}>
                        {attack.severity}
                      </Badge>
                      {attack.active && (
                        <Badge variant="destructive">ACTIVE</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{attack.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {attack.active && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => stopAttack(attack.id)}
                      >
                        Mitigate
                      </Button>
                    )}
                  </div>
                </div>
                {attack.active && (
                  <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                    <div className="text-red-600">
                      Revenue Impact: ${attack.impact.revenue}/min
                    </div>
                    <div className="text-orange-600">
                      Extra Requests: +{attack.impact.requests}/min
                    </div>
                    <div className="text-red-600">
                      User Impact: {attack.impact.customers}/min
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Event Log */}
      <Card>
        <CardHeader>
          <CardTitle>Event Log</CardTitle>
          <CardDescription>Real-time security events and responses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {events.length === 0 ? (
              <p className="text-muted-foreground text-sm">No events yet. Start the simulation to see attacks.</p>
            ) : (
              events.map((event, index) => (
                <div key={index} className="text-sm font-mono bg-muted p-2 rounded">
                  {event}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Alert className="bg-gradient-to-r from-yellow-50 to-orange-50 border-orange-200">
        <AlertTriangle className="h-4 w-4 text-orange-600" />
        <AlertDescription>
          <strong>🎭 Plot Twist:</strong> This is just a simulation, but these attacks happen every day in the real world! 
          Want to learn how to fight back? Jump into the Defense Game and become an API security hero! 🦸‍♀️
        </AlertDescription>
      </Alert>
    </div>
  );
}