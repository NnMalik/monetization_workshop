import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Terminal, 
  Play, 
  Pause, 
  Search, 
  Filter,
  AlertCircle,
  Info,
  AlertTriangle,
  XCircle,
  CheckCircle,
  Eye,
  Lightbulb,
  Zap
} from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'ALERT' | 'CRITICAL' | 'EMERGENCY';
  endpoint: string;
  user: string;
  ip?: string;
  message: string;
  metadata?: any;
  educational_hint?: string;
}

interface LiveLogStreamProps {
  simulationActive: boolean;
  scenarioId?: string;
  currentStep?: number;
}

export function LiveLogStream({ simulationActive, scenarioId, currentStep }: LiveLogStreamProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isStreaming, setIsStreaming] = useState(true);
  const [filter, setFilter] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL');
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isStreaming) return;

    const fetchLogs = async () => {
      try {
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-af10fea3/logs/stream`, {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        });
        
        if (response.ok) {
          const backendLogs = await response.json();
          
          // Convert backend logs to frontend format
          const formattedLogs = backendLogs.map((log: any, index: number) => ({
            id: `${Date.now()}_${index}`,
            timestamp: log.timestamp,
            level: log.level,
            endpoint: log.endpoint,
            user: log.user,
            ip: log.metadata?.ip || 'unknown',
            message: log.message,
            metadata: log.metadata,
            educational_hint: log.educational_hint
          }));
          
          if (formattedLogs.length > 0) {
            setLogs(prev => {
              // Add new logs and keep last 50
              const combined = [...prev, ...formattedLogs];
              return combined.slice(-50);
            });
          }
        }
      } catch (error) {
        console.error('Failed to fetch logs:', error);
      }
    };

    // Initial fetch
    fetchLogs();
    
    // Fetch every 3 seconds for real-time updates
    const interval = setInterval(fetchLogs, 3000);
    return () => clearInterval(interval);
  }, [simulationActive, scenarioId, isStreaming]);

  const getLogIcon = (level: string) => {
    switch (level) {
      case 'INFO': return <Info className="w-4 h-4 text-blue-500" />;
      case 'WARN': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'ERROR': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'ALERT': return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'CRITICAL': return <Zap className="w-4 h-4 text-red-700" />;
      case 'EMERGENCY': return <Zap className="w-4 h-4 text-red-800" />;
      default: return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
  };

  const getLogBorderColor = (level: string) => {
    switch (level) {
      case 'INFO': return 'border-l-blue-500';
      case 'WARN': return 'border-l-yellow-500';
      case 'ERROR': return 'border-l-red-500';
      case 'ALERT': return 'border-l-red-600';
      case 'CRITICAL': return 'border-l-red-700';
      case 'EMERGENCY': return 'border-l-red-800';
      default: return 'border-l-green-500';
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesFilter = !filter || 
      log.message.toLowerCase().includes(filter.toLowerCase()) ||
      log.endpoint.toLowerCase().includes(filter.toLowerCase()) ||
      log.user.toLowerCase().includes(filter.toLowerCase());
    
    const matchesLevel = selectedLevel === 'ALL' || log.level === selectedLevel;
    
    return matchesFilter && matchesLevel;
  });

  const logLevels = ['ALL', 'INFO', 'WARN', 'ERROR', 'ALERT', 'CRITICAL', 'EMERGENCY'];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Terminal className="w-6 h-6" />
            🔍 Live Log Stream
          </h2>
          <p className="text-muted-foreground">
            Real-time API request logs - Watch for suspicious patterns!
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={isStreaming ? "destructive" : "default"}
            size="sm"
            onClick={() => setIsStreaming(!isStreaming)}
          >
            {isStreaming ? (
              <>
                <Pause className="w-4 h-4 mr-1" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-1" />
                Resume
              </>
            )}
          </Button>
          {simulationActive && (
            <Badge variant="destructive" className="animate-pulse">
              🔴 INCIDENT ACTIVE
            </Badge>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Log Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs (message, endpoint, user)..."
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="border rounded px-2 py-1 text-sm"
              >
                {logLevels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Log Stream */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>API Request Logs</span>
            <Badge variant="outline">
              {filteredLogs.length} entries
            </Badge>
          </CardTitle>
          <CardDescription>
            Live stream of API requests and system events with educational insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto bg-black text-green-400 p-4 rounded-lg font-mono text-sm">
            {filteredLogs.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                {simulationActive ? 'Fetching live attack logs...' : 'No logs match your current filters'}
              </div>
            ) : (
              filteredLogs.map(log => (
                <div 
                  key={log.id} 
                  className={`border-l-4 pl-3 py-2 ${getLogBorderColor(log.level)} bg-gray-900 rounded-r`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {getLogIcon(log.level)}
                    <span className="text-gray-400">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {log.level}
                    </Badge>
                    <span className="text-blue-400">{log.endpoint}</span>
                    <span className="text-yellow-400">{log.user}</span>
                    <span className="text-gray-500">{log.ip}</span>
                  </div>
                  <div className="text-white">{log.message}</div>
                  
                  {/* Educational Hint */}
                  {log.educational_hint && (
                    <div className="mt-2 p-2 bg-blue-900 border border-blue-600 rounded text-blue-200 text-xs flex items-start gap-2">
                      <Lightbulb className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      <span>{log.educational_hint}</span>
                    </div>
                  )}
                  
                  {log.metadata && (
                    <div className="text-gray-500 text-xs mt-1">
                      {JSON.stringify(log.metadata)}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {!simulationActive && (
        <Alert>
          <Terminal className="h-4 w-4" />
          <AlertDescription>
            <strong>Detective Mode:</strong> This log stream shows real-time API requests. 
            During an incident, look for patterns like: unusual IP addresses, 
            repeated failed attempts, unexpected endpoints, or timing anomalies! 🕵️‍♀️
          </AlertDescription>
        </Alert>
      )}

      {simulationActive && (
        <div className="space-y-4">
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>🚨 Incident Investigation Mode:</strong> Analyze the log patterns above! 
              Look for educational hints (💡) in blue boxes - they provide specific guidance for the Defense Protocol.
            </AlertDescription>
          </Alert>
          
          <Alert className="border-yellow-200 bg-yellow-50">
            <Eye className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <strong>🔍 Investigation Strategy:</strong>
              {scenarioId === 'free-tier-exploit' && ' Look for: Multiple accounts from same IPs, exactly 999 calls per account, temporary email domains, automation signatures.'}
              {scenarioId === 'credential-sharing' && ' Look for: Same API key in multiple countries, impossible travel times, concurrent sessions, geographic impossibilities.'}
              {scenarioId === 'shadow-endpoint' && ' Look for: Undocumented endpoints, missing authentication, scanner user agents, development paths in production.'}
              {scenarioId === 'usage-laundering' && ' Look for: Batch requests with many operations, 24/7 flat usage, multiple end customer IDs, revenue vs usage discrepancies.'}
              {!scenarioId && ' Watch for anomalous patterns, unusual request volumes, geographic inconsistencies, or timing irregularities.'}
            </AlertDescription>
          </Alert>
          
          <Alert className="border-blue-200 bg-blue-50">
            <Lightbulb className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>💡 Pro Tip:</strong> The educational hints in the logs directly correlate to the defense steps you'll need to take. 
              Use the information here to make informed decisions in the Defense Protocol section!
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
}