import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { 
  FileText, 
  Clock, 
  DollarSign, 
  Users, 
  AlertTriangle,
  Target,
  Shield,
  Eye,
  CheckCircle
} from 'lucide-react';

interface ScenarioBriefProps {
  simulationActive: boolean;
  scenarioId?: string;
  currentStep?: number;
  userRole: string;
  onStartScenario?: (scenarioId: string) => void;
  isResolved?: boolean;
  resolvedBy?: string;
}

interface Scenario {
  id: string;
  title: string;
  emoji: string;
  description: string;
  severity: 'Medium' | 'High' | 'Critical';
  estimatedLoss: string;
  timeToDetect: string;
  affectedUsers: string;
  objectives: string[];
  context: string;
}

export function ScenarioBrief({ 
  simulationActive, 
  scenarioId, 
  currentStep = 0,
  userRole,
  onStartScenario,
  isResolved = false,
  resolvedBy
}: ScenarioBriefProps) {
  
  const scenarios: Record<string, Scenario> = {
    'free-tier-exploit': {
      id: 'free-tier-exploit',
      title: 'Unlimited Free Tier Exploit',
      emoji: '🆓',
      description: 'Attackers are exploiting free tier limits by creating multiple accounts and using sophisticated techniques to appear as legitimate users while accessing premium features.',
      severity: 'High',
      estimatedLoss: '$15,000/day',
      timeToDetect: '6 hours',
      affectedUsers: '2,340 legitimate users',
      objectives: [
        'Identify the exploit mechanism',
        'Distinguish between legitimate and fraudulent usage',
        'Implement detection and prevention measures',
        'Minimize impact on real free tier users'
      ],
      context: 'Your free tier allows 1,000 API calls per month. Suddenly, you\'re seeing 10x normal free tier usage but revenue hasn\'t increased proportionally.'
    },
    'credential-sharing': {
      id: 'credential-sharing',
      title: 'Credential Sharing Network',
      emoji: '🔑',
      description: 'Premium API credentials are being shared or sold through underground networks, allowing unauthorized access to paid features.',
      severity: 'Critical',
      estimatedLoss: '$25,000/month',
      timeToDetect: '2 weeks',
      affectedUsers: '450 premium subscribers',
      objectives: [
        'Detect shared credentials in real-time',
        'Identify the distribution mechanism',
        'Implement credential fingerprinting',
        'Protect legitimate users from false positives'
      ],
      context: 'A premium API key is being used simultaneously from multiple continents with different usage patterns, suggesting credential sharing or theft.'
    },
    'shadow-endpoint': {
      id: 'shadow-endpoint',
      title: 'Shadow Endpoint Misuse',
      emoji: '👻',
      description: 'Attackers have discovered undocumented or internal API endpoints and are using them to bypass billing and rate limiting.',
      severity: 'Critical',
      estimatedLoss: '$8,000/day',
      timeToDetect: '4 days',
      affectedUsers: 'All users (system stability)',
      objectives: [
        'Identify all shadow endpoints being accessed',
        'Understand how they were discovered',
        'Implement proper security controls',
        'Audit internal endpoint exposure'
      ],
      context: 'System monitoring shows unusual load patterns and costs, but regular API metrics appear normal. Something is consuming resources outside normal channels.'
    },
    'usage-laundering': {
      id: 'usage-laundering',
      title: 'Usage Laundering Scheme',
      emoji: '🎭',
      description: 'Sophisticated users are manipulating request patterns to appear as lower-tier users while accessing high-value services through batching and obfuscation.',
      severity: 'Medium',
      estimatedLoss: '$12,000/month',
      timeToDetect: '3 weeks',
      affectedUsers: '850 paying customers',
      objectives: [
        'Detect usage pattern manipulation',
        'Understand the laundering techniques',
        'Implement fair usage monitoring',
        'Maintain service quality for legitimate users'
      ],
      context: 'Revenue per API call has been declining steadily, but individual request patterns look normal. Users seem to be gaming the system through clever request structuring.'
    }
  };

  const currentScenario = scenarioId ? scenarios[scenarioId] : null;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'destructive';
      case 'High': return 'secondary';
      case 'Medium': return 'outline';
      default: return 'outline';
    }
  };

  const getStepProgress = () => {
    if (!currentScenario) return 0;
    const totalSteps = 4; // Assuming 4 steps per scenario
    return Math.round((currentStep / totalSteps) * 100);
  };

  if (!simulationActive && userRole === 'facilitator') {
    return (
      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            🎮 Scenario Control
          </CardTitle>
          <CardDescription>
            Launch interactive security scenarios for participants
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground mb-4">
            Select a scenario to begin the workshop simulation:
          </div>
          
          {Object.values(scenarios).map(scenario => (
            <div key={scenario.id} className="border rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{scenario.emoji}</span>
                  <div>
                    <div className="font-semibold text-sm">{scenario.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {scenario.estimatedLoss} potential loss
                    </div>
                  </div>
                </div>
                <Badge variant={getSeverityColor(scenario.severity)}>
                  {scenario.severity}
                </Badge>
              </div>
              <Button 
                size="sm" 
                className="w-full"
                onClick={() => onStartScenario?.(scenario.id)}
              >
                Launch Scenario
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!simulationActive) {
    return (
      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            🛡️ Security Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto">
              <Shield className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-green-700">All Clear</h3>
              <p className="text-sm text-muted-foreground">
                No active security incidents detected. Your API is operating normally.
              </p>
            </div>
            <div className="text-xs text-muted-foreground">
              Waiting for facilitator to start scenario...
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentScenario) {
    return (
      <Card className="h-fit border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="text-center text-red-700">
            Unknown scenario active
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`h-fit ${isResolved ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
      <CardHeader>
        <CardTitle className={`flex items-center gap-2 ${isResolved ? 'text-green-800' : 'text-red-800'}`}>
          {isResolved ? (
            <>
              <CheckCircle className="w-5 h-5" />
              ✅ INCIDENT RESOLVED
            </>
          ) : (
            <>
              <AlertTriangle className="w-5 h-5" />
              🚨 ACTIVE INCIDENT
            </>
          )}
        </CardTitle>
        <CardDescription className={isResolved ? 'text-green-700' : 'text-red-700'}>
          {isResolved 
            ? `Security issue successfully mitigated by ${resolvedBy || 'team'}`
            : 'Security breach in progress - immediate attention required'
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Incident Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{currentScenario.emoji}</span>
            <div>
              <h3 className="font-bold text-red-800">{currentScenario.title}</h3>
              <Badge variant={getSeverityColor(currentScenario.severity)}>
                {currentScenario.severity} Severity
              </Badge>
            </div>
          </div>
          <p className="text-sm text-red-700">{currentScenario.description}</p>
        </div>

        {/* Impact Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded p-2 border border-red-200">
            <div className="flex items-center gap-1">
              <DollarSign className="w-3 h-3 text-red-600" />
              <span className="text-xs font-semibold text-red-800">Est. Loss</span>
            </div>
            <div className="text-sm font-bold text-red-600">{currentScenario.estimatedLoss}</div>
          </div>
          
          <div className="bg-white rounded p-2 border border-red-200">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-red-600" />
              <span className="text-xs font-semibold text-red-800">Detection Time</span>
            </div>
            <div className="text-sm font-bold text-red-600">{currentScenario.timeToDetect}</div>
          </div>
          
          <div className="bg-white rounded p-2 border border-red-200 col-span-2">
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3 text-red-600" />
              <span className="text-xs font-semibold text-red-800">Affected Users</span>
            </div>
            <div className="text-sm font-bold text-red-600">{currentScenario.affectedUsers}</div>
          </div>
        </div>

        {/* Context */}
        <div className="bg-white rounded p-3 border border-red-200">
          <h4 className="font-semibold text-red-800 mb-2 flex items-center gap-1">
            <Eye className="w-4 h-4" />
            What We Know
          </h4>
          <p className="text-xs text-red-700">{currentScenario.context}</p>
        </div>

        {/* Objectives */}
        <div className="bg-white rounded p-3 border border-red-200">
          <h4 className="font-semibold text-red-800 mb-2 flex items-center gap-1">
            <Target className="w-4 h-4" />
            Investigation Objectives
          </h4>
          <ul className="space-y-1">
            {currentScenario.objectives.map((objective, index) => (
              <li key={index} className="text-xs text-red-700 flex items-start gap-1">
                <span className="w-1 h-1 bg-red-600 rounded-full mt-2 flex-shrink-0"></span>
                {objective}
              </li>
            ))}
          </ul>
        </div>

        {/* Progress */}
        <div className="bg-white rounded p-3 border border-red-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-red-800">Investigation Progress</span>
            <span className="text-xs text-red-600">{getStepProgress()}%</span>
          </div>
          <div className="w-full bg-red-200 rounded-full h-2">
            <div 
              className="bg-red-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${getStepProgress()}%` }}
            ></div>
          </div>
        </div>

        {isResolved ? (
          <Alert className="border-green-300 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>✅ Mission Complete:</strong> The security issue has been successfully resolved through policy configuration. 
              Great work identifying and mitigating the threat!
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="border-orange-300 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>Your Mission:</strong> Use the Dashboard and Log Stream to investigate this incident, 
              then apply fixes through the API Policy Manager to resolve the issue!
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}