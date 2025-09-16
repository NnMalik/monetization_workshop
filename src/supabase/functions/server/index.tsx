import { Hono } from 'npm:hono'
import { cors } from 'npm:hono/cors'
import { logger } from 'npm:hono/logger'
import { createClient } from 'npm:@supabase/supabase-js@2'
import * as kv from './kv_store.tsx'

const app = new Hono()

// Enable CORS for all routes
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

app.use('*', logger(console.log))

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

// Auth endpoint
app.post('/make-server-af10fea3/auth/login', async (c) => {
  try {
    const { username, password } = await c.req.json()
    
    // Simple credential validation
    let userRole = 'participant'
    let isValid = false
    
    if (username === 'admin' && password === 'workshop2024') {
      userRole = 'facilitator'
      isValid = true
    } else if (username && password) {
      // For participants, just validate non-empty credentials
      userRole = 'participant'
      isValid = true
    }
    
    if (!isValid) {
      return c.json({ error: 'Invalid credentials' }, 401)
    }
    
    // Create session
    const sessionId = crypto.randomUUID()
    const session = {
      sessionId,
      username,
      role: userRole,
      loginTime: new Date().toISOString(),
      score: 0
    }
    
    await kv.set(`session:${sessionId}`, session)
    await kv.set(`user:${username}`, session)
    
    return c.json({ 
      success: true, 
      sessionId, 
      role: userRole,
      username 
    })
  } catch (error) {
    console.log('Login error:', error)
    return c.json({ error: 'Login failed' }, 500)
  }
})

// Get session info
app.get('/make-server-af10fea3/auth/session/:sessionId', async (c) => {
  try {
    const sessionId = c.req.param('sessionId')
    const session = await kv.get(`session:${sessionId}`)
    
    if (!session) {
      return c.json({ error: 'Session not found' }, 404)
    }
    
    return c.json(session)
  } catch (error) {
    console.log('Session error:', error)
    return c.json({ error: 'Session retrieval failed' }, 500)
  }
})

