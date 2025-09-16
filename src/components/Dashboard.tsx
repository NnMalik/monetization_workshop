import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { 
  DollarSign, 
  Activity, 
  Users, 
  Clock, 
  TrendingDown, 
  TrendingUp,
  AlertTriangle,
  Eye,
  Zap,
  Globe,
  Database,
  Target,
  Shield
} from 'lucide-react';

interface DashboardMetrics {
  revenue: {
    current: number;
    trend: number;
    period: string;
  };
  apiCalls: {
    current: number;
    trend: number;
    period: string;
  };
  activeUsers: {
    current: number;
    trend: number;
    period: string;
  };
  avgLatency: {
    current: number;
    trend: number;
    period: string;
  };
  costs: {
    current: number;
    trend: number;
    period: string;
  };
  alerts: {
    level: 'low' | 'medium' | 'high' | 'critical';
    count: number;
  };
}

interface DashboardProps {
  simulationActive: boolean;
  scenarioId?: string;
  currentStep?: number;
}

export function Dashboard({ simulationActive, scenarioId, currentStep }: DashboardProps) {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    revenue: { current: 18934.50, trend: 5.2, period: '24h' },
    apiCalls: { current: 15847, trend: 12.3, period: '24h' },
    activeUsers: { current: 1247, trend: -2.1, period: '24h' },
    avgLatency: { current: 127, trend: 8.7, period: '1h' },
    costs: { current: 2847.30, trend: 15.6, period: '24h' },
    alerts: { level: 'low', count: 0 }
  });

  const [anomalies, setAnomalies] = useState<string[]>([]);
  const [threatSpecificData, setThreatSpecificData] = useState<any>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-af10fea3/dashboard/metrics`, {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          const m = data.metrics;
          
          // Convert backend metrics to dashboard format
          setMetrics({
            revenue: { 
              current: m.revenue, 
              trend: data.isActive ? (m.threatSpecific?.revenueLeakage ? -25.4 : -8.7) : 5.2, 
              period: '24h' 
            },
            apiCalls: { 
              current: m.totalRequests, 
              trend: data.isActive ? (scenarioId === 'free-tier-exploit' ? 362.8 : scenarioId === 'usage-laundering' ? 1487.2 : 235.6) : 12.3, 
              period: '24h' 
            },
            activeUsers: { 
              current: m.activeUsers, 
              trend: data.isActive ? (scenarioId === 'credential-sharing' ? 89.3 : 4.2) : -2.1, 
              period: '24h' 
            },
            avgLatency: { 
              current: m.avgResponseTime, 
              trend: data.isActive ? (scenarioId === 'shadow-endpoint' ? 89.7 : scenarioId === 'credential-sharing' ? 84.2 : -15.3) : 8.7, 
              period: '1h' 
            },
            costs: { 
              current: m.costs, 
              trend: data.isActive ? (m.threatSpecific?.revenueLeakage ? 737.8 : 187.4) : 15.6, 
              period: '24h' 
            },
            alerts: { 
              level: m.alertLevel as 'low' | 'medium' | 'high' | 'critical', 
              count: data.isActive ? (m.alertLevel === 'critical' ? 12 : m.alertLevel === 'emergency' ? 23 : 5) : 0 
            }
          });
          
          setThreatSpecificData(m.threatSpecific || null);
          
          // Set anomalies based on threat type
          if (data.isActive && m.threatSpecific) {
            const newAnomalies = generateAnomaliesFromThreatData(scenarioId!, m.threatSpecific);
            setAnomalies(newAnomalies);
          } else {
            setAnomalies([]);
          }
        }
      } catch (error) {
        console.error('Failed to fetch dashboard metrics:', error);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 3000); // Update every 3 seconds
    return () => clearInterval(interval);
  }, [simulationActive, scenarioId]);

  const generateAnomaliesFromThreatData = (scenarioId: string, threatData: any): string[] => {
    switch (scenarioId) {
      case 'free-tier-exploit':
        return [
          `🚨 ${threatData.freeAccountsCreated} fake accounts detected from ${threatData.suspiciousIPs} IPs`,
          `💸 Revenue leakage: ${threatData.revenueLeakage?.toFixed(2)} in stolen API usage`,
          `⚡ Account creation rate: ${threatData.exploitedAccounts} accounts in ${threatData.avgAccountAge}`,
          `🤖 Automation signatures detected in user agents`
        ];
      case 'credential-sharing':
        return [
          `🌍 API key active in ${threatData.uniqueCountries} countries with ${threatData.concurrentSessions} concurrent sessions`,
          `✈️ ${threatData.impossibleTravelEvents} impossible travel events detected`,
          `💰 Revenue per user dropped to ${threatData.revenuePerUser} (should be $50.00)`,
          `📈 Usage scaled to ${threatData.estimatedSharingScale} level`
        ];
      case 'shadow-endpoint':
        return [
          `❓ ${threatData.unauthorizedEndpoints} unauthorized endpoints accessed`,
          `🔓 ${threatData.exposedRecords} user records potentially compromised`,
          `💾 ${threatData.dataExfiltrated} of sensitive data downloaded`,
          `⚠️ Admin panel accessed ${threatData.adminPanelAccess} times without authorization`
        ];
      case 'usage-laundering':
        return [
          `💸 Revenue discrepancy: ${threatData.revenueDiscrepancy?.toFixed(2)} in unbilled usage`,
          `👥 ${threatData.endCustomersDetected} end customers detected behind single account`,
          `📊 ${threatData.batchOperationsToday} batch operations masking ${threatData.actualOperations} real operations`,
          `💰 Commercial resale confirmed with ${threatData.profitMargin} markup`
        ];
      default:
        return [];
    }
  };

  const getMetricIcon = (metricType: string) => {
    switch (metricType) {
      case 'revenue': return DollarSign;
      case 'apiCalls': return Activity;
      case 'activeUsers': return Users;
      case 'avgLatency': return Clock;
      case 'costs': return Zap;
      default: return Activity;
    }
  };

  const getTrendColor = (trend: number) => {
    if (trend > 0) return 'text-red-600';
    if (trend < 0) return 'text-green-600';
    return 'text-muted-foreground';
  };

  const getTrendIcon = (trend: number) => {
    return trend > 0 ? TrendingUp : TrendingDown;
  };

  const getAlertColor = (level: string) => {
    switch (level) {
      case 'critical': return 'border-red-500 bg-red-50';
      case 'high': return 'border-orange-500 bg-orange-50';
      case 'medium': return 'border-yellow-500 bg-yellow-50';
      default: return 'border-green-500 bg-green-50';
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">📊 Business Intelligence Dashboard</h2>
          <p className="text-muted-foreground">
            Monitor your API's health and performance metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          {simulationActive ? (
            <Badge variant="destructive" className="animate-pulse">
              🔴 LIVE INCIDENT
            </Badge>
          ) : (
            <Badge variant="outline" className="text-green-600">
              ✅ ALL SYSTEMS NORMAL
            </Badge>
          )}
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {Object.entries(metrics).filter(([key]) => key !== 'alerts').map(([key, value]) => {
          const Icon = getMetricIcon(key);
          const TrendIcon = getTrendIcon(value.trend);
          
          return (
            <Card key={key} className={`${simulationActive && Math.abs(value.trend) > 20 ? 'border-red-200 bg-red-50' : ''}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium capitalize">
                  {key === 'apiCalls' ? 'API Calls' : 
                   key === 'activeUsers' ? 'Active Users' : 
                   key === 'avgLatency' ? 'Avg Latency' : key}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {key === 'revenue' || key === 'costs' ? '$' : ''}
                  {key === 'avgLatency' ? `${value.current}ms` : formatNumber(value.current)}
                </div>
                <div className={`text-xs flex items-center gap-1 ${getTrendColor(value.trend)}`}>
                  <TrendIcon className="w-3 h-3" />
                  {Math.abs(value.trend).toFixed(1)}% from last {value.period}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Alerts Section */}
      <Card className={getAlertColor(metrics.alerts.level)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            System Alerts
            {metrics.alerts.count > 0 && (
              <Badge variant="destructive">{metrics.alerts.count}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {metrics.alerts.count === 0 ? (
            <p className="text-muted-foreground">No active alerts. All systems operating normally.</p>
          ) : (
            <div className="space-y-2">
              <p className="font-semibold text-destructive">
                {metrics.alerts.count} active alert{metrics.alerts.count > 1 ? 's' : ''} require attention
              </p>
              <div className="text-sm text-muted-foreground">
                Check the Live Log Stream for detailed investigation
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Threat-Specific Intelligence Panel */}
      {threatSpecificData && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <Target className="w-5 h-5" />
              🎯 Threat Intelligence Dashboard
            </CardTitle>
            <CardDescription className="text-red-700">
              Real-time analysis of the active security incident
            </CardDescription>
          </CardHeader>
          <CardContent>
            {scenarioId === 'free-tier-exploit' && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-white rounded-lg border">
                  <div className="text-2xl font-bold text-red-600">{threatSpecificData.freeAccountsCreated}</div>
                  <div className="text-sm text-muted-foreground">Fake Accounts</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border">
                  <div className="text-2xl font-bold text-red-600">${threatSpecificData.revenueLeakage?.toFixed(0)}</div>
                  <div className="text-sm text-muted-foreground">Revenue Lost</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border">
                  <div className="text-2xl font-bold text-red-600">{threatSpecificData.suspiciousIPs}</div>
                  <div className="text-sm text-muted-foreground">Suspicious IPs</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border">
                  <div className="text-2xl font-bold text-red-600">{threatSpecificData.avgAccountAge}</div>
                  <div className="text-sm text-muted-foreground">Avg Account Age</div>
                </div>
              </div>
            )}
            
            {scenarioId === 'credential-sharing' && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-white rounded-lg border">
                  <div className="text-2xl font-bold text-red-600 flex items-center justify-center gap-1">
                    <Globe className="w-6 h-6" />
                    {threatSpecificData.uniqueCountries}
                  </div>
                  <div className="text-sm text-muted-foreground">Countries Active</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border">
                  <div className="text-2xl font-bold text-red-600">{threatSpecificData.concurrentSessions}</div>
                  <div className="text-sm text-muted-foreground">Concurrent Sessions</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border">
                  <div className="text-2xl font-bold text-red-600">{threatSpecificData.impossibleTravelEvents}</div>
                  <div className="text-sm text-muted-foreground">Impossible Travel</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border">
                  <div className="text-2xl font-bold text-red-600">{threatSpecificData.revenuePerUser}</div>
                  <div className="text-sm text-muted-foreground">Revenue/User</div>
                </div>
              </div>
            )}
            
            {scenarioId === 'shadow-endpoint' && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-white rounded-lg border">
                  <div className="text-2xl font-bold text-red-600">{threatSpecificData.unauthorizedEndpoints}</div>
                  <div className="text-sm text-muted-foreground">Unauthorized Endpoints</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border">
                  <div className="text-2xl font-bold text-red-600 flex items-center justify-center gap-1">
                    <Database className="w-6 h-6" />
                    {threatSpecificData.exposedRecords?.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Records Exposed</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border">
                  <div className="text-2xl font-bold text-red-600">{threatSpecificData.dataExfiltrated}</div>
                  <div className="text-sm text-muted-foreground">Data Stolen</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border">
                  <div className="text-2xl font-bold text-red-600">{threatSpecificData.adminPanelAccess}</div>
                  <div className="text-sm text-muted-foreground">Admin Access</div>
                </div>
              </div>
            )}
            
            {scenarioId === 'usage-laundering' && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-white rounded-lg border">
                  <div className="text-2xl font-bold text-red-600">${threatSpecificData.revenueDiscrepancy?.toFixed(0)}</div>
                  <div className="text-sm text-muted-foreground">Revenue Lost</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border">
                  <div className="text-2xl font-bold text-red-600">{threatSpecificData.endCustomersDetected}</div>
                  <div className="text-sm text-muted-foreground">End Customers</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border">
                  <div className="text-2xl font-bold text-red-600">{threatSpecificData.batchOperationsToday?.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Batch Operations</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border">
                  <div className="text-2xl font-bold text-red-600">{threatSpecificData.profitMargin}</div>
                  <div className="text-sm text-muted-foreground">Resale Markup</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Anomaly Detection */}
      {anomalies.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <Eye className="w-5 h-5" />
              🔍 Anomaly Detection
            </CardTitle>
            <CardDescription className="text-orange-700">
              Our AI has detected unusual patterns in your API usage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {anomalies.map((anomaly, index) => (
                <Alert key={index} className="border-orange-300 bg-orange-100">
                  <AlertDescription className="text-orange-800">
                    {anomaly}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {!simulationActive && (
        <Alert>
          <Eye className="h-4 w-4" />
          <AlertDescription>
            <strong>Dashboard Tip:</strong> This dashboard shows real-time business metrics. 
            When an incident is active, you'll see anomalies here first. Look for unusual trends 
            and spikes that indicate potential security issues! 📈
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}