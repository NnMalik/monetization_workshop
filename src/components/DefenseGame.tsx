import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { 
  Shield, 
  Target, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Award,
  ArrowRight,
  Eye,
  AlertTriangle,
  Lock,
  Settings,
  Zap
} from 'lucide-react';

interface DefenseGameProps {
  simulationActive: boolean;
  scenarioId?: string;
  attackId?: string;
  userSession: any;
  onComplete: () => void;
}

interface DefenseStep {
  id: string;
  title: string;
  description: string;
  type: 'multiple-choice' | 'checklist' | 'configuration';
  points: number;
  options?: Array<{
    id: string;
    label: string;
    description?: string;
    correct?: boolean;
  }>;
  correctAnswers?: string[];
  completed?: boolean;
  userAnswer?: any;
}

export function DefenseGame({ 
  simulationActive, 
  scenarioId, 
  attackId,
  userSession, 
  onComplete 
}: DefenseGameProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<DefenseStep[]>([]);
  const [totalScore, setTotalScore] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate steps based on scenario
  useEffect(() => {
    if (!simulationActive || !scenarioId) {
      setSteps([]);
      return;
    }

    const gameSteps = generateDefenseSteps(scenarioId);
    setSteps(gameSteps);
    setCurrentStep(0);
    setTotalScore(0);
    setGameCompleted(false);
  }, [simulationActive, scenarioId]);

  const generateDefenseSteps = (scenario: string): DefenseStep[] => {
    switch (scenario) {
      case 'free-tier-exploit':
        return [
          {
            id: 'identify-pattern',
            title: '🔍 Step 1: Identify the Attack Pattern',
            description: 'Based on the logs, what suspicious behavior indicates a free tier exploit?',
            type: 'multiple-choice',
            points: 25,
            options: [
              { id: 'high-usage', label: 'High API usage from premium accounts', correct: false },
              { id: 'multiple-accounts', label: 'Multiple accounts from same IPs, stopping at 999 calls', correct: true, description: 'Attackers create many accounts to bypass per-account limits' },
              { id: 'invalid-keys', label: 'Invalid API keys being used', correct: false },
              { id: 'slow-requests', label: 'Unusually slow request patterns', correct: false }
            ]
          },
          {
            id: 'analyze-method',
            title: '🎯 Step 2: Understand the Exploitation Method',
            description: 'How are attackers bypassing the free tier limits?',
            type: 'checklist',
            points: 25,
            options: [
              { id: 'account-creation', label: 'Creating multiple fake accounts', correct: true },
              { id: 'automation', label: 'Using automated scripts/bots', correct: true },
              { id: 'temp-emails', label: 'Using temporary email services', correct: true },
              { id: 'vpn-rotation', label: 'Constantly changing VPN locations', correct: false }
            ],
            correctAnswers: ['account-creation', 'automation', 'temp-emails']
          },
          {
            id: 'choose-defense',
            title: '🛡️ Step 3: Select Appropriate Defenses',
            description: 'What defensive measures will stop this attack?',
            type: 'checklist',
            points: 50,
            options: [
              { id: 'ip-rate-limit', label: 'Change rate limiting from per-account to per-IP', correct: true },
              { id: 'behavioral-analysis', label: 'Enable behavioral analysis detection', correct: true },
              { id: 'increase-limits', label: 'Increase free tier limits', correct: false },
              { id: 'remove-free-tier', label: 'Remove free tier completely', correct: false },
              { id: 'email-verification', label: 'Require verified email domains', correct: true }
            ],
            correctAnswers: ['ip-rate-limit', 'behavioral-analysis', 'email-verification']
          },
          {
            id: 'configure-policy',
            title: '⚙️ Step 4: Configure Rate Limiting Policy',
            description: 'Set the optimal rate limiting configuration:',
            type: 'configuration',
            points: 50,
            options: [
              { id: 'per-ip-1000', label: '1000 requests per IP per day', correct: true },
              { id: 'per-ip-500', label: '500 requests per IP per day', correct: false },
              { id: 'per-account-unlimited', label: 'Unlimited per account', correct: false },
              { id: 'per-ip-100', label: '100 requests per IP per day', correct: false }
            ]
          }
        ];

      case 'credential-sharing':
        return [
          {
            id: 'identify-sharing',
            title: '🌍 Step 1: Identify Geographic Impossibilities',
            description: 'What pattern in the logs indicates credential sharing?',
            type: 'multiple-choice',
            points: 30,
            options: [
              { id: 'slow-requests', label: 'Slow API response times', correct: false },
              { id: 'impossible-travel', label: 'Same API key active in multiple countries simultaneously', correct: true, description: 'Impossible travel time between locations' },
              { id: 'high-volume', label: 'High volume of API calls', correct: false },
              { id: 'weekend-usage', label: 'Usage during weekend hours', correct: false }
            ]
          },
          {
            id: 'analyze-scale',
            title: '📊 Step 2: Assess the Scale of Sharing',
            description: 'How widespread is the credential sharing?',
            type: 'multiple-choice',
            points: 20,
            options: [
              { id: 'single-user', label: 'Single user sharing with family', correct: false },
              { id: 'small-team', label: 'Small team of 3-5 people', correct: false },
              { id: 'large-network', label: '24+ countries active simultaneously', correct: true, description: 'Massive sharing network, likely commercial' },
              { id: 'automated-bot', label: 'Automated bot network', correct: false }
            ]
          },
          {
            id: 'select-controls',
            title: '🔒 Step 3: Implement Access Controls',
            description: 'Which controls will prevent credential sharing?',
            type: 'checklist',
            points: 75,
            options: [
              { id: 'concurrent-sessions', label: 'Limit concurrent sessions per API key', correct: true },
              { id: 'geographic-validation', label: 'Enable geographic validation rules', correct: true },
              { id: 'increase-pricing', label: 'Increase API pricing', correct: false },
              { id: 'require-2fa', label: 'Require 2FA for all accounts', correct: true },
              { id: 'ban-countries', label: 'Ban entire countries', correct: false }
            ],
            correctAnswers: ['concurrent-sessions', 'geographic-validation', 'require-2fa']
          },
          {
            id: 'configure-limits',
            title: '⚙️ Step 4: Set Session Limits',
            description: 'Configure appropriate concurrent session limits:',
            type: 'configuration',
            points: 75,
            options: [
              { id: 'sessions-3', label: 'Maximum 3 concurrent sessions', correct: true },
              { id: 'sessions-10', label: 'Maximum 10 concurrent sessions', correct: false },
              { id: 'sessions-unlimited', label: 'Unlimited sessions', correct: false },
              { id: 'sessions-1', label: 'Only 1 session allowed', correct: false }
            ]
          }
        ];

      case 'shadow-endpoint':
        return [
          {
            id: 'identify-endpoint',
            title: '👻 Step 1: Identify Unauthorized Access',
            description: 'What indicates access to shadow endpoints?',
            type: 'multiple-choice',
            points: 40,
            options: [
              { id: 'high-latency', label: 'High response latency', correct: false },
              { id: 'debug-endpoints', label: 'Access to /api/internal/debug and /dev/backdoor', correct: true, description: 'Development endpoints accessible in production' },
              { id: 'invalid-data', label: 'Invalid data in requests', correct: false },
              { id: 'weekend-access', label: 'Access during weekends', correct: false }
            ]
          },
          {
            id: 'understand-risk',
            title: '⚠️ Step 2: Assess Security Risk',
            description: 'Why are these endpoints dangerous?',
            type: 'checklist',
            points: 30,
            options: [
              { id: 'no-auth', label: 'No authentication required', correct: true },
              { id: 'internal-data', label: 'Expose internal system data', correct: true },
              { id: 'debug-info', label: 'Reveal debugging information', correct: true },
              { id: 'slow-performance', label: 'Cause slow performance', correct: false }
            ],
            correctAnswers: ['no-auth', 'internal-data', 'debug-info']
          },
          {
            id: 'implement-security',
            title: '🔐 Step 3: Secure the Endpoints',
            description: 'How should these endpoints be protected?',
            type: 'checklist',
            points: 60,
            options: [
              { id: 'apply-auth', label: 'Apply authentication policies', correct: true },
              { id: 'whitelist-endpoints', label: 'Implement endpoint whitelisting', correct: true },
              { id: 'remove-debug', label: 'Remove debug endpoints from production', correct: true },
              { id: 'slow-responses', label: 'Make endpoints respond slowly', correct: false },
              { id: 'log-access', label: 'Enhanced logging for endpoint access', correct: true }
            ],
            correctAnswers: ['apply-auth', 'whitelist-endpoints', 'remove-debug', 'log-access']
          },
          {
            id: 'configure-whitelist',
            title: '📋 Step 4: Configure Endpoint Policy',
            description: 'Set the endpoint access policy:',
            type: 'configuration',
            points: 70,
            options: [
              { id: 'whitelist-production', label: 'Only allow whitelisted production endpoints', correct: true },
              { id: 'blacklist-debug', label: 'Only blacklist debug endpoints', correct: false },
              { id: 'allow-all', label: 'Allow all endpoints with warnings', correct: false },
              { id: 'require-admin', label: 'Require admin approval for all endpoints', correct: false }
            ]
          }
        ];

      case 'usage-laundering':
        return [
          {
            id: 'identify-laundering',
            title: '💰 Step 1: Identify Usage Laundering',
            description: 'What indicates commercial API reselling?',
            type: 'multiple-choice',
            points: 35,
            options: [
              { id: 'high-weekend', label: 'High usage on weekends', correct: false },
              { id: 'batch-manipulation', label: '100 operations in batch requests billed as 1', correct: true, description: 'Exploiting batch pricing for commercial advantage' },
              { id: 'slow-requests', label: 'Intentionally slow requests', correct: false },
              { id: 'random-data', label: 'Random data in requests', correct: false }
            ]
          },
          {
            id: 'analyze-scale',
            title: '📈 Step 2: Analyze Business Impact',
            description: 'What confirms commercial reselling operation?',
            type: 'checklist',
            points: 35,
            options: [
              { id: 'flat-usage', label: '24/7 perfectly flat usage pattern', correct: true },
              { id: 'customer-ids', label: '800+ end customer IDs detected', correct: true },
              { id: 'revenue-loss', label: 'Significant revenue vs usage discrepancy', correct: true },
              { id: 'geographic-spread', label: 'Requests from many countries', correct: false }
            ],
            correctAnswers: ['flat-usage', 'customer-ids', 'revenue-loss']
          },
          {
            id: 'business-response',
            title: '⚖️ Step 3: Business Policy Response',
            description: 'What business actions are appropriate?',
            type: 'checklist',
            points: 65,
            options: [
              { id: 'anomaly-detection', label: 'Enable AI-powered anomaly detection', correct: true },
              { id: 'review-terms', label: 'Review Terms of Service compliance', correct: true },
              { id: 'fair-pricing', label: 'Implement fair usage pricing', correct: true },
              { id: 'ban-immediately', label: 'Immediately ban the account', correct: false },
              { id: 'ignore-issue', label: 'Ignore as it generates revenue', correct: false }
            ],
            correctAnswers: ['anomaly-detection', 'review-terms', 'fair-pricing']
          },
          {
            id: 'configure-detection',
            title: '🤖 Step 4: Configure Anomaly Detection',
            description: 'Set the detection sensitivity:',
            type: 'configuration',
            points: 65,
            options: [
              { id: 'high-sensitivity', label: 'High sensitivity for commercial patterns', correct: true },
              { id: 'medium-sensitivity', label: 'Medium sensitivity', correct: false },
              { id: 'low-sensitivity', label: 'Low sensitivity', correct: false },
              { id: 'disabled', label: 'Disabled detection', correct: false }
            ]
          }
        ];

      default:
        return [];
    }
  };

  const handleAnswer = async (stepIndex: number, answer: any) => {
    const step = steps[stepIndex];
    const updatedSteps = [...steps];
    updatedSteps[stepIndex] = { ...step, userAnswer: answer };
    setSteps(updatedSteps);

    // Calculate points for this step
    let earnedPoints = 0;
    if (step.type === 'multiple-choice') {
      const selectedOption = step.options?.find(opt => opt.id === answer);
      if (selectedOption?.correct) {
        earnedPoints = step.points;
      }
    } else if (step.type === 'checklist') {
      const correctAnswers = step.correctAnswers || [];
      const userAnswers = answer || [];
      const correctCount = userAnswers.filter((ans: string) => correctAnswers.includes(ans)).length;
      const incorrectCount = userAnswers.filter((ans: string) => !correctAnswers.includes(ans)).length;
      const accuracy = correctCount / correctAnswers.length;
      const penalty = incorrectCount * 0.1; // Small penalty for wrong answers
      earnedPoints = Math.max(0, Math.round(step.points * accuracy - penalty));
    } else if (step.type === 'configuration') {
      const selectedOption = step.options?.find(opt => opt.id === answer);
      if (selectedOption?.correct) {
        earnedPoints = step.points;
      }
    }

    // Update score in backend
    if (earnedPoints > 0 && attackId) {
      try {
        await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-af10fea3/scores/update`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            sessionId: userSession.sessionId,
            attackId,
            stepId: step.id,
            points: earnedPoints
          }),
        });
      } catch (error) {
        console.error('Failed to update score:', error);
      }
    }

    updatedSteps[stepIndex].completed = true;
    setSteps(updatedSteps);
    setTotalScore(prev => prev + earnedPoints);
  };

  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeGame();
    }
  };

  const completeGame = async () => {
    setIsSubmitting(true);
    try {
      // Mark participant as completed for this attack
      if (attackId) {
        await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-af10fea3/participant/complete`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            sessionId: userSession.sessionId,
            attackId
          }),
        });
      }

      setGameCompleted(true);
      onComplete();
    } catch (error) {
      console.error('Failed to complete game:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!simulationActive) {
    return (
      <div className="space-y-4">
        <Card className="text-center py-8">
          <CardContent>
            <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Defense Training Ready</h3>
            <p className="text-muted-foreground">
              When a security incident is launched, you'll use this interface to analyze the threat and implement defensive measures.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (gameCompleted) {
    return (
      <div className="space-y-4">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="text-center py-8">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-600" />
            <h3 className="text-2xl font-semibold text-green-800 mb-2">Threat Neutralized!</h3>
            <p className="text-green-700 mb-4">
              You successfully defended against the {scenarioId?.replace('-', ' ')} attack and earned <strong>{totalScore} points</strong>!
            </p>
            <Badge variant="outline" className="text-green-700 border-green-300">
              <Award className="w-4 h-4 mr-1" />
              Mission Complete
            </Badge>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-600 to-orange-600 rounded-full mx-auto">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">🛡️ Defense Protocol</h1>
          <p className="text-muted-foreground">
            Analyze the threat and implement defensive countermeasures
          </p>
        </div>
      </div>

      {/* Progress */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Mission Progress</CardTitle>
            <Badge variant="outline">{currentStep + 1} of {steps.length}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={progress} className="mb-2" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Current Score: {totalScore} points</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
        </CardContent>
      </Card>

      {/* Current Step */}
      {currentStepData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              {currentStepData.title}
            </CardTitle>
            <CardDescription>
              {currentStepData.description}
            </CardDescription>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{currentStepData.points} points</Badge>
              <Badge variant="outline">{currentStepData.type}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentStepData.type === 'multiple-choice' && (
              <RadioGroup
                value={currentStepData.userAnswer || ''}
                onValueChange={(value) => handleAnswer(currentStep, value)}
              >
                {currentStepData.options?.map((option) => (
                  <div key={option.id} className="flex items-start space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                    <RadioGroupItem value={option.id} id={option.id} className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor={option.id} className="cursor-pointer">
                        {option.label}
                      </Label>
                      {option.description && (
                        <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </RadioGroup>
            )}

            {currentStepData.type === 'checklist' && (
              <div className="space-y-3">
                {currentStepData.options?.map((option) => (
                  <div key={option.id} className="flex items-start space-x-2 p-3 border rounded-lg">
                    <Checkbox
                      id={option.id}
                      checked={(currentStepData.userAnswer || []).includes(option.id)}
                      onCheckedChange={(checked) => {
                        const currentAnswers = currentStepData.userAnswer || [];
                        const newAnswers = checked
                          ? [...currentAnswers, option.id]
                          : currentAnswers.filter((id: string) => id !== option.id);
                        handleAnswer(currentStep, newAnswers);
                      }}
                    />
                    <div className="flex-1">
                      <Label htmlFor={option.id} className="cursor-pointer">
                        {option.label}
                      </Label>
                      {option.description && (
                        <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {currentStepData.type === 'configuration' && (
              <RadioGroup
                value={currentStepData.userAnswer || ''}
                onValueChange={(value) => handleAnswer(currentStep, value)}
              >
                {currentStepData.options?.map((option) => (
                  <div key={option.id} className="flex items-start space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                    <RadioGroupItem value={option.id} id={option.id} className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor={option.id} className="cursor-pointer flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        {option.label}
                      </Label>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            )}

            {currentStepData.userAnswer && (
              <div className="flex justify-end">
                <Button 
                  onClick={handleNextStep}
                  disabled={isSubmitting}
                  className="flex items-center gap-2"
                >
                  {currentStep === steps.length - 1 ? (
                    <>
                      <Zap className="w-4 h-4" />
                      {isSubmitting ? 'Completing...' : 'Complete Mission'}
                    </>
                  ) : (
                    <>
                      Next Step
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Alert>
        <Eye className="h-4 w-4" />
        <AlertDescription>
          <strong>💡 Defense Strategy:</strong> Use the Live Logs and Dashboard insights to make informed decisions. 
          Each correct answer earns points, and completing the full defensive protocol will neutralize the threat!
        </AlertDescription>
      </Alert>
    </div>
  );
}