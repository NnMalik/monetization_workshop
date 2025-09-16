import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Separator } from './ui/separator';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { 
  Crown, 
  Users, 
  Trophy,
  Play,
  Square,
  AlertTriangle,
  Shield,
  Eye,
  Target,
  TrendingUp,
  Clock
} from 'lucide-react';

interface FacilitatorDashboardProps {
  userSession: any;
  simulationState: any;
  onStartScenario: (scenarioId: string) => void;
  onStopScenario: () => void;
}

interface ParticipantScore {
  username: string;
  total: number;
  attacks: Record<string, { steps: Record<string, number>, total: number }>;
  lastActivity?: string;
}

interface AttackScore {
  attackId: string;
  scenarioId: string;
  participantScores: Record<string, { steps: Record<string, number>, total: number }>;
}

interface ThreatScenario {
  id: string;
  title: string;
  emoji: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  description: string;
  duration: string;
  maxPoints: number;
  objectives: string[];
}

export function FacilitatorDashboard({ 
  userSession, 
  simulationState, 
  onStartScenario,
  onStopScenario 
}: FacilitatorDashboardProps) {
  const [participantScores, setParticipantScores] = useState<ParticipantScore[]>([]);
  const [currentAttackScores, setCurrentAttackScores] = useState<AttackScore | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const threats: ThreatScenario[] = [
    {
      id: 'free-tier-exploit',
      title: 'Unlimited Free Tier Exploit',
      emoji: '🆓',
      difficulty: 'Beginner',
      description: 'Attackers creating multiple accounts to bypass free tier limits using automation and fake identities.',
      duration: '15-20 min',
      maxPoints: 150,
      objectives: [
        'Identify suspicious signup patterns in logs',
        'Detect automated usage behaviors', 
        'Configure IP-based rate limiting',
        'Enable behavioral analysis detection'
      ]
    },
    {
      id: 'credential-sharing',
      title: 'Credential Sharing Network',
      emoji: '🔑',
      difficulty: 'Intermediate',
      description: 'Premium API keys being shared or sold on underground forums, used from multiple geographic locations.',
      duration: '20-25 min',
      maxPoints: 200,
      objectives: [
        'Analyze geographic usage patterns',
        'Identify impossible travel scenarios',
        'Implement session concurrency limits',
        'Setup geographic validation rules'
      ]
    },
    {
      id: 'shadow-endpoint',
      title: 'Shadow Endpoint Discovery',
      emoji: '👻',
      difficulty: 'Advanced',
      description: 'Attackers found internal debug endpoints through scanning and are using them to bypass authentication.',
      duration: '25-30 min',
      maxPoints: 250,
      objectives: [
        'Discover unauthorized endpoint access',
        'Identify resource consumption anomalies',
        'Implement endpoint whitelisting',
        'Secure development endpoints'
      ]
    },
    {
      id: 'usage-laundering',
      title: 'Usage Pattern Laundering',
      emoji: '🎭',
      difficulty: 'Advanced',
      description: 'Sophisticated users manipulating API request patterns to reduce billing costs through batching tricks.',
      duration: '20-25 min',
      maxPoints: 200,
      objectives: [
        'Detect revenue vs usage anomalies',
        'Identify batch request manipulation',
        'Analyze billing period exploitation',
        'Enable fair usage algorithms'
      ]
    }
  ];

  // Fetch participant scores
  useEffect(() => {
    if (userSession?.role !== 'facilitator') return;

    const fetchScores = async () => {
      try {
        // Fetch overall participant scores
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-af10fea3/scores/all/${userSession.sessionId}`, {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        });

        if (response.ok) {
          const scores = await response.json();
          setParticipantScores(scores);
        }

        // Fetch current attack specific scores if attack is active
        if (simulationState.isActive && simulationState.attackId) {
          const attackResponse = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-af10fea3/attacks/${simulationState.attackId}/scores/${userSession.sessionId}`, {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
            },
          });

          if (attackResponse.ok) {
            const attackScores = await attackResponse.json();
            setCurrentAttackScores({
              attackId: simulationState.attackId,
              scenarioId: simulationState.scenarioId || '',
              participantScores: attackScores
            });
          }
        } else {
          setCurrentAttackScores(null);
        }
      } catch (error) {
        console.error('Failed to fetch scores:', error);
      }
    };

    fetchScores();
    const interval = setInterval(fetchScores, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, [userSession, simulationState.isActive, simulationState.attackId]);

  const handleStopThreat = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-af10fea3/simulation/stop`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          sessionId: userSession.sessionId
        }),
      });

      if (response.ok) {
        onStopScenario();
      }
    } catch (error) {
      console.error('Failed to stop scenario:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActiveScenario = () => {
    return threats.find(t => t.id === simulationState.scenarioId);
  };

  const totalParticipants = participantScores.length;
  const averageScore = totalParticipants > 0 
    ? Math.round(participantScores.reduce((sum, p) => sum + p.total, 0) / totalParticipants)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mx-auto">
          <Crown className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Facilitator Control Center</h1>
          <p className="text-muted-foreground">
            Launch security scenarios and monitor participant progress
          </p>
        </div>
      </div>

      {/* Workshop Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Participants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalParticipants}</div>
            <p className="text-xs text-muted-foreground">
              Currently connected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageScore}</div>
            <p className="text-xs text-muted-foreground">
              Points across all participants
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Session Status</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {simulationState.isActive ? (
                <Badge variant="destructive">ACTIVE</Badge>
              ) : (
                <Badge variant="outline">READY</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {simulationState.isActive ? 'Incident running' : 'Waiting for launch'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Scenario Control */}
      {simulationState.isActive && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="w-5 h-5" />
              🚨 Active Threat Simulation
            </CardTitle>
            <CardDescription className="text-red-700">
              {getActiveScenario()?.title} is currently running • Attack ID: {simulationState.attackId}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold flex items-center gap-2">
                  {getActiveScenario()?.emoji} {getActiveScenario()?.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Duration: {getActiveScenario()?.duration} • Max Points: {getActiveScenario()?.maxPoints}
                </p>
              </div>
              <Button 
                variant="destructive" 
                onClick={handleStopThreat}
                disabled={isLoading}
              >
                <Square className="w-4 h-4 mr-2" />
                {isLoading ? 'Stopping...' : 'Stop Threat'}
              </Button>
            </div>
            
            {simulationState.isResolved && (
              <Alert className="border-green-300 bg-green-50">
                <Shield className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>✅ Threat Resolved!</strong> Successfully mitigated by {simulationState.resolvedBy}. 
                  You can now stop the simulation or let participants review their solutions.
                </AlertDescription>
              </Alert>
            )}

            {/* Current Attack Progress */}
            {currentAttackScores && (
              <div className="mt-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Live Attack Progress
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(currentAttackScores.participantScores).map(([username, scoreData]) => (
                    <div key={username} className="bg-white rounded-lg p-3 border">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{username}</span>
                        <Badge variant="secondary">{scoreData.total} pts</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {Object.keys(scoreData.steps).length} steps completed
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {Object.entries(scoreData.steps).map(([stepId, points]) => (
                          <Badge key={stepId} variant="outline" className="text-xs">
                            {stepId}: +{points}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                  {Object.keys(currentAttackScores.participantScores).length === 0 && (
                    <div className="col-span-full text-center text-muted-foreground py-4">
                      No participants have started the defense protocol yet
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Threat Scenarios */}
      {!simulationState.isActive && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              🎯 Available Threat Scenarios
            </CardTitle>
            <CardDescription>
              Launch realistic security incidents for participants to investigate and resolve
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {threats.map(threat => (
              <div key={threat.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{threat.emoji}</span>
                    <div>
                      <h3 className="font-semibold">{threat.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getDifficultyColor(threat.difficulty)}>
                          {threat.difficulty}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {threat.duration}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          • {threat.maxPoints} pts max
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button 
                    onClick={() => onStartScenario(threat.id)}
                    className="flex items-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    Launch Threat
                  </Button>
                </div>
                
                <p className="text-sm text-muted-foreground pl-11">
                  {threat.description}
                </p>
                
                <div className="pl-11">
                  <h4 className="text-sm font-semibold mb-2">Learning Objectives:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {threat.objectives.map((objective, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="w-1 h-1 bg-muted-foreground rounded-full mt-2 flex-shrink-0"></span>
                        {objective}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Participant Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            🏆 Participant Leaderboard
          </CardTitle>
          <CardDescription>
            Real-time scoring and progress tracking
          </CardDescription>
        </CardHeader>
        <CardContent>
          {participantScores.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No participants connected yet</p>
              <p className="text-sm">Scores will appear when participants join and start solving challenges</p>
            </div>
          ) : (
            <div className="space-y-3">
              {participantScores
                .sort((a, b) => b.total - a.total)
                .map((participant, index) => (
                  <div key={participant.username} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0 ? 'bg-yellow-100 text-yellow-800' :
                        index === 1 ? 'bg-gray-100 text-gray-700' :
                        index === 2 ? 'bg-orange-100 text-orange-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {index === 0 ? '🥇' : 
                         index === 1 ? '🥈' : 
                         index === 2 ? '🥉' : index + 1}
                      </div>
                      <div>
                        <h4 className="font-semibold">{participant.username}</h4>
                        <p className="text-sm text-muted-foreground">
                          {Object.keys(participant.attacks || {}).length} attacks completed
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold">{participant.total}</div>
                      <div className="text-sm text-muted-foreground">points</div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage Instructions */}
      <Alert>
        <Eye className="h-4 w-4" />
        <AlertDescription>
          <strong>Facilitator Guide:</strong> Launch threat scenarios to create realistic security incidents. 
          Participants will investigate through logs and dashboards, then apply fixes via the Policy Manager. 
          Monitor their progress and guide discussions as they work through each challenge! 🎓
        </AlertDescription>
      </Alert>
    </div>
  );
}