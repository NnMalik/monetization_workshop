import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { 
  Settings, 
  Shield, 
  CheckCircle, 
  AlertTriangle,
  Users,
  Globe,
  Clock,
  DollarSign,
  Eye,
  Lock,
  Zap,
  Target,
  Activity
} from 'lucide-react';

interface ApiPolicyManagerProps {
  simulationActive: boolean;
  scenarioId?: string;
  currentStep?: number;
  userSession: any;
  onPolicyApplied: () => void;
}

interface PolicyRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  type: 'rate_limit' | 'auth' | 'security' | 'billing';
  config: any;
}

interface ApiEndpoint {
  id: string;
  path: string;
  name: string;
  tier: 'free' | 'pro' | 'enterprise';
  status: 'active' | 'vulnerable' | 'secured';
  policies: PolicyRule[];
}

export function ApiPolicyManager({ 
  simulationActive, 
  scenarioId, 
  currentStep,
  userSession,
  onPolicyApplied 
}: ApiPolicyManagerProps) {
  const [endpoints, setEndpoints] = useState<ApiEndpoint[]>([]);
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('');
  const [isApplyingPolicy, setIsApplyingPolicy] = useState(false);
  const [policyChanges, setPolicyChanges] = useState<Record<string, any>>({});

  useEffect(() => {
    // Initialize endpoints based on scenario
    initializeEndpoints();
  }, [scenarioId, simulationActive]);

  const initializeEndpoints = () => {
    let endpointData: ApiEndpoint[] = [
      {
        id: 'translate-free',
        path: '/api/v1/translate/free',
        name: 'Translation API (Free Tier)',
        tier: 'free',
        status: simulationActive && scenarioId === 'free-tier-exploit' ? 'vulnerable' : 'active',
        policies: [
          {
            id: 'rate_limit_type',
            name: 'Rate Limiting Strategy',
            description: 'Controls how rate limits are applied',
            enabled: true,
            type: 'rate_limit',
            config: {
              strategy: simulationActive && scenarioId === 'free-tier-exploit' ? 'per_api_key' : 'per_ip_address',
              options: ['per_api_key', 'per_ip_address', 'per_user_fingerprint']
            }
          },
          {
            id: 'behavioral_analysis',
            name: 'Behavioral Analysis',
            description: 'Detect automated usage patterns',
            enabled: simulationActive && scenarioId === 'free-tier-exploit' ? false : true,
            type: 'security',
            config: {
              anomaly_threshold: 0.8,
              pattern_detection: true
            }
          }
        ]
      },
      {
        id: 'premium-api',
        path: '/api/v1/premium/*',
        name: 'Premium API Suite',
        tier: 'pro',
        status: simulationActive && scenarioId === 'credential-sharing' ? 'vulnerable' : 'active',
        policies: [
          {
            id: 'concurrent_sessions',
            name: 'Concurrent Session Limit',
            description: 'Limit simultaneous API key usage',
            enabled: simulationActive && scenarioId === 'credential-sharing' ? false : true,
            type: 'auth',
            config: {
              max_sessions: 2,
              geographic_validation: false
            }
          },
          {
            id: 'geo_validation',
            name: 'Geographic Validation',
            description: 'Detect impossible geographic usage',
            enabled: false,
            type: 'security',
            config: {
              max_countries_per_hour: 3,
              travel_time_validation: true
            }
          }
        ]
      },
      {
        id: 'enterprise-export',
        path: '/api/v2/export',
        name: 'Enterprise Data Export',
        tier: 'enterprise',
        status: 'secured',
        policies: [
          {
            id: 'reseller_detection',
            name: 'AI-Powered Anomaly Detection',
            description: 'Detect commercial reselling patterns',
            enabled: simulationActive && scenarioId === 'usage-laundering' ? false : true,
            type: 'billing',
            config: {
              pattern_analysis: true,
              reseller_threshold: 0.7
            }
          }
        ]
      }
    ];

    // Add shadow endpoint if scenario is active
    if (simulationActive && scenarioId === 'shadow-endpoint') {
      endpointData.push({
        id: 'shadow-endpoint',
        path: '/v1_dev/exportAll',
        name: '⚠️ Unsecured Development Endpoint',
        tier: 'free',
        status: 'vulnerable',
        policies: [
          {
            id: 'endpoint_security',
            name: 'Apply Default Security Policies',
            description: 'Secure this endpoint with authentication and rate limiting',
            enabled: false,
            type: 'security',
            config: {
              requires_auth: false,
              rate_limit: false,
              deprecated: true
            }
          }
        ]
      });
    }

    setEndpoints(endpointData);
    if (endpointData.length > 0) {
      setSelectedEndpoint(endpointData[0].id);
    }
  };

  const handlePolicyChange = (endpointId: string, policyId: string, field: string, value: any) => {
    const key = `${endpointId}.${policyId}.${field}`;
    setPolicyChanges(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const applyPolicyChanges = async () => {
    setIsApplyingPolicy(true);
    
    try {
      let pointsEarned = 0;
      let isCorrectFix = false;

      // Apply changes to local state
      setEndpoints(prev => prev.map(endpoint => {
        const updatedEndpoint = { ...endpoint };
        updatedEndpoint.policies = updatedEndpoint.policies.map(policy => {
          const updatedPolicy = { ...policy };
          
          Object.keys(policyChanges).forEach(key => {
            const [epId, polId, field] = key.split('.');
            if (epId === endpoint.id && polId === policy.id) {
              if (field === 'enabled') {
                updatedPolicy.enabled = policyChanges[key];
              } else if (field.startsWith('config.')) {
                const configField = field.replace('config.', '');
                updatedPolicy.config = {
                  ...updatedPolicy.config,
                  [configField]: policyChanges[key]
                };
              }
            }
          });
          
          return updatedPolicy;
        });

        // Update endpoint status and calculate points based on policies
        if (scenarioId === 'free-tier-exploit' && endpoint.id === 'translate-free') {
          const rateLimitPolicy = updatedEndpoint.policies.find(p => p.id === 'rate_limit_type');
          const behaviorPolicy = updatedEndpoint.policies.find(p => p.id === 'behavioral_analysis');
          
          if (rateLimitPolicy?.config.strategy === 'per_ip_address') {
            pointsEarned += 50; // Correct rate limiting strategy
          }
          if (behaviorPolicy?.enabled) {
            pointsEarned += 50; // Enabled behavioral analysis
          }
          
          if (rateLimitPolicy?.config.strategy === 'per_ip_address' && behaviorPolicy?.enabled) {
            updatedEndpoint.status = 'secured';
            isCorrectFix = true;
            pointsEarned += 50; // Bonus for complete fix
          }
        } else if (scenarioId === 'credential-sharing' && endpoint.id === 'premium-api') {
          const sessionPolicy = updatedEndpoint.policies.find(p => p.id === 'concurrent_sessions');
          const geoPolicy = updatedEndpoint.policies.find(p => p.id === 'geo_validation');
          
          if (sessionPolicy?.enabled) {
            pointsEarned += 75; // Enabled session limits
          }
          if (geoPolicy?.enabled) {
            pointsEarned += 75; // Enabled geo validation
          }
          
          if (sessionPolicy?.enabled && geoPolicy?.enabled) {
            updatedEndpoint.status = 'secured';
            isCorrectFix = true;
            pointsEarned += 50; // Bonus for complete fix
          }
        } else if (scenarioId === 'shadow-endpoint' && endpoint.id === 'shadow-endpoint') {
          const securityPolicy = updatedEndpoint.policies.find(p => p.id === 'endpoint_security');
          if (securityPolicy?.enabled) {
            updatedEndpoint.status = 'secured';
            isCorrectFix = true;
            pointsEarned += 100; // Major security fix
          }
        } else if (scenarioId === 'usage-laundering' && endpoint.id === 'enterprise-export') {
          const anomalyPolicy = updatedEndpoint.policies.find(p => p.id === 'reseller_detection');
          if (anomalyPolicy?.enabled) {
            updatedEndpoint.status = 'secured';
            isCorrectFix = true;
            pointsEarned += 100; // Complex business logic fix
          }
        }

        return updatedEndpoint;
      }));

      // Award points for policy changes
      if (pointsEarned > 0) {
        await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-af10fea3/scores/update`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            sessionId: userSession.sessionId,
            missionId: scenarioId || 'policy_fix',
            stepId: 'policy_application',
            points: pointsEarned
          }),
        });
      }
      
      if (isCorrectFix) {
        // Send resolution to backend
        await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-af10fea3/simulation/resolve`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            sessionId: userSession.sessionId,
            scenarioId,
            resolvedBy: userSession.username
          }),
        });
      }

      // Clear pending changes
      setPolicyChanges({});
      onPolicyApplied();
      
    } catch (error) {
      console.error('Failed to apply policy changes:', error);
    } finally {
      setIsApplyingPolicy(false);
    }
  };

  const checkIncidentResolution = () => {
    if (!scenarioId || !simulationActive) return false;

    switch (scenarioId) {
      case 'free-tier-exploit':
        return Object.keys(policyChanges).some(key => 
          key.includes('translate-free') && 
          (key.includes('rate_limit_type.config.strategy') || key.includes('behavioral_analysis.enabled'))
        );
      case 'credential-sharing':
        return Object.keys(policyChanges).some(key => 
          key.includes('premium-api') && 
          (key.includes('concurrent_sessions.enabled') || key.includes('geo_validation.enabled'))
        );
      case 'shadow-endpoint':
        return Object.keys(policyChanges).some(key => 
          key.includes('shadow-endpoint.endpoint_security.enabled')
        );
      case 'usage-laundering':
        return Object.keys(policyChanges).some(key => 
          key.includes('enterprise-export.reseller_detection.enabled')
        );
      default:
        return false;
    }
  };

  const getEndpointStatusColor = (status: string) => {
    switch (status) {
      case 'secured': return 'bg-green-100 text-green-800 border-green-200';
      case 'vulnerable': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'enterprise': return 'bg-purple-100 text-purple-800';
      case 'pro': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const selectedEndpointData = endpoints.find(ep => ep.id === selectedEndpoint);

  const hasPendingChanges = Object.keys(policyChanges).length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="w-6 h-6" />
            🔧 API Policy Manager
          </h2>
          <p className="text-muted-foreground">
            Configure security and monetization policies for your API endpoints
          </p>
        </div>
        {simulationActive && (
          <Badge variant="destructive" className="animate-pulse">
            🚨 INCIDENT REMEDIATION MODE
          </Badge>
        )}
      </div>

      {/* Endpoint Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            API Endpoints Overview
          </CardTitle>
          <CardDescription>
            Select an endpoint to configure its security and billing policies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {endpoints.map(endpoint => (
              <div
                key={endpoint.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                  selectedEndpoint === endpoint.id 
                    ? 'ring-2 ring-primary border-primary' 
                    : 'hover:border-gray-300'
                } ${endpoint.status === 'vulnerable' ? 'bg-red-50 border-red-200' : ''}`}
                onClick={() => setSelectedEndpoint(endpoint.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-gray-500" />
                    <div>
                      <h3 className="font-semibold">{endpoint.name}</h3>
                      <p className="text-sm text-muted-foreground font-mono">{endpoint.path}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getTierColor(endpoint.tier)}>
                      {endpoint.tier.toUpperCase()}
                    </Badge>
                    <Badge className={getEndpointStatusColor(endpoint.status)}>
                      {endpoint.status === 'vulnerable' && '⚠️'} 
                      {endpoint.status === 'secured' && '✅'} 
                      {endpoint.status === 'active' && '🟢'} 
                      {endpoint.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Policy Configuration */}
      {selectedEndpointData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Policy Configuration: {selectedEndpointData.name}
            </CardTitle>
            <CardDescription>
              Configure security and monetization policies for this endpoint
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {selectedEndpointData.policies.map((policy, index) => (
              <div key={policy.id}>
                {index > 0 && <Separator />}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold flex items-center gap-2">
                        {policy.type === 'rate_limit' && <Clock className="w-4 h-4 text-blue-500" />}
                        {policy.type === 'auth' && <Lock className="w-4 h-4 text-green-500" />}
                        {policy.type === 'security' && <Shield className="w-4 h-4 text-red-500" />}
                        {policy.type === 'billing' && <DollarSign className="w-4 h-4 text-purple-500" />}
                        {policy.name}
                      </h4>
                      <p className="text-sm text-muted-foreground">{policy.description}</p>
                    </div>
                    <Switch
                      checked={policyChanges[`${selectedEndpointData.id}.${policy.id}.enabled`] ?? policy.enabled}
                      onCheckedChange={(checked) => 
                        handlePolicyChange(selectedEndpointData.id, policy.id, 'enabled', checked)
                      }
                    />
                  </div>

                  {/* Policy-specific configuration */}
                  {(policyChanges[`${selectedEndpointData.id}.${policy.id}.enabled`] ?? policy.enabled) && (
                    <div className="ml-6 space-y-3 bg-gray-50 p-4 rounded-lg">
                      {/* Rate Limiting Strategy */}
                      {policy.id === 'rate_limit_type' && (
                        <div>
                          <Label htmlFor="strategy">Rate Limiting Strategy</Label>
                          <Select 
                            value={policyChanges[`${selectedEndpointData.id}.${policy.id}.config.strategy`] ?? policy.config.strategy}
                            onValueChange={(value) => 
                              handlePolicyChange(selectedEndpointData.id, policy.id, 'config.strategy', value)
                            }
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {policy.config.options.map((option: string) => (
                                <SelectItem key={option} value={option}>
                                  {option.replace(/_/g, ' ').toUpperCase()}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {/* Concurrent Sessions */}
                      {policy.id === 'concurrent_sessions' && (
                        <div>
                          <Label htmlFor="max_sessions">Maximum Concurrent Sessions</Label>
                          <Input
                            id="max_sessions"
                            type="number"
                            value={policyChanges[`${selectedEndpointData.id}.${policy.id}.config.max_sessions`] ?? policy.config.max_sessions}
                            onChange={(e) => 
                              handlePolicyChange(selectedEndpointData.id, policy.id, 'config.max_sessions', parseInt(e.target.value))
                            }
                            className="mt-1"
                            min="1"
                            max="10"
                          />
                        </div>
                      )}

                      {/* Geographic Validation */}
                      {policy.id === 'geo_validation' && (
                        <div>
                          <Label htmlFor="max_countries">Max Countries Per Hour</Label>
                          <Input
                            id="max_countries"
                            type="number"
                            value={policyChanges[`${selectedEndpointData.id}.${policy.id}.config.max_countries_per_hour`] ?? policy.config.max_countries_per_hour}
                            onChange={(e) => 
                              handlePolicyChange(selectedEndpointData.id, policy.id, 'config.max_countries_per_hour', parseInt(e.target.value))
                            }
                            className="mt-1"
                            min="1"
                            max="10"
                          />
                        </div>
                      )}

                      {/* Behavioral Analysis */}
                      {policy.id === 'behavioral_analysis' && (
                        <div>
                          <Label htmlFor="threshold">Anomaly Detection Threshold</Label>
                          <Input
                            id="threshold"
                            type="number"
                            step="0.1"
                            value={policyChanges[`${selectedEndpointData.id}.${policy.id}.config.anomaly_threshold`] ?? policy.config.anomaly_threshold}
                            onChange={(e) => 
                              handlePolicyChange(selectedEndpointData.id, policy.id, 'config.anomaly_threshold', parseFloat(e.target.value))
                            }
                            className="mt-1"
                            min="0.1"
                            max="1.0"
                          />
                        </div>
                      )}

                      {/* Endpoint Security */}
                      {policy.id === 'endpoint_security' && (
                        <Alert className="border-orange-200 bg-orange-50">
                          <AlertTriangle className="h-4 w-4 text-orange-600" />
                          <AlertDescription className="text-orange-800">
                            This will apply authentication, rate limiting, and deprecation warnings to the unsecured endpoint.
                          </AlertDescription>
                        </Alert>
                      )}

                      {/* Reseller Detection */}
                      {policy.id === 'reseller_detection' && (
                        <div>
                          <Label htmlFor="reseller_threshold">Reseller Detection Threshold</Label>
                          <Input
                            id="reseller_threshold"
                            type="number"
                            step="0.1"
                            value={policyChanges[`${selectedEndpointData.id}.${policy.id}.config.reseller_threshold`] ?? policy.config.reseller_threshold}
                            onChange={(e) => 
                              handlePolicyChange(selectedEndpointData.id, policy.id, 'config.reseller_threshold', parseFloat(e.target.value))
                            }
                            className="mt-1"
                            min="0.1"
                            max="1.0"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Apply Changes */}
      {hasPendingChanges && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-green-800">Policy Changes Ready</h3>
                <p className="text-sm text-green-700">
                  {Object.keys(policyChanges).length} configuration change(s) pending application
                </p>
              </div>
              <Button 
                onClick={applyPolicyChanges}
                disabled={isApplyingPolicy}
                className="bg-green-600 hover:bg-green-700"
              >
                {isApplyingPolicy ? (
                  <>
                    <Zap className="w-4 h-4 mr-2 animate-spin" />
                    Applying...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Apply Policy Changes
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scenario-specific guidance */}
      {simulationActive && scenarioId && (
        <div className="space-y-4">
          <Alert className="border-blue-200 bg-blue-50">
            <Eye className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>🔍 Investigation Summary:</strong>
              {scenarioId === 'free-tier-exploit' && 
                ' Logs show multiple accounts from same IPs, all stopping at exactly 999 calls. Fix: Change rate limiting to "Per IP Address" + enable behavioral analysis.'}
              {scenarioId === 'credential-sharing' && 
                ' Logs reveal impossible geographic patterns - same API key active in 24+ countries simultaneously. Fix: Enable session limits + geographic validation.'}
              {scenarioId === 'shadow-endpoint' && 
                ' Logs expose undocumented endpoints being accessed without authentication. Fix: Apply security policies to the vulnerable endpoint.'}
              {scenarioId === 'usage-laundering' && 
                ' Logs indicate 24/7 flat usage with 800+ end customer IDs in batch requests. Fix: Enable anomaly detection to flag reselling.'}
            </AlertDescription>
          </Alert>
          
          <Alert className="border-green-200 bg-green-50">
            <Target className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>🎯 Points Available:</strong>
              {scenarioId === 'free-tier-exploit' && ' 50 pts for correct rate limiting + 50 pts for behavioral analysis + 50 pts completion bonus = 150 total'}
              {scenarioId === 'credential-sharing' && ' 75 pts for session limits + 75 pts for geo validation + 50 pts completion bonus = 200 total'}
              {scenarioId === 'shadow-endpoint' && ' 100 pts for securing the vulnerable endpoint = 100 total'}
              {scenarioId === 'usage-laundering' && ' 100 pts for enabling anomaly detection = 100 total'}
            </AlertDescription>
          </Alert>
        </div>
      )}

      {!simulationActive && (
        <Alert>
          <Settings className="h-4 w-4" />
          <AlertDescription>
            <strong>Policy Manager:</strong> This is where you configure security and monetization policies for your API endpoints. 
            During an incident, use this interface to apply fixes and resolve security issues! 🛠️
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}