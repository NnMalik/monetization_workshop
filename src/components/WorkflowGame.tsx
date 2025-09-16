import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Progress } from './ui/progress';
import { Textarea } from './ui/textarea';
import { 
  Gamepad2, 
  Target, 
  Code, 
  CheckCircle, 
  XCircle, 
  ArrowRight,
  Trophy,
  Zap,
  Shield,
  DollarSign,
  Clock,
  AlertTriangle,
  Lightbulb,
  Star
} from 'lucide-react';

interface GameStep {
  id: string;
  title: string;
  description: string;
  scenario: string;
  type: 'choice' | 'code' | 'analysis';
  options?: {
    id: string;
    text: string;
    points: number;
    feedback: string;
    isCorrect: boolean;
  }[];
  codeExample?: string;
  codeSolution?: string;
  nextStep?: string;
  points: number;
}

interface Mission {
  id: string;
  title: string;
  emoji: string;
  difficulty: 'Rookie' | 'Veteran' | 'Expert';
  description: string;
  totalPoints: number;
  steps: GameStep[];
}

export function WorkflowGame() {
  const [currentMission, setCurrentMission] = useState<Mission | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [userScore, setUserScore] = useState(0);
  const [completedMissions, setCompletedMissions] = useState<string[]>([]);
  const [userCodeInput, setUserCodeInput] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [lastFeedback, setLastFeedback] = useState('');
  const [lastPoints, setLastPoints] = useState(0);

  const updateScore = async (points: number) => {
    try {
      // Get session from localStorage (set during login)
      const sessionId = localStorage.getItem('workshop_session_id');
      if (!sessionId || !currentMission) return;

      const projectId = window.location.hostname.split('.')[0];
      const publicAnonKey = 'your-public-anon-key'; // This should be imported properly
      
      await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-af10fea3/scores/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          sessionId,
          missionId: currentMission.id,
          stepId: currentMission.steps[currentStepIndex].id,
          points
        }),
      });
    } catch (error) {
      console.log('Score update failed:', error);
    }
  };

  const missions: Mission[] = [
    {
      id: 'free-tier-exploit',
      title: 'The Free Tier Frenzy',
      emoji: '🆓',
      difficulty: 'Rookie',
      description: 'Attackers are exploiting your free tier by creating fake accounts and using automation!',
      totalPoints: 120,
      steps: [
        {
          id: 'detect',
          title: 'Something Smells Fishy! 🐟',
          description: 'Your free tier usage just went through the roof!',
          scenario: 'Your free tier allows 1,000 API calls per month per user. Suddenly, you have 500 new "users" all making exactly 999 calls per month, all using similar patterns and timing. Your infrastructure costs are spiking but revenue is flat.',
          type: 'choice',
          options: [
            {
              id: 'celebrate',
              text: '🎉 Celebrate! More users means more growth!',
              points: 0,
              feedback: 'Hold your horses! These "users" are costing you money without paying. You just lost $2,000 in compute costs!',
              isCorrect: false
            },
            {
              id: 'ban-all',
              text: '🔨 Ban all new accounts created in the last week',
              points: 15,
              feedback: 'Nuclear option! You stopped the attack but also banned 50 legitimate users who just signed up.',
              isCorrect: false
            },
            {
              id: 'analyze-patterns',
              text: '🔍 Analyze signup and usage patterns for anomalies',
              points: 45,
              feedback: 'Smart detective work! Let\'s dig into what makes these accounts suspicious.',
              isCorrect: true
            }
          ],
          points: 45
        },
        {
          id: 'investigation',
          title: 'The Plot Thickens! 🕵️‍♀️',
          description: 'Time to uncover the exploit method!',
          scenario: 'Investigation reveals: 1) All accounts created with temporary email services, 2) IP addresses rotate but follow geographic patterns, 3) API usage stops at exactly 999 calls (1 under the limit), 4) All accounts access expensive ML endpoints exclusively.',
          type: 'choice',
          options: [
            {
              id: 'lower-limits',
              text: '📉 Reduce free tier limits to 100 calls/month',
              points: 20,
              feedback: 'This hurts legitimate users more than attackers. They\'ll just create 10x more accounts!',
              isCorrect: false
            },
            {
              id: 'email-verification',
              text: '📧 Require real email verification and phone numbers',
              points: 35,
              feedback: 'Good start! But sophisticated attackers can still bypass this. Need more layers.',
              isCorrect: false
            },
            {
              id: 'behavior-analysis',
              text: '🧠 Implement behavioral analysis and usage fingerprinting',
              points: 75,
              feedback: 'Excellent! You\'re fighting smart by looking at HOW they use the API, not just WHO they are.',
              isCorrect: true
            }
          ],
          points: 75
        }
      ]
    },
    {
      id: 'credential-sharing',
      title: 'The Credential Sharing Conspiracy',
      emoji: '🔑',
      difficulty: 'Veteran',
      description: 'Premium API keys are being shared on underground forums and Telegram channels!',
      totalPoints: 160,
      steps: [
        {
          id: 'discovery',
          title: 'Houston, We Have a Revenue Problem! 🚀',
          description: 'Usage is up, but money is not!',
          scenario: 'Your premium customer "TechCorp" pays $500/month for 100K API calls. But their key is being used for 500K calls from 50+ different applications across 6 continents. Someone is clearly sharing or selling access.',
          type: 'choice',
          options: [
            {
              id: 'email-customer',
              text: '📧 Email the customer asking about unusual usage',
              points: 15,
              feedback: 'Professional approach! But they might not even know their credentials are compromised.',
              isCorrect: false
            },
            {
              id: 'revoke-immediately',
              text: '🔥 Immediately revoke the API key',
              points: 25,
              feedback: 'Fast action! But what if it\'s a false positive? You just killed a paying customer\'s service.',
              isCorrect: false
            },
            {
              id: 'gather-intelligence',
              text: '🕵️ Gather more intelligence before taking action',
              points: 55,
              feedback: 'Wise! Evidence first, action second. Let\'s build a case and understand the scope.',
              isCorrect: true
            }
          ],
          points: 55
        },
        {
          id: 'implement-tracking',
          title: 'Time to Get Sherlock Holmes! 🔍',
          description: 'Implement advanced credential tracking!',
          scenario: 'You\'ve confirmed the key is being shared. Now you need to implement real-time detection to catch future credential sharing without impacting legitimate distributed teams.',
          type: 'code',
          codeExample: `// Basic API key validation
function validateApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  
  if (!isValidKey(apiKey)) {
    return res.status(401).json({ error: 'Invalid API key' });
  }
  
  // Track usage
  incrementUsage(apiKey);
  next();
}`,
          codeSolution: `// Advanced credential sharing detection
const Redis = require('redis');
const redis = Redis.createClient();

async function validateApiKeyWithTracking(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  const userAgent = req.headers['user-agent'];
  const ip = req.ip;
  const timestamp = Date.now();
  
  if (!isValidKey(apiKey)) {
    return res.status(401).json({ error: 'Invalid API key' });
  }
  
  // Create session fingerprint
  const fingerprint = crypto.createHash('md5')
    .update(userAgent + ip + req.headers['accept-language'])
    .digest('hex');
  
  // Track session data
  const sessionKey = \`session:\${apiKey}:\${fingerprint}\`;
  const sessionData = {
    ip,
    userAgent,
    lastSeen: timestamp,
    requestCount: 1,
    locations: [await getGeoLocation(ip)]
  };
  
  const existingSession = await redis.get(sessionKey);
  if (existingSession) {
    const parsed = JSON.parse(existingSession);
    sessionData.requestCount = parsed.requestCount + 1;
    sessionData.locations = [...new Set([...parsed.locations, sessionData.locations[0]])];
  }
  
  await redis.setex(sessionKey, 86400, JSON.stringify(sessionData)); // 24 hour expiry
  
  // Get all sessions for this API key
  const allSessions = await redis.keys(\`session:\${apiKey}:*\`);
  const sessionCount = allSessions.length;
  
  // Check for suspicious patterns
  if (sessionCount > 10) { // More than 10 distinct sessions
    const allSessionData = await Promise.all(
      allSessions.map(key => redis.get(key).then(data => JSON.parse(data)))
    );
    
    // Check geographic impossibility
    const recentSessions = allSessionData.filter(
      session => timestamp - session.lastSeen < 3600000 // Last hour
    );
    
    const uniqueCountries = new Set(
      recentSessions.map(session => session.locations[0]?.country).filter(Boolean)
    );
    
    if (uniqueCountries.size > 3) { // Active in 3+ countries simultaneously
      await logSuspiciousActivity(apiKey, {
        type: 'GEOGRAPHIC_IMPOSSIBILITY',
        sessionCount,
        countries: Array.from(uniqueCountries),
        fingerprints: recentSessions.length
      });
      
      return res.status(429).json({
        error: 'Unusual usage pattern detected',
        message: 'API key active in multiple geographic regions simultaneously',
        contact: 'security@yourapi.com'
      });
    }
  }
  
  incrementUsage(apiKey);
  next();
}

async function getGeoLocation(ip) {
  // Implement IP geolocation lookup
  // Return { country, city, timezone }
}

async function logSuspiciousActivity(apiKey, details) {
  // Log to security monitoring system
  console.log('SECURITY ALERT:', { apiKey, ...details });
}`,
          points: 105
        }
      ]
    },
    {
      id: 'shadow-endpoint',
      title: 'The Ghost in the Machine',
      emoji: '👻',
      difficulty: 'Expert',
      description: 'Attackers found your internal debug endpoints and are using them to bypass billing!',
      totalPoints: 180,
      steps: [
        {
          id: 'mystery',
          title: 'The Mysterious Resource Drain! 🔮',
          description: 'Your servers are working hard, but why?',
          scenario: 'Your infrastructure costs doubled overnight, but your main API metrics look normal. CPU usage is high, database queries are spiking, but your billing system shows no increase in legitimate API usage. Something is consuming resources outside your monitoring!',
          type: 'choice',
          options: [
            {
              id: 'scale-up',
              text: '💪 Scale up infrastructure to handle the load',
              points: 10,
              feedback: 'That\'s like putting a band-aid on a bullet wound! You\'re just feeding the attackers more resources.',
              isCorrect: false
            },
            {
              id: 'blame-users',
              text: '👥 Assume legitimate users are just using more resources',
              points: 5,
              feedback: 'Dangerous assumption! Meanwhile, attackers are having a field day with your resources.',
              isCorrect: false
            },
            {
              id: 'deep-investigation',
              text: '🔍 Investigate all endpoints and traffic patterns',
              points: 65,
              feedback: 'Detective mode activated! Time to find out where these ghost requests are coming from.',
              isCorrect: true
            }
          ],
          points: 65
        },
        {
          id: 'endpoint-audit',
          title: 'Ghost Hunting Time! 👻',
          description: 'Audit all your endpoints and secure the shadows!',
          scenario: 'You discovered requests to /api/internal/debug, /admin/test, and /dev/backdoor - endpoints that aren\'t in your documentation! Attackers found old development endpoints through directory scanning and are using them to access premium features without authentication.',
          type: 'code',
          codeExample: `// Current routing (vulnerable)
app.get('/api/v1/data', authenticate, rateLimit, getData);
app.get('/api/v1/premium', authenticate, premiumOnly, getPremiumData);

// These debug endpoints were forgotten!
app.get('/api/internal/debug', debugHandler);
app.get('/admin/test', testHandler);
app.get('/dev/backdoor', devHandler);`,
          codeSolution: `// Secure endpoint management with whitelist approach
const express = require('express');
const app = express();

// Middleware to log and block unknown endpoints
function endpointWhitelist(req, res, next) {
  const allowedEndpoints = [
    '/api/v1/data',
    '/api/v1/premium',
    '/api/v1/auth',
    '/api/v1/health'
  ];
  
  const requestedPath = req.path;
  
  // Check if the endpoint is in our whitelist
  const isAllowed = allowedEndpoints.some(endpoint => 
    requestedPath.startsWith(endpoint)
  );
  
  if (!isAllowed) {
    // Log suspicious access attempt
    console.log('SECURITY: Unauthorized endpoint access', {
      path: requestedPath,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      timestamp: new Date().toISOString()
    });
    
    // Return generic 404 to not reveal endpoint existence
    return res.status(404).json({ 
      error: 'Endpoint not found',
      message: 'The requested resource does not exist'
    });
  }
  
  next();
}

// Apply whitelist to all routes
app.use(endpointWhitelist);

// Secure route definitions
app.get('/api/v1/data', authenticate, rateLimit, auditLog, getData);
app.get('/api/v1/premium', authenticate, premiumOnly, auditLog, getPremiumData);

// Remove all debug/internal endpoints from production
if (process.env.NODE_ENV === 'development') {
  // Only enable debug endpoints in development
  app.get('/api/internal/debug', authenticate, adminOnly, debugHandler);
}

// Audit middleware to track all legitimate API usage
function auditLog(req, res, next) {
  const auditData = {
    endpoint: req.path,
    method: req.method,
    user: req.user?.id,
    timestamp: new Date().toISOString(),
    ip: req.ip
  };
  
  // Log to secure audit system
  logAuditEvent(auditData);
  next();
}

// Health check for monitoring
app.get('/api/v1/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: process.env.API_VERSION 
  });
});`,
          points: 115
        }
      ]
    },
    {
      id: 'usage-laundering',
      title: 'The Usage Laundromat',
      emoji: '🎭',
      difficulty: 'Expert',
      description: 'Clever users are manipulating request patterns to pay less while using more!',
      totalPoints: 170,
      steps: [
        {
          id: 'revenue-mystery',
          title: 'The Case of the Shrinking Revenue! 💸',
          description: 'Something is not adding up in your books!',
          scenario: 'Your API usage looks normal at first glance - requests are steady, error rates are low. But revenue per API call has dropped 40% over 3 months. Users seem to be gaming your pricing tiers through clever request structuring and batching techniques.',
          type: 'choice',
          options: [
            {
              id: 'raise-prices',
              text: '💰 Raise prices across the board',
              points: 10,
              feedback: 'Blunt instrument! You\'ll lose legitimate customers while the clever attackers adapt their methods.',
              isCorrect: false
            },
            {
              id: 'change-pricing',
              text: '🔄 Completely overhaul the pricing model',
              points: 25,
              feedback: 'Major changes might fix it, but could also disrupt your entire customer base. Risky move!',
              isCorrect: false
            },
            {
              id: 'analyze-patterns',
              text: '📊 Deep dive into usage patterns and pricing anomalies',
              points: 60,
              feedback: 'Perfect! Understanding the problem before solutions. Let\'s see how they\'re gaming the system.',
              isCorrect: true
            }
          ],
          points: 60
        },
        {
          id: 'pattern-detection',
          title: 'Unmasking the Laundry Operation! 🎭',
          description: 'Implement smart detection for usage manipulation!',
          scenario: 'You\'ve discovered users are: 1) Batching 100 requests into single "batch" endpoints to pay batch rates, 2) Using timer delays to spread requests across billing periods, 3) Switching between accounts to reset usage tiers. Time to build detection!',
          type: 'code',
          codeExample: `// Current simple pricing
function calculateCost(endpoint, requestCount) {
  const rates = {
    '/api/basic': 0.01,
    '/api/premium': 0.10,
    '/api/batch': 0.05  // Cheaper per individual operation
  };
  
  return rates[endpoint] * requestCount;
}`,
          codeSolution: `// Smart usage pattern detection and fair billing
const Redis = require('redis');
const redis = Redis.createClient();

class UsageLaunderingDetector {
  async analyzeAndBill(userId, endpoint, requestData) {
    const now = Date.now();
    const userKey = \`usage:\${userId}\`;
    
    // Track usage patterns
    await this.trackUsagePattern(userId, endpoint, requestData, now);
    
    // Detect suspicious patterns
    const suspiciousScore = await this.calculateSuspicionScore(userId, now);
    
    if (suspiciousScore > 0.7) {
      // Apply fair usage billing instead of manipulated rates
      return await this.applyFairUsageBilling(userId, endpoint, requestData);
    }
    
    return this.standardBilling(endpoint, requestData);
  }
  
  async trackUsagePattern(userId, endpoint, requestData, timestamp) {
    const patternKey = \`pattern:\${userId}\`;
    
    const pattern = {
      endpoint,
      timestamp,
      requestSize: requestData.batchSize || 1,
      actualOperations: this.estimateActualOperations(requestData),
      billingPeriod: this.getCurrentBillingPeriod(timestamp)
    };
    
    // Store last 100 patterns
    await redis.lpush(patternKey, JSON.stringify(pattern));
    await redis.ltrim(patternKey, 0, 99);
    await redis.expire(patternKey, 86400 * 30); // 30 days
  }
  
  async calculateSuspicionScore(userId, now) {
    const patternKey = \`pattern:\${userId}\`;
    const patterns = await redis.lrange(patternKey, 0, -1);
    
    if (patterns.length < 10) return 0;
    
    const parsedPatterns = patterns.map(p => JSON.parse(p));
    let suspicionScore = 0;
    
    // Check for batch manipulation
    const batchRatio = parsedPatterns.filter(p => p.requestSize > 10).length / patterns.length;
    if (batchRatio > 0.8) suspicionScore += 0.3; // 80% batch requests is suspicious
    
    // Check for timing manipulation
    const recentHour = now - 3600000;
    const recentPatterns = parsedPatterns.filter(p => p.timestamp > recentHour);
    const avgInterval = this.calculateAverageInterval(recentPatterns);
    
    if (avgInterval > 3300000 && avgInterval < 3900000) { // ~1 hour intervals
      suspicionScore += 0.4; // Timing to game billing periods
    }
    
    // Check for account switching patterns
    const accountSwitchingScore = await this.detectAccountSwitching(userId);
    suspicionScore += accountSwitchingScore;
    
    return Math.min(suspicionScore, 1.0);
  }
  
  async detectAccountSwitching(userId) {
    // Look for similar usage patterns across different user accounts
    // This would involve analyzing fingerprints, IP addresses, and usage patterns
    // across multiple accounts to detect coordinated gaming
    const fingerprint = await this.getUserFingerprint(userId);
    const similarAccounts = await this.findSimilarAccounts(fingerprint);
    
    if (similarAccounts.length > 2) {
      return 0.3; // Multiple similar accounts suggests coordination
    }
    
    return 0;
  }
  
  estimateActualOperations(requestData) {
    // Estimate the real compute cost behind batch requests
    if (requestData.batchSize) {
      // Batch requests often hide individual operations
      return requestData.batchSize * 1.2; // 20% overhead assumption
    }
    return 1;
  }
  
  async applyFairUsageBilling(userId, endpoint, requestData) {
    // Bill based on actual compute cost, not manipulated pricing tiers
    const actualOperations = this.estimateActualOperations(requestData);
    const fairRate = this.calculateFairRate(endpoint, actualOperations);
    
    await this.logFairUsageAdjustment(userId, endpoint, fairRate, 'Usage pattern manipulation detected');
    
    return {
      cost: fairRate,
      adjusted: true,
      reason: 'Fair usage billing applied'
    };
  }
  
  calculateFairRate(endpoint, operations) {
    // Base rates on actual compute cost, not pricing tier manipulation
    const computeCosts = {
      '/api/basic': 0.008,    // Slightly lower than advertised
      '/api/premium': 0.085,  // Account for actual processing cost
      '/api/batch': 0.009     // Remove batch discount for suspicious usage
    };
    
    return computeCosts[endpoint] * operations;
  }
}`,
          points: 110
        }
      ]
    }
  ];

  const selectMission = (mission: Mission) => {
    setCurrentMission(mission);
    setCurrentStepIndex(0);
    setShowFeedback(false);
    setUserCodeInput('');
  };

  const handleChoice = async (option: any) => {
    setLastFeedback(option.feedback);
    setLastPoints(option.points);
    setShowFeedback(true);
    
    if (option.isCorrect) {
      setUserScore(prev => prev + option.points);
      // Update score on server if user is logged in
      await updateScore(option.points);
    }

    setTimeout(() => {
      if (currentStepIndex < currentMission!.steps.length - 1) {
        setCurrentStepIndex(prev => prev + 1);
        setShowFeedback(false);
      } else {
        completeMission();
      }
    }, 3000);
  };

  const handleCodeSubmission = async () => {
    const currentStep = currentMission!.steps[currentStepIndex];
    const points = currentStep.points;
    
    setLastFeedback('Great job! Your code shows understanding of the security concepts. In a real scenario, this would be reviewed by security experts.');
    setLastPoints(points);
    setUserScore(prev => prev + points);
    setShowFeedback(true);
    
    // Update score on server
    await updateScore(points);

    setTimeout(() => {
      if (currentStepIndex < currentMission!.steps.length - 1) {
        setCurrentStepIndex(prev => prev + 1);
        setShowFeedback(false);
        setUserCodeInput('');
      } else {
        completeMission();
      }
    }, 3000);
  };

  const completeMission = () => {
    setCompletedMissions(prev => [...prev, currentMission!.id]);
    setCurrentMission(null);
    setCurrentStepIndex(0);
    setShowFeedback(false);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Rookie': return 'bg-green-100 text-green-800';
      case 'Veteran': return 'bg-yellow-100 text-yellow-800';
      case 'Expert': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTotalAvailablePoints = () => {
    return missions.reduce((total, mission) => total + mission.totalPoints, 0);
  };

  const getMissionProgress = () => {
    if (!currentMission) return 0;
    return ((currentStepIndex + 1) / currentMission.steps.length) * 100;
  };

  if (!currentMission) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mx-auto">
            <Gamepad2 className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold">API Defense Command Center 🎮</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose your mission, defend your API, and become the ultimate monetization guardian!
          </p>
        </div>

        {/* Player Stats */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Your Defense Record
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{userScore}</div>
                <div className="text-sm text-muted-foreground">Total Points</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{completedMissions.length}</div>
                <div className="text-sm text-muted-foreground">Missions Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round((userScore / getTotalAvailablePoints()) * 100)}%
                </div>
                <div className="text-sm text-muted-foreground">Defense Mastery</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mission Selection */}
        <div className="grid gap-6">
          <h3 className="text-xl font-semibold text-center">🎯 Choose Your Mission</h3>
          {missions.map(mission => (
            <Card 
              key={mission.id} 
              className={`cursor-pointer transition-all hover:shadow-lg ${
                completedMissions.includes(mission.id) 
                  ? 'border-green-500 bg-green-50' 
                  : 'hover:border-primary'
              }`}
              onClick={() => !completedMissions.includes(mission.id) && selectMission(mission)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3">
                    <span className="text-2xl">{mission.emoji}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        {mission.title}
                        {completedMissions.includes(mission.id) && (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        )}
                      </div>
                    </div>
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge className={getDifficultyColor(mission.difficulty)}>
                      {mission.difficulty}
                    </Badge>
                    <Badge variant="outline">
                      {mission.totalPoints} pts
                    </Badge>
                  </div>
                </div>
                <CardDescription>{mission.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {mission.steps.length} steps • Interactive workflow
                  </div>
                  {!completedMissions.includes(mission.id) ? (
                    <Button size="sm">
                      Start Mission <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  ) : (
                    <Badge variant="outline" className="text-green-600">
                      ✅ Completed
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Alert>
          <Lightbulb className="h-4 w-4" />
          <AlertDescription>
            <strong>Pro Tip:</strong> Each mission teaches real-world API security concepts through interactive problem-solving. 
            Start with Rookie missions to build your foundation! 🚀
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const currentStep = currentMission.steps[currentStepIndex];

  return (
    <div className="space-y-6">
      {/* Mission Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <span className="text-2xl">{currentMission.emoji}</span>
              <div>
                <div>{currentMission.title}</div>
                <div className="text-sm font-normal text-muted-foreground">
                  Step {currentStepIndex + 1} of {currentMission.steps.length}
                </div>
              </div>
            </CardTitle>
            <Button 
              variant="outline" 
              onClick={() => setCurrentMission(null)}
            >
              Back to Missions
            </Button>
          </div>
          <Progress value={getMissionProgress()} className="w-full" />
        </CardHeader>
      </Card>

      {/* Current Step */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            {currentStep.title}
          </CardTitle>
          <CardDescription>{currentStep.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <h4 className="font-semibold text-amber-800 mb-2">📖 Scenario:</h4>
            <p className="text-amber-700">{currentStep.scenario}</p>
          </div>

          {currentStep.type === 'choice' && (
            <div className="space-y-3">
              <h4 className="font-semibold">What's your move, defender?</h4>
              {currentStep.options?.map(option => (
                <Button
                  key={option.id}
                  variant="outline"
                  className="w-full text-left justify-start h-auto p-4"
                  onClick={() => handleChoice(option)}
                  disabled={showFeedback}
                >
                  {option.text}
                </Button>
              ))}
            </div>
          )}

          {currentStep.type === 'code' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Code className="w-4 h-4" />
                  Current Code (The Problem):
                </h4>
                <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                  <code>{currentStep.codeExample}</code>
                </pre>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Your Solution:</h4>
                <Textarea
                  placeholder="Write your improved code here... Think about how to detect and prevent the attack!"
                  value={userCodeInput}
                  onChange={(e) => setUserCodeInput(e.target.value)}
                  className="min-h-32 font-mono text-sm"
                />
              </div>
              
              <Button 
                onClick={handleCodeSubmission}
                disabled={!userCodeInput.trim() || showFeedback}
                className="w-full"
              >
                Submit Solution <Code className="w-4 h-4 ml-2" />
              </Button>

              {currentStep.codeSolution && (
                <div className="mt-4">
                  <details className="group">
                    <summary className="cursor-pointer font-semibold text-blue-600 hover:text-blue-800">
                      💡 Need a hint? Click to see an expert solution
                    </summary>
                    <div className="mt-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <pre className="text-sm overflow-x-auto">
                        <code>{currentStep.codeSolution}</code>
                      </pre>
                    </div>
                  </details>
                </div>
              )}
            </div>
          )}

          {showFeedback && (
            <Alert className={lastPoints > 0 ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
              <div className="flex items-center gap-2">
                {lastPoints > 0 ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="font-semibold">+{lastPoints} points</span>
              </div>
              <AlertDescription className="mt-2">
                {lastFeedback}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Score Display */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Trophy className="w-6 h-6 text-yellow-500" />
              <div>
                <div className="font-semibold">Current Score: {userScore} points</div>
                <div className="text-sm text-muted-foreground">
                  Mission Progress: {currentStepIndex + 1}/{currentMission.steps.length}
                </div>
              </div>
            </div>
            <Badge variant="outline" className="text-lg px-3 py-1">
              {Math.round((userScore / getTotalAvailablePoints()) * 100)}% Mastery
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}