// Start simulation (facilitator only)
app.post('/make-server-af10fea3/simulation/start', async (c) => {
  try {
    const { scenarioId, sessionId } = await c.req.json()
    
    // Verify facilitator role
    const session = await kv.get(`session:${sessionId}`)
    if (!session || session.role !== 'facilitator') {
      return c.json({ error: 'Unauthorized' }, 403)
    }
    
    // Generate unique attack ID
    const attackId = `attack_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Start simulation
    const simulationState = {
      scenarioId,
      attackId,
      isActive: true,
      startTime: new Date().toISOString(),
      currentStep: 0,
      participantProgress: {}
    }
    
    await kv.set('current_simulation', simulationState)
    
    // Store attack details
    await kv.set(`attack:${attackId}`, {
      scenarioId,
      attackId,
      startedAt: new Date().toISOString(),
      startedBy: session.username,
      participantScores: {}
    })
    
    console.log(`Attack launched: ${scenarioId} (${attackId}) by ${session.username}`)
    return c.json({ success: true, simulationState })
  } catch (error) {
    console.log('Start simulation error:', error)
    return c.json({ error: 'Failed to start simulation' }, 500)
  }
})

// Get current simulation state
app.get('/make-server-af10fea3/simulation/current', async (c) => {
  try {
    const simulation = await kv.get('current_simulation')
    return c.json(simulation || { isActive: false })
  } catch (error) {
    console.log('Get simulation error:', error)
    return c.json({ error: 'Failed to get simulation' }, 500)
  }
})

// Update participant score for specific attack
app.post('/make-server-af10fea3/scores/update', async (c) => {
  try {
    const { sessionId, attackId, stepId, points } = await c.req.json()
    
    const session = await kv.get(`session:${sessionId}`)
    if (!session) {
      return c.json({ error: 'Session not found' }, 404)
    }
    
    // Update user's total score
    const scoreKey = `score:${session.username}`
    const currentScore = await kv.get(scoreKey) || { total: 0, attacks: {} }
    
    if (!currentScore.attacks[attackId]) {
      currentScore.attacks[attackId] = { steps: {}, total: 0 }
    }
    
    // Add points for this step
    currentScore.attacks[attackId].steps[stepId] = points
    currentScore.attacks[attackId].total = Object.values(currentScore.attacks[attackId].steps).reduce((a, b) => a + b, 0)
    
    // Recalculate total score
    currentScore.total = Object.values(currentScore.attacks)
      .reduce((total, attack) => total + attack.total, 0)
    
    await kv.set(scoreKey, currentScore)
    
    // Update attack-specific scores
    if (attackId) {
      const attack = await kv.get(`attack:${attackId}`)
      if (attack) {
        if (!attack.participantScores[session.username]) {
          attack.participantScores[session.username] = { steps: {}, total: 0 }
        }
        attack.participantScores[session.username].steps[stepId] = points
        attack.participantScores[session.username].total = Object.values(attack.participantScores[session.username].steps).reduce((a, b) => a + b, 0)
        await kv.set(`attack:${attackId}`, attack)
      }
    }
    
    console.log(`Score updated: ${session.username} (+${points} pts for ${stepId} in ${attackId})`)
    return c.json({ success: true, score: currentScore })
  } catch (error) {
    console.log('Score update error:', error)
    return c.json({ error: 'Failed to update score' }, 500)
  }
})

// Get all participant scores (facilitator only)
app.get('/make-server-af10fea3/scores/all/:sessionId', async (c) => {
  try {
    const sessionId = c.req.param('sessionId')
    
    // Verify facilitator role
    const session = await kv.get(`session:${sessionId}`)
    if (!session || session.role !== 'facilitator') {
      return c.json({ error: 'Unauthorized' }, 403)
    }
    
    // Get all scores
    const scoreKeys = await kv.getByPrefix('score:')
    const scores = scoreKeys.map(item => ({
      username: item.key.replace('score:', ''),
      ...item.value
    }))
    
    return c.json(scores)
  } catch (error) {
    console.log('Get all scores error:', error)
    return c.json({ error: 'Failed to get scores' }, 500)
  }
})

// Generate live log entries
app.get('/make-server-af10fea3/logs/stream', async (c) => {
  try {
    const simulation = await kv.get('current_simulation')
    
    if (!simulation || !simulation.isActive) {
      return c.json([])
    }
    
    // Generate realistic log entries based on current scenario
    const logEntries = generateLogEntries(simulation.scenarioId, simulation.currentStep)
    
    return c.json(logEntries)
  } catch (error) {
    console.log('Log stream error:', error)
    return c.json({ error: 'Failed to get logs' }, 500)
  }
})

function generateLogEntries(scenarioId: string, step: number) {
  const timestamp = new Date().toISOString()
  const baseTime = new Date().getTime()
  const entries = []
  
  switch (scenarioId) {
    case 'free-tier-exploit':
      // Generate progressive log entries that tell the story
      entries.push(
        // Normal baseline activity
        {
          timestamp: new Date(baseTime - 30000).toISOString(),
          level: 'INFO',
          endpoint: '/api/v1/analyze',
          user: 'premium_user_101',
          message: 'Standard premium tier API call',
          metadata: { calls_today: 2500, tier: 'premium', ip: '203.0.113.45' },
          educational_hint: '💡 Normal premium user behavior for comparison'
        },
        // First suspicious pattern
        {
          timestamp: new Date(baseTime - 25000).toISOString(),
          level: 'INFO',
          endpoint: '/api/v1/analyze',
          user: 'free_user_7891',
          message: 'Free tier API call completed',
          metadata: { calls_today: 998, tier: 'free', ip: '192.168.1.100', account_age_hours: 2 },
          educational_hint: '🔍 Notice the very new account and high usage'
        },
        {
          timestamp: new Date(baseTime - 20000).toISOString(),
          level: 'INFO',
          endpoint: '/api/v1/analyze',
          user: 'free_user_7892',
          message: 'Free tier API call completed',
          metadata: { calls_today: 999, tier: 'free', ip: '192.168.1.100', account_age_hours: 1 },
          educational_hint: '🚨 Same IP, different account, stopping at exactly 999 calls!'
        },
        // Pattern becomes obvious
        {
          timestamp: new Date(baseTime - 15000).toISOString(),
          level: 'WARN',
          endpoint: '/api/v1/analyze',
          user: 'free_user_7893',
          message: 'Free tier daily limit approaching',
          metadata: { calls_today: 999, tier: 'free', ip: '192.168.1.100', account_age_hours: 0.5 },
          educational_hint: '⚠️ Multiple accounts from same IP hitting exactly 999 calls'
        },
        // Automation detected
        {
          timestamp: new Date(baseTime - 10000).toISOString(),
          level: 'ALERT',
          endpoint: '/api/v1/analyze',
          user: 'free_user_7894',
          message: 'Potential automation detected: Account creation and immediate high usage',
          metadata: { calls_today: 999, tier: 'free', ip: '192.168.1.100', user_agent: 'python-requests/2.28.0' },
          educational_hint: '🤖 Bot signature: python-requests user agent + immediate usage'
        },
        // Current activity
        {
          timestamp,
          level: 'CRITICAL',
          endpoint: 'SYSTEM',
          user: 'SECURITY_MONITOR',
          message: '🚨 FREE TIER EXPLOIT DETECTED: 47 accounts from IP 192.168.1.100 each consuming exactly 999 API calls',
          metadata: { 
            total_accounts: 47, 
            total_calls: 46953,
            estimated_value_stolen: '$2347.65',
            pattern: 'account_multiplication'
          },
          educational_hint: '💸 Attackers are getting $2300+ worth of API calls for free!'
        }
      )
      break
      
    case 'credential-sharing':
      entries.push(
        // Normal usage pattern
        {
          timestamp: new Date(baseTime - 35000).toISOString(),
          level: 'INFO',
          endpoint: '/api/v1/data',
          user: 'api_key_abc123',
          message: 'API request completed successfully',
          metadata: { location: 'New York', ip: '10.0.0.1', user_agent: 'PostmanRuntime/7.32.3' },
          educational_hint: '✅ Normal usage from account holder\'s location'
        },
        // First geographic anomaly
        {
          timestamp: new Date(baseTime - 30000).toISOString(),
          level: 'WARN',
          endpoint: '/api/v1/data',
          user: 'api_key_abc123',
          message: 'Geographic anomaly detected',
          metadata: { location: 'London', ip: '203.0.113.89', travel_time_minutes: 15, user_agent: 'curl/7.68.0' },
          educational_hint: '🌍 Impossible travel: NYC to London in 15 minutes!'
        },
        // Pattern escalates
        {
          timestamp: new Date(baseTime - 25000).toISOString(),
          level: 'ALERT',
          endpoint: '/api/v1/data',
          user: 'api_key_abc123',
          message: 'Multiple concurrent sessions from different continents',
          metadata: { 
            locations: ['New York', 'London', 'Tokyo', 'Sydney'], 
            concurrent_sessions: 4,
            different_user_agents: 3
          },
          educational_hint: '🚨 Same API key active in 4 countries simultaneously!'
        },
        // Commercial sharing evidence
        {
          timestamp: new Date(baseTime - 15000).toISOString(),
          level: 'CRITICAL',
          endpoint: '/api/v1/data',
          user: 'api_key_abc123',
          message: 'Large scale credential sharing detected',
          metadata: { 
            unique_ips: 127,
            countries: 24,
            concurrent_sessions: 89,
            usage_increase: '2847%'
          },
          educational_hint: '💰 Usage increased 28x - this is commercial reselling!'
        },
        // Current state
        {
          timestamp,
          level: 'EMERGENCY',
          endpoint: 'SECURITY_MONITOR',
          user: 'FRAUD_DETECTION',
          message: '🔥 MASSIVE CREDENTIAL SHARING: API key shared across global network',
          metadata: { 
            total_countries: 24,
            active_sessions: 89,
            revenue_loss_hourly: '$1,247',
            sharing_network_size: 'commercial_scale'
          },
          educational_hint: '⚖️ Single $50/month API key serving 100+ users worldwide'
        }
      )
      break
      
    case 'shadow-endpoint':
      entries.push(
        // Normal API usage
        {
          timestamp: new Date(baseTime - 30000).toISOString(),
          level: 'INFO',
          endpoint: '/api/v1/public/search',
          user: 'user_jane_doe',
          message: 'Public API endpoint accessed successfully',
          metadata: { auth_required: true, auth_status: 'valid', response_time: '127ms' },
          educational_hint: '✅ Normal public endpoint with proper authentication'
        },
        // First shadow endpoint access
        {
          timestamp: new Date(baseTime - 25000).toISOString(),
          level: 'INFO',
          endpoint: '/api/internal/debug/system_info',
          user: 'user_hacker_42',
          message: 'Internal debug endpoint accessed',
          metadata: { auth_required: false, system_data_exposed: true, response_time: '45ms' },
          educational_hint: '🔍 Internal endpoint accessed - should this be public?'
        },
        // More dangerous access
        {
          timestamp: new Date(baseTime - 20000).toISOString(),
          level: 'WARN',
          endpoint: '/dev/backdoor/admin_panel',
          user: 'user_hacker_42',
          message: 'Development backdoor accessed',
          metadata: { 
            auth_required: false, 
            admin_functions_exposed: true,
            database_access: true,
            source_code_visible: true
          },
          educational_hint: '🚨 Development backdoor still active in production!'
        },
        // Data exfiltration
        {
          timestamp: new Date(baseTime - 15000).toISOString(),
          level: 'ALERT',
          endpoint: '/api/internal/debug/dump_users',
          user: 'user_hacker_42',
          message: 'User database dump downloaded',
          metadata: { 
            records_exposed: 15847,
            includes_passwords: true,
            includes_payment_info: true,
            file_size_mb: 23.7
          },
          educational_hint: '💀 Attacker downloaded entire user database!'
        },
        // Current threat level
        {
          timestamp,
          level: 'CRITICAL',
          endpoint: 'SECURITY_MONITOR',
          user: 'INTRUSION_DETECTION',
          message: '🕳️ SHADOW ENDPOINT EXPLOITATION: Unauthorized access to development/debug endpoints',
          metadata: { 
            exposed_endpoints: ['/api/internal/debug/*', '/dev/backdoor/*', '/admin/test/*'],
            data_compromised: 'user_database, payment_info, source_code',
            threat_level: 'CRITICAL',
            immediate_action_required: true
          },
          educational_hint: '🔧 These endpoints should never be accessible in production!'
        }
      )
      break
      
    case 'usage-laundering':
      entries.push(
        // Normal usage baseline
        {
          timestamp: new Date(baseTime - 35000).toISOString(),
          level: 'INFO',
          endpoint: '/api/v1/process',
          user: 'normal_business_123',
          message: 'Standard API request processed',
          metadata: { operations: 1, billed_units: 1, cost: '$0.05' },
          educational_hint: '✅ Normal 1:1 operation to billing ratio'
        },
        // Suspicious batch usage starts
        {
          timestamp: new Date(baseTime - 30000).toISOString(),
          level: 'INFO',
          endpoint: '/api/v1/batch_process',
          user: 'efficiency_corp_999',
          message: 'Batch processing request completed',
          metadata: { 
            operations_in_batch: 50,
            billed_units: 1,
            actual_cost: '$2.50',
            charged_cost: '$0.05',
            customer_id_count: 23
          },
          educational_hint: '🤔 50 operations but only billed for 1? Suspicious...'
        },
        // Pattern becomes obvious
        {
          timestamp: new Date(baseTime - 25000).toISOString(),
          level: 'WARN',
          endpoint: '/api/v1/batch_process',
          user: 'efficiency_corp_999',
          message: 'Large batch processing detected',
          metadata: { 
            operations_in_batch: 100,
            billed_units: 1,
            actual_cost: '$5.00',
            charged_cost: '$0.05',
            different_customer_ids: 87,
            usage_pattern: 'perfectly_flat_24_7'
          },
          educational_hint: '⚠️ 100 operations for price of 1 + flat 24/7 usage = commercial resale'
        },
        // Commercial evidence
        {
          timestamp: new Date(baseTime - 15000).toISOString(),
          level: 'ALERT',
          endpoint: '/api/v1/batch_process',
          user: 'efficiency_corp_999',
          message: 'Commercial API reselling detected through batch manipulation',
          metadata: { 
            operations_in_batch: 250,
            billed_units: 1,
            revenue_discrepancy: '$12.45 vs $0.05',
            end_customer_count: 234,
            resale_markup_detected: '400%'
          },
          educational_hint: '💰 They\'re charging customers $50/month while paying us $5!'
        },
        // Current situation
        {
          timestamp,
          level: 'EMERGENCY',
          endpoint: 'REVENUE_PROTECTION',
          user: 'BILLING_ANOMALY_DETECTOR',
          message: '💸 USAGE LAUNDERING DETECTED: Massive revenue loss through batch pricing exploit',
          metadata: { 
            monthly_revenue_loss: '$47,893',
            actual_usage_value: '$52,340',
            amount_billed: '$4,447',
            exploitation_method: 'batch_pricing_manipulation',
            commercial_resale_confirmed: true,
            end_customers_served: 847
          },
          educational_hint: '⚖️ One customer exploiting pricing to serve 800+ end users!'
        }
      )
      break
      
    default:
      // Default normal logs when no attack is active
      entries.push(
        {
          timestamp,
          level: 'INFO',
          endpoint: '/api/v1/status',
          user: 'health_check',
          message: 'System health check completed',
          metadata: { status: 'healthy', response_time: '23ms' }
        }
      )
      break
  }
  
  return entries
}

// Update simulation step
app.post('/make-server-af10fea3/simulation/step', async (c) => {
  try {
    const { sessionId, step } = await c.req.json()
    
    // Verify facilitator role
    const session = await kv.get(`session:${sessionId}`)
    if (!session || session.role !== 'facilitator') {
      return c.json({ error: 'Unauthorized' }, 403)
    }
    
    const simulation = await kv.get('current_simulation')
    if (simulation) {
      simulation.currentStep = step
      await kv.set('current_simulation', simulation)
    }
    
    return c.json({ success: true })
  } catch (error) {
    console.log('Update step error:', error)
    return c.json({ error: 'Failed to update step' }, 500)
  }
})

// Stop simulation (facilitator only)
app.post('/make-server-af10fea3/simulation/stop', async (c) => {
  try {
    const { sessionId } = await c.req.json()
    
    // Verify facilitator role
    const session = await kv.get(`session:${sessionId}`)
    if (!session || session.role !== 'facilitator') {
      return c.json({ error: 'Unauthorized' }, 403)
    }
    
    // Stop current simulation
    await kv.set('current_simulation', { isActive: false })
    
    console.log(`Simulation stopped by facilitator: ${session.username}`)
    return c.json({ success: true })
  } catch (error) {
    console.log('Stop simulation error:', error)
    return c.json({ error: 'Failed to stop simulation' }, 500)
  }
})

// Complete participant resolution for specific attack
app.post('/make-server-af10fea3/participant/complete', async (c) => {
  try {
    const { sessionId, attackId } = await c.req.json()
    
    // Verify user session
    const session = await kv.get(`session:${sessionId}`)
    if (!session) {
      return c.json({ error: 'Invalid session' }, 403)
    }
    
    const simulation = await kv.get('current_simulation')
    if (simulation && simulation.attackId === attackId) {
      // Mark this participant as completed
      if (!simulation.participantProgress) {
        simulation.participantProgress = {}
      }
      simulation.participantProgress[session.username] = {
        completed: true,
        completedAt: new Date().toISOString()
      }
      
      // Award completion bonus
      const completionBonus = 50
      
      // Update score directly
      const scoreKey = `score:${session.username}`
      const currentScore = await kv.get(scoreKey) || { total: 0, attacks: {} }
      
      if (!currentScore.attacks[attackId]) {
        currentScore.attacks[attackId] = { steps: {}, total: 0 }
      }
      
      currentScore.attacks[attackId].steps['completion_bonus'] = completionBonus
      currentScore.attacks[attackId].total = Object.values(currentScore.attacks[attackId].steps).reduce((a, b) => a + b, 0)
      currentScore.total = Object.values(currentScore.attacks).reduce((total, attack) => total + attack.total, 0)
      
      await kv.set(scoreKey, currentScore)
      
      // Update attack scores
      const attack = await kv.get(`attack:${attackId}`)
      if (attack) {
        if (!attack.participantScores[session.username]) {
          attack.participantScores[session.username] = { steps: {}, total: 0 }
        }
        attack.participantScores[session.username].steps['completion_bonus'] = completionBonus
        attack.participantScores[session.username].total = Object.values(attack.participantScores[session.username].steps).reduce((a, b) => a + b, 0)
        await kv.set(`attack:${attackId}`, attack)
      }
      
      await kv.set('current_simulation', simulation)
      
      console.log(`Participant ${session.username} completed attack ${attackId} (+${completionBonus} pts)`)
    }
    
    return c.json({ success: true })
  } catch (error) {
    console.log('Complete participant error:', error)
    return c.json({ error: 'Failed to complete participant' }, 500)
  }
})

// Get attack-specific participant scores (facilitator only)
app.get('/make-server-af10fea3/attacks/:attackId/scores/:sessionId', async (c) => {
  try {
    const attackId = c.req.param('attackId')
    const sessionId = c.req.param('sessionId')
    
    // Verify facilitator role
    const session = await kv.get(`session:${sessionId}`)
    if (!session || session.role !== 'facilitator') {
      return c.json({ error: 'Unauthorized' }, 403)
    }
    
    const attack = await kv.get(`attack:${attackId}`)
    if (!attack) {
      return c.json({ error: 'Attack not found' }, 404)
    }
    
    return c.json(attack.participantScores || {})
  } catch (error) {
    console.log('Get attack scores error:', error)
    return c.json({ error: 'Failed to get attack scores' }, 500)
  }
})

// Legacy resolve endpoint (keeping for compatibility)
app.post('/make-server-af10fea3/simulation/resolve', async (c) => {
  try {
    const { sessionId, scenarioId, resolvedBy } = await c.req.json()
    
    // Verify user session
    const session = await kv.get(`session:${sessionId}`)
    if (!session) {
      return c.json({ error: 'Invalid session' }, 403)
    }
    
    const simulation = await kv.get('current_simulation')
    if (simulation && simulation.scenarioId === scenarioId && simulation.attackId) {
      // Mark this participant as completed
      if (!simulation.participantProgress) {
        simulation.participantProgress = {}
      }
      simulation.participantProgress[session.username] = {
        completed: true,
        completedAt: new Date().toISOString()
      }
      
      await kv.set('current_simulation', simulation)
    }
    
    return c.json({ success: true })
  } catch (error) {
    console.log('Resolve incident error:', error)
    return c.json({ error: 'Failed to resolve incident' }, 500)
  }
})

// Get threat-specific dashboard metrics
app.get('/make-server-af10fea3/dashboard/metrics', async (c) => {
  try {
    const simulation = await kv.get('current_simulation')
    
    if (!simulation || !simulation.isActive) {
      // Return normal baseline metrics
      return c.json({
        isActive: false,
        metrics: {
          totalRequests: 15847,
          successRate: 99.2,
          errorRate: 0.8,
          avgResponseTime: 127,
          activeUsers: 1247,
          revenue: 18934.50,
          costs: 2847.30,
          alertLevel: 'normal'
        }
      })
    }
    
    // Return threat-specific metrics based on scenario
    const threatMetrics = generateThreatMetrics(simulation.scenarioId)
    
    return c.json({
      isActive: true,
      scenarioId: simulation.scenarioId,
      attackId: simulation.attackId,
      metrics: threatMetrics
    })
  } catch (error) {
    console.log('Dashboard metrics error:', error)
    return c.json({ error: 'Failed to get dashboard metrics' }, 500)
  }
})

function generateThreatMetrics(scenarioId: string) {
  const baseTime = new Date().getTime()
  
  switch (scenarioId) {
    case 'free-tier-exploit':
      return {
        totalRequests: 73284, // Dramatically increased due to exploit
        successRate: 99.8, // High success rate makes it harder to detect
        errorRate: 0.2,
        avgResponseTime: 89, // Faster responses from automated tools
        activeUsers: 1294, // 47 fake accounts + normal users
        revenue: 18934.50, // Same revenue (they're not paying)
        costs: 23847.30, // MUCH higher costs
        alertLevel: 'critical',
        threatSpecific: {
          freeAccountsCreated: 47,
          suspiciousIPs: 3,
          automationDetected: true,
          revenueLeakage: 4913.20,
          exploitedAccounts: 47,
          avgAccountAge: '1.2 hours'
        }
      }
      
    case 'credential-sharing':
      return {
        totalRequests: 89347, // Massively increased usage
        successRate: 98.7,
        errorRate: 1.3,
        avgResponseTime: 234, // Slower due to geographic spread
        activeUsers: 1336, // Same account count, but geo-distributed
        revenue: 18934.50, // Same revenue from single customer
        costs: 8947.20, // Higher infrastructure costs
        alertLevel: 'critical',
        threatSpecific: {
          uniqueCountries: 24,
          concurrentSessions: 89,
          impossibleTravelEvents: 156,
          credentialSharing: true,
          estimatedSharingScale: 'commercial',
          revenuePerUser: '$0.56' // Should be $50
        }
      }
      
    case 'shadow-endpoint':
      return {
        totalRequests: 16234, // Slightly higher than normal
        successRate: 99.5,
        errorRate: 0.5,
        avgResponseTime: 98,
        activeUsers: 1248,
        revenue: 18934.50,
        costs: 2891.40,
        alertLevel: 'critical',
        threatSpecific: {
          unauthorizedEndpoints: 7,
          debugEndpointsHit: 23,
          adminPanelAccess: 12,
          dataExfiltrated: '23.7MB',
          exposedRecords: 15847,
          vulnerableEndpoints: ['/api/internal/debug/*', '/dev/backdoor/*']
        }
      }
      
    case 'usage-laundering':
      return {
        totalRequests: 234891, // Extremely high usage
        successRate: 99.9, // Perfect success rate - automated
        errorRate: 0.1,
        avgResponseTime: 45, // Very fast - optimized automation
        activeUsers: 1248, // Normal user count (hidden behind batching)
        revenue: 19234.50, // Only slightly higher revenue
        costs: 23847.30, // Massive cost increase
        alertLevel: 'emergency',
        threatSpecific: {
          batchOperationsToday: 4723,
          actualOperations: 234891,
          billedOperations: 4723,
          revenueDiscrepancy: 47893.20,
          endCustomersDetected: 847,
          commercialResale: true,
          profitMargin: '400%'
        }
      }
      
    default:
      return {
        totalRequests: 15847,
        successRate: 99.2,
        errorRate: 0.8,
        avgResponseTime: 127,
        activeUsers: 1247,
        revenue: 18934.50,
        costs: 2847.30,
        alertLevel: 'normal'
      }
  }
}

console.log('API Monetization Defense Server starting...')
Deno.serve(app.fetch)