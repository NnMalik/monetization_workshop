import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { 
  Shield, 
  DollarSign, 
  Users, 
  Zap, 
  Lock, 
  TrendingUp, 
  AlertTriangle,
  Eye,
  CreditCard,
  Clock
} from 'lucide-react';

export function ConceptExplanation() {
  const threats = [
    {
      id: 'rate-limiting',
      title: 'Rate Limiting Bypass',
      icon: Clock,
      severity: 'High',
      description: 'Attackers circumvent rate limits to exceed allowed API usage without paying for higher tiers.',
      techniques: [
        'IP rotation using proxies',
        'Distributed requests across multiple accounts',
        'Header manipulation to bypass detection',
        'Time-based request spreading'
      ],
      impact: 'Lost revenue, infrastructure overload, unfair usage'
    },
    {
      id: 'auth-abuse',
      title: 'Authentication Token Abuse',
      icon: Lock,
      severity: 'Critical',
      description: 'Unauthorized sharing or selling of API keys and tokens to avoid subscription costs.',
      techniques: [
        'API key sharing in public repositories',
        'Token marketplace creation',
        'Credential stuffing attacks',
        'Session hijacking'
      ],
      impact: 'Revenue loss, security breaches, compliance violations'
    },
    {
      id: 'tier-violations',
      title: 'Pricing Tier Violations',
      icon: TrendingUp,
      severity: 'Medium',
      description: 'Users manipulating usage patterns to stay in lower-cost tiers while accessing premium features.',
      techniques: [
        'Request batching to appear as single calls',
        'Feature detection bypassing',
        'Usage pattern obfuscation',
        'Multi-account orchestration'
      ],
      impact: 'Reduced revenue per user, unfair competitive advantage'
    },
    {
      id: 'ddos-attacks',
      title: 'DDoS & Resource Exhaustion',
      icon: Zap,
      severity: 'Critical',
      description: 'Overwhelming API infrastructure to disrupt service or force infrastructure costs up.',
      techniques: [
        'Volumetric attacks',
        'Slowloris-style requests',
        'Resource-intensive endpoint targeting',
        'Amplification attacks'
      ],
      impact: 'Service downtime, increased infrastructure costs, customer churn'
    },
    {
      id: 'billing-fraud',
      title: 'Billing & Usage Fraud',
      icon: CreditCard,
      severity: 'High',
      description: 'Manipulating usage reporting or billing systems to reduce or avoid charges.',
      techniques: [
        'Usage data tampering',
        'Billing system exploitation',
        'Refund abuse',
        'Chargeback fraud'
      ],
      impact: 'Direct revenue loss, increased operational costs'
    }
  ];

  const defenseStrategies = [
    {
      category: 'Technical Controls',
      strategies: [
        'Multi-layer rate limiting (IP, user, endpoint)',
        'Advanced authentication mechanisms (JWT, OAuth 2.0)',
        'Real-time usage monitoring and anomaly detection',
        'API gateway with built-in security features'
      ]
    },
    {
      category: 'Business Controls',
      strategies: [
        'Clear terms of service and usage policies',
        'Regular usage auditing and compliance checks',
        'Tiered pricing with clear value propositions',
        'Customer education and support programs'
      ]
    },
    {
      category: 'Monitoring & Analytics',
      strategies: [
        'Real-time usage pattern analysis',
        'Behavioral anomaly detection',
        'Revenue impact tracking',
        'Automated alerting systems'
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">API Monetization Under Attack</h2>
        <p className="text-muted-foreground">
          Understanding the threats and defense strategies for protecting your API revenue streams
        </p>
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Key Insight:</strong> API monetization attacks cost companies an average of 15-30% of potential revenue. 
          The key to defense is understanding attacker motivations and implementing layered protection.
        </AlertDescription>
      </Alert>

      {/* Threat Landscape */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Common Attack Vectors
          </CardTitle>
          <CardDescription>
            Learn about the most frequent threats to API monetization systems
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {threats.map((threat) => {
              const Icon = threat.icon;
              return (
                <AccordionItem key={threat.id} value={threat.id}>
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      <span>{threat.title}</span>
                      <Badge 
                        variant={threat.severity === 'Critical' ? 'destructive' : 
                                threat.severity === 'High' ? 'secondary' : 'outline'}
                      >
                        {threat.severity}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <p className="text-muted-foreground">{threat.description}</p>
                    
                    <div>
                      <h5 className="font-semibold mb-2">Common Techniques:</h5>
                      <ul className="space-y-1">
                        {threat.techniques.map((technique, index) => (
                          <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="w-1 h-1 bg-muted-foreground rounded-full mt-2 flex-shrink-0"></span>
                            {technique}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3 bg-destructive/10 rounded-lg">
                      <h5 className="font-semibold text-destructive mb-1">Business Impact:</h5>
                      <p className="text-sm text-destructive">{threat.impact}</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </CardContent>
      </Card>

      {/* Defense Strategies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Defense Strategies
          </CardTitle>
          <CardDescription>
            Multi-layered approach to protecting your API monetization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            {defenseStrategies.map((category, index) => (
              <div key={index} className="space-y-3">
                <h4 className="font-semibold text-primary">{category.category}</h4>
                <ul className="space-y-2">
                  {category.strategies.map((strategy, strategyIndex) => (
                    <li key={strategyIndex} className="text-sm flex items-start gap-2">
                      <Shield className="w-3 h-3 mt-1 text-green-600 flex-shrink-0" />
                      {strategy}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Key Metrics to Monitor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold">Usage Metrics</h4>
              <ul className="space-y-1 text-sm">
                <li>• API call volume per user/time period</li>
                <li>• Request pattern anomalies</li>
                <li>• Geographic distribution of requests</li>
                <li>• Error rate patterns</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold">Revenue Metrics</h4>
              <ul className="space-y-1 text-sm">
                <li>• Revenue per API call</li>
                <li>• Tier upgrade/downgrade patterns</li>
                <li>• Usage vs. billing discrepancies</li>
                <li>• Customer lifetime value trends</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}