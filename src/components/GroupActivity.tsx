import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { 
  Users, 
  Target, 
  CheckCircle, 
  AlertTriangle, 
  Trophy,
  Clock,
  Shield,
  Lightbulb,
  MessageSquare
} from 'lucide-react';

interface Team {
  id: string;
  name: string;
  members: string[];
  color: string;
  score: number;
}

interface Problem {
  id: string;
  title: string;
  description: string;
  scenario: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  category: string;
  solved: boolean;
  solvedBy?: string;
}

interface Solution {
  teamId: string;
  problemId: string;
  solution: string;
  timestamp: Date;
  approved: boolean;
}

export function GroupActivity() {
  const [currentPhase, setCurrentPhase] = useState<'setup' | 'activity' | 'results'>('setup');
  const [teams, setTeams] = useState<Team[]>([
    { id: 'team1', name: 'API Defenders', members: [], color: 'bg-blue-500', score: 0 },
    { id: 'team2', name: 'Security Squad', members: [], color: 'bg-green-500', score: 0 },
    { id: 'team3', name: 'Revenue Rangers', members: [], color: 'bg-purple-500', score: 0 },
    { id: 'team4', name: 'Threat Hunters', members: [], color: 'bg-orange-500', score: 0 }
  ]);

  const [problems] = useState<Problem[]>([
    {
      id: 'p1',
      title: 'Rate Limit Bypass Detection',
      description: 'Users are rotating IP addresses to bypass rate limits',
      scenario: 'You notice API usage from a single account is coming from 50+ different IP addresses within an hour, all from different countries.',
      difficulty: 'easy',
      points: 10,
      category: 'Rate Limiting',
      solved: false
    },
    {
      id: 'p2',
      title: 'API Key Sharing Prevention',
      description: 'Detect and prevent unauthorized API key sharing',
      scenario: 'An API key registered to a startup in California is being used simultaneously from servers in 5 different continents.',
      difficulty: 'medium',
      points: 15,
      category: 'Authentication',
      solved: false
    },
    {
      id: 'p3',
      title: 'Pricing Tier Manipulation',
      description: 'Users are gaming the system to stay in lower pricing tiers',
      scenario: 'A user consistently makes exactly 999 API calls per month (just under the 1000 limit for premium tier) but their requests suggest they need premium features.',
      difficulty: 'medium',
      points: 15,
      category: 'Billing',
      solved: false
    },
    {
      id: 'p4',
      title: 'DDoS Attack Mitigation',
      description: 'Implement protection against volumetric attacks',
      scenario: 'Your API is receiving 100x normal traffic volume targeting your most expensive ML inference endpoints, causing infrastructure costs to spike.',
      difficulty: 'hard',
      points: 25,
      category: 'Infrastructure',
      solved: false
    },
    {
      id: 'p5',
      title: 'Revenue Leakage Analysis',
      description: 'Identify hidden patterns causing revenue loss',
      scenario: 'Monthly revenue is 20% below projections despite increased API usage. Users seem to be accessing premium features without proper billing.',
      difficulty: 'hard',
      points: 25,
      category: 'Analytics',
      solved: false
    }
  ]);

  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [selectedProblem, setSelectedProblem] = useState<string>('');
  const [currentSolution, setCurrentSolution] = useState<string>('');
  const [selectedTeam, setSelectedTeam] = useState<string>('team1');

  const submitSolution = () => {
    if (!selectedProblem || !currentSolution.trim()) return;

    const newSolution: Solution = {
      teamId: selectedTeam,
      problemId: selectedProblem,
      solution: currentSolution,
      timestamp: new Date(),
      approved: false
    };

    setSolutions(prev => [...prev, newSolution]);
    setCurrentSolution('');
    
    // For demo purposes, auto-approve after 2 seconds
    setTimeout(() => {
      setSolutions(prev => prev.map(sol => 
        sol === newSolution ? { ...sol, approved: true } : sol
      ));
      
      // Update team score and mark problem as solved
      const problem = problems.find(p => p.id === selectedProblem);
      if (problem) {
        setTeams(prev => prev.map(team => 
          team.id === selectedTeam 
            ? { ...team, score: team.score + problem.points }
            : team
        ));
      }
    }, 2000);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTeamSolutions = (teamId: string) => {
    return solutions.filter(sol => sol.teamId === teamId);
  };

  const sortedTeams = [...teams].sort((a, b) => b.score - a.score);

  if (currentPhase === 'setup') {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">Group Activity Setup</h2>
          <p className="text-muted-foreground">
            Form teams and prepare for the API monetization defense challenge
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Team Formation
            </CardTitle>
            <CardDescription>
              Organize into 3-4 teams to compete in identifying and solving API monetization challenges
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold">Teams</h4>
                {teams.map(team => (
                  <div key={team.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className={`w-4 h-4 rounded-full ${team.color}`}></div>
                    <div className="flex-1">
                      <div className="font-medium">{team.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {team.members.length} members
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Activity Rules</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <div className="w-1 h-1 bg-primary rounded-full mt-2"></div>
                    Each team gets the same set of problems to solve
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1 h-1 bg-primary rounded-full mt-2"></div>
                    Points awarded based on problem difficulty and solution quality
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1 h-1 bg-primary rounded-full mt-2"></div>
                    Teams can discuss approaches but must submit individual solutions
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1 h-1 bg-primary rounded-full mt-2"></div>
                    20-minute time limit for the activity phase
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Button onClick={() => setCurrentPhase('activity')} size="lg">
                Start Group Activity
              </Button>
            </div>
          </CardContent>
        </Card>

        <Alert>
          <Lightbulb className="h-4 w-4" />
          <AlertDescription>
            <strong>Tip:</strong> Each problem represents a real scenario companies face. 
            Think about both technical solutions and business processes that could help.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (currentPhase === 'activity') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">API Monetization Defense Challenge</h2>
            <p className="text-muted-foreground">Work with your team to identify problems and propose solutions</p>
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={() => setCurrentPhase('results')} variant="outline">
              View Results
            </Button>
          </div>
        </div>

        <Tabs defaultValue="problems" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="problems">Problems</TabsTrigger>
            <TabsTrigger value="solve">Submit Solution</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          </TabsList>

          <TabsContent value="problems" className="space-y-4">
            <div className="grid gap-4">
              {problems.map(problem => (
                <Card key={problem.id} className={problem.solved ? 'opacity-60' : ''}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        {problem.title}
                        {problem.solved && <CheckCircle className="w-5 h-5 text-green-600" />}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge className={getDifficultyColor(problem.difficulty)}>
                          {problem.difficulty}
                        </Badge>
                        <Badge variant="outline">{problem.points} pts</Badge>
                        <Badge variant="secondary">{problem.category}</Badge>
                      </div>
                    </div>
                    <CardDescription>{problem.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <h5 className="font-semibold mb-2">Scenario:</h5>
                        <p className="text-sm bg-muted p-3 rounded-lg">{problem.scenario}</p>
                      </div>
                      <Button 
                        onClick={() => setSelectedProblem(problem.id)}
                        variant={selectedProblem === problem.id ? "default" : "outline"}
                        disabled={problem.solved}
                      >
                        {selectedProblem === problem.id ? 'Selected' : 'Select to Solve'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="solve" className="space-y-4">
            {selectedProblem ? (
              <Card>
                <CardHeader>
                  <CardTitle>Submit Solution</CardTitle>
                  <CardDescription>
                    Problem: {problems.find(p => p.id === selectedProblem)?.title}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="team-select">Select Your Team</Label>
                    <select 
                      id="team-select"
                      value={selectedTeam} 
                      onChange={(e) => setSelectedTeam(e.target.value)}
                      className="w-full p-2 border rounded-md mt-1"
                    >
                      {teams.map(team => (
                        <option key={team.id} value={team.id}>{team.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <Label htmlFor="solution">Your Solution</Label>
                    <Textarea
                      id="solution"
                      placeholder="Describe your approach to solve this problem. Include both technical and business considerations..."
                      value={currentSolution}
                      onChange={(e) => setCurrentSolution(e.target.value)}
                      className="min-h-32 mt-1"
                    />
                  </div>
                  
                  <Button onClick={submitSolution} disabled={!currentSolution.trim()}>
                    Submit Solution
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Problem Selected</h3>
                  <p className="text-muted-foreground">Select a problem from the Problems tab to submit a solution.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Team Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sortedTeams.map((team, index) => (
                    <div key={team.id} className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className="text-lg font-bold text-muted-foreground">
                        #{index + 1}
                      </div>
                      <div className={`w-4 h-4 rounded-full ${team.color}`}></div>
                      <div className="flex-1">
                        <div className="font-semibold">{team.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {getTeamSolutions(team.id).length} solutions submitted
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">{team.score} pts</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  // Results phase
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Activity Results</h2>
        <p className="text-muted-foreground">Review team performance and solutions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Final Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedTeams.map((team, index) => (
              <div key={team.id} className={`p-4 rounded-lg border-2 ${
                index === 0 ? 'border-yellow-400 bg-yellow-50' : 'border-border'
              }`}>
                <div className="flex items-center gap-4">
                  <div className={`text-2xl font-bold ${
                    index === 0 ? 'text-yellow-600' : 'text-muted-foreground'
                  }`}>
                    #{index + 1}
                  </div>
                  <div className={`w-6 h-6 rounded-full ${team.color}`}></div>
                  <div className="flex-1">
                    <div className="font-bold text-lg">{team.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Solutions: {getTeamSolutions(team.id).length}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{team.score} pts</div>
                    {index === 0 && (
                      <div className="text-sm text-yellow-600 font-semibold">Winner! 🏆</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Key Learnings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Common Solution Patterns</h4>
              <ul className="space-y-2 text-sm">
                <li>• Multi-layered defense strategies</li>
                <li>• Real-time monitoring and alerting</li>
                <li>• Behavioral analysis for anomaly detection</li>
                <li>• Clear usage policies and enforcement</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Best Practices</h4>
              <ul className="space-y-2 text-sm">
                <li>• Combine technical and business controls</li>
                <li>• Implement gradual response mechanisms</li>
                <li>• Regular security audits and testing</li>
                <li>• Customer education and communication</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-center">
        <Button onClick={() => setCurrentPhase('setup')} variant="outline">
          Run Another Session
        </Button>
      </div>
    </div>
  );
}