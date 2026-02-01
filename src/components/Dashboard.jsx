import { useState, useEffect, useRef } from 'react'
import './Dashboard.css'
import DashboardChart from './DashboardChart'

function Dashboard() {
  const [dashboards, setDashboards] = useState([])
  const [selectedDashboard, setSelectedDashboard] = useState(null)
  const [isLoadingList, setIsLoadingList] = useState(true)
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false)
  const [activeCategory, setActiveCategory] = useState('compliance')

  // Chat assistant state
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [isChatLoading, setIsChatLoading] = useState(false)
  const [isCreatingAlert, setIsCreatingAlert] = useState(false)
  const chatEndRef = useRef(null)

  const categories = [
    { id: 'compliance', label: 'Compliance' },
    { id: 'security', label: 'Security' },
    { id: 'risk', label: 'Risk' }
  ]

  // Scroll chat to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  // Fetch list of dashboards on mount
  useEffect(() => {
    fetchDashboards()
  }, [])

  // Reset chat when dashboard changes
  useEffect(() => {
    setChatMessages([])
    setChatInput('')
  }, [selectedDashboard?.id])

  const fetchDashboards = async () => {
    setIsLoadingList(true)
    try {
      const useDemoMode4 = false

      if (useDemoMode4) {
        await new Promise(resolve => setTimeout(resolve, 800))

        const mockDashboards = [
          { id: 'dash_001', name: 'Compliance Overview', domain_type: 'compliance', created_at: '2026-01-15' },
          { id: 'dash_002', name: 'Regulatory Status Report', domain_type: 'compliance', created_at: '2026-01-14' },
          { id: 'dash_003', name: 'KYC Verification Dashboard', domain_type: 'compliance', created_at: '2026-01-13' },
          { id: 'dash_004', name: 'Security Metrics', domain_type: 'security', created_at: '2026-01-16' },
          { id: 'dash_005', name: 'Access Control Report', domain_type: 'security', created_at: '2026-01-12' },
          { id: 'dash_006', name: 'Vulnerability Assessment', domain_type: 'security', created_at: '2026-01-11' },
          { id: 'dash_007', name: 'Risk Assessment Q1', domain_type: 'risk', created_at: '2026-01-17' },
          { id: 'dash_008', name: 'Operational Risk Overview', domain_type: 'risk', created_at: '2026-01-10' },
        ]
        setDashboards(mockDashboards)
      } else {
        const response = await fetch('http://localhost:8080/api/v1/dashboards', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })
        const data = await response.json()
        setDashboards(data.dashboards || [])
      }
    } catch (error) {
      console.error('Error fetching dashboards:', error)
    } finally {
      setIsLoadingList(false)
    }
  }

  const fetchDashboardDetails = async (dashboardId) => {
    setIsLoadingDashboard(true)
    try {
      const useDemoMode3 = false

      if (useDemoMode3) {
        await new Promise(resolve => setTimeout(resolve, 600))

        const dashboard = dashboards.find(d => d.dashboardId === dashboardId)

        const mockDetails = {
          id: dashboardId,
          name: dashboard?.name || 'Dashboard',
          domain_type: dashboard?.domain_type || 'compliance',
          graphs_array: [
            {
              query: 'Show regulatory compliance status',
              graph_type: 'bar',
              attributes: {
                x_axis: { key: 'labels', values: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'] },
                y_axis: { key: 'values', values: [85, 88, 92, 89, 94, 96] }
              }
            },
            {
              query: 'Policy adherence rates by department',
              graph_type: 'bar',
              attributes: {
                x_axis: { key: 'labels', values: ['Finance', 'IT', 'HR', 'Operations', 'Legal'] },
                y_axis: { key: 'values', values: [95, 88, 92, 85, 98] }
              }
            },
            {
              query: 'Monthly audit completion',
              graph_type: 'bar',
              attributes: {
                x_axis: { key: 'labels', values: ['Week 1', 'Week 2', 'Week 3', 'Week 4'] },
                y_axis: { key: 'values', values: [12, 18, 15, 22] }
              }
            }
          ]
        }
        setSelectedDashboard(mockDetails)
      } else {
        const response = await fetch(`http://localhost:8080/api/v1/dashboards/${dashboardId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })
        const data = await response.json()
        setSelectedDashboard(data)
      }
    } catch (error) {
      console.error('Error fetching dashboard details:', error)
    } finally {
      setIsLoadingDashboard(false)
    }
  }

  const handleDashboardClick = (dashboardId) => {
    fetchDashboardDetails(dashboardId)
  }

  const handleBackToList = () => {
    setSelectedDashboard(null)
    setChatMessages([])
  }

  // Check if response contains SQL query
  const containsSqlQuery = (text) => {
    const sqlKeywords = ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'ALTER', 'DROP']
    const upperText = text.toUpperCase()
    return sqlKeywords.some(keyword => upperText.includes(keyword))
  }

  // Extract SQL query from response
  const extractSqlQuery = (text) => {
    // Try to find SQL between code blocks
    const codeBlockMatch = text.match(/```sql?\s*([\s\S]*?)```/i)
    if (codeBlockMatch) {
      return codeBlockMatch[1].trim()
    }

    // Try to find SQL pattern
    const sqlMatch = text.match(/(SELECT[\s\S]*?;)/i)
    if (sqlMatch) {
      return sqlMatch[1].trim()
    }

    return text
  }

  // Trigger alert creation API
  const createAlert = async (sqlQuery, alertName) => {
    setIsCreatingAlert(true)
    try {
      const useDemoMode = true

      const payload = {
        dashboard_id: selectedDashboard.id,
        alert_name: alertName,
        sql_query: sqlQuery,
        domain_type: selectedDashboard.domain_type
      }

      if (useDemoMode) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        console.log('Create Alert Payload:', JSON.stringify(payload, null, 2))

        setChatMessages(prev => [...prev, {
          role: 'system',
          content: `✅ Alert "${alertName}" created successfully! The system will now monitor for anomalies based on the configured query.`
        }])
      } else {
        const response = await fetch('http://localhost:8080/api/v1/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        if (!response.ok) {
          throw new Error('Failed to create alert')
        }

        const result = await response.json()
        setChatMessages(prev => [...prev, {
          role: 'system',
          content: `✅ Alert "${alertName}" created successfully! Alert ID: ${result.alert_id}`
        }])
      }
    } catch (error) {
      console.error('Error creating alert:', error)
      setChatMessages(prev => [...prev, {
        role: 'system',
        content: '❌ Failed to create alert. Please try again.'
      }])
    } finally {
      setIsCreatingAlert(false)
    }
  }

  // Send chat message
  const sendChatMessage = async (message) => {
    if (!message.trim()) return

    const userMessage = { role: 'user', content: message }
    setChatMessages(prev => [...prev, userMessage])
    setChatInput('')
    setIsChatLoading(true)

    try {
      const useDemoMode = false

      let data
      if (useDemoMode) {
        await new Promise(resolve => setTimeout(resolve, 1200))

        const msgLower = message.toLowerCase()

        // Simulate conversation flow
        if (msgLower.includes('alert') && (msgLower.includes('create') || msgLower.includes('set up') || msgLower.includes('configure'))) {
          data = {
            response: "I can help you create an alert. What condition would you like to monitor? For example:\n\n• Alert when compliance score drops below 80%\n• Alert when failed login attempts exceed 10 per hour\n• Alert when transaction volume spikes above normal",
            sql_query: null
          }
        } else if (msgLower.includes('compliance') && msgLower.includes('below')) {
          data = {
            response: "I'll create an alert for when compliance score drops below your threshold. Here's the monitoring query:\n\n```sql\nSELECT department, compliance_score, recorded_at \nFROM compliance_metrics \nWHERE compliance_score < 80 \nAND recorded_at > NOW() - INTERVAL '1 hour'\nORDER BY compliance_score ASC;\n```\n\nShall I activate this alert? Please provide a name for this alert.",
            sql_query: "SELECT department, compliance_score, recorded_at FROM compliance_metrics WHERE compliance_score < 80 AND recorded_at > NOW() - INTERVAL '1 hour' ORDER BY compliance_score ASC;"
          }
        } else if (msgLower.includes('login') || msgLower.includes('failed')) {
          data = {
            response: "I'll set up an alert for failed login attempts. Here's the detection query:\n\n```sql\nSELECT user_id, COUNT(*) as failed_attempts, MAX(attempt_time) as last_attempt \nFROM login_attempts \nWHERE status = 'failed' \nAND attempt_time > NOW() - INTERVAL '1 hour' \nGROUP BY user_id \nHAVING COUNT(*) > 10;\n```\n\nShall I activate this alert? Please provide a name for this alert.",
            sql_query: "SELECT user_id, COUNT(*) as failed_attempts, MAX(attempt_time) as last_attempt FROM login_attempts WHERE status = 'failed' AND attempt_time > NOW() - INTERVAL '1 hour' GROUP BY user_id HAVING COUNT(*) > 10;"
          }
        } else if (msgLower.includes('transaction') || msgLower.includes('spike')) {
          data = {
            response: "I'll create an alert for unusual transaction volume spikes. Here's the anomaly detection query:\n\n```sql\nSELECT DATE(transaction_time) as date, COUNT(*) as tx_count, \n       AVG(amount) as avg_amount \nFROM transactions \nWHERE transaction_time > NOW() - INTERVAL '24 hours' \nGROUP BY DATE(transaction_time) \nHAVING COUNT(*) > (SELECT AVG(daily_count) * 2 FROM daily_stats);\n```\n\nShall I activate this alert? Please provide a name for this alert.",
            sql_query: "SELECT DATE(transaction_time) as date, COUNT(*) as tx_count, AVG(amount) as avg_amount FROM transactions WHERE transaction_time > NOW() - INTERVAL '24 hours' GROUP BY DATE(transaction_time) HAVING COUNT(*) > (SELECT AVG(daily_count) * 2 FROM daily_stats);"
          }
        } else if (msgLower.includes('yes') || msgLower.includes('activate') || msgLower.includes('name')) {
          // Extract alert name from message
          const nameMatch = message.match(/["']([^"']+)["']/) || message.match(/name[:\s]+(\w[\w\s]+)/i)
          const alertName = nameMatch ? nameMatch[1].trim() : 'Anomaly Alert ' + Date.now()

          // Find the last SQL query in chat
          const lastSqlMessage = [...chatMessages].reverse().find(m => m.sql_query)

          if (lastSqlMessage?.sql_query) {
            data = {
              response: `Creating alert "${alertName}"...`,
              sql_query: lastSqlMessage.sql_query,
              create_alert: true,
              alert_name: alertName
            }
          } else {
            data = {
              response: "Please first describe what anomaly you'd like to monitor, and I'll generate the appropriate detection query.",
              sql_query: null
            }
          }
        } else {
          data = {
            response: "I'm your Anomaly Detection Assistant. I can help you:\n\n🔔 **Create Alerts** - Set up monitoring rules\n📊 **Detect Anomalies** - Find unusual patterns\n⚠️ **Configure Thresholds** - Define alert conditions\n\nWhat would you like to monitor on this dashboard?",
            sql_query: null
          }
        }
      } else {
        const response = await fetch('http://localhost:8080/api/v1/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: message,
            domain: selectedDashboard.domain_type,
            conversation_history: chatMessages
          }),
        })
        data = await response.json()
      }

      const assistantMessage = {
        role: 'assistant',
        content: data.response,
        sql_query: data.sql_query
      }
      setChatMessages(prev => [...prev, assistantMessage])

      // If response has create_alert flag, trigger alert creation
      if (data.create_alert && data.sql_query) {
        await createAlert(data.sql_query, data.alert_name || 'Anomaly Alert')
      }

    } catch (error) {
      console.error('Error sending chat message:', error)
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      }])
    } finally {
      setIsChatLoading(false)
    }
  }

  const handleChatSubmit = (e) => {
    e.preventDefault()
    sendChatMessage(chatInput)
  }

  // Filter dashboards by active category
  const filteredDashboards = dashboards

  // Render dashboard list view
  if (!selectedDashboard) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h2>📊 My Dashboards</h2>

          <div className="dashboard-category-tabs">
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`dashboard-category-tab ${activeCategory === cat.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                {cat.label}
                <span className="tab-count">
                  {dashboards.filter(d => d.domain_type === cat.id).length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {isLoadingList ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading dashboards...</p>
          </div>
        ) : filteredDashboards.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📭</span>
            <h3>No {activeCategory} Dashboards</h3>
            <p>Create a dashboard by saving graphs from the Query tab</p>
          </div>
        ) : (
          <div className="dashboards-grid">
            {filteredDashboards.map((dashboard) => (
              <div
                key={dashboard.dashboardId}
                className="dashboard-tile"
                onClick={() => handleDashboardClick(dashboard.dashboardId)}
              >
                <div className="tile-content">
                  <h3 className="tile-name">{dashboard.dashboardName}</h3>
                </div>
                <span className="tile-arrow">›</span>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Render selected dashboard with graphs and chat assistant
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <button className="back-button" onClick={handleBackToList}>
          ← Back to Dashboards
        </button>
        <div className="dashboard-title-section">
          <h2>{selectedDashboard.name}</h2>
          <span className="domain-badge">
            {selectedDashboard.domain_type}
          </span>
        </div>
      </div>

      {isLoadingDashboard ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      ) : (
        <div className="dashboard-content">
          {/* Graphs Section */}
          <div className="graphs-section">
            <div className="graphs-grid">
              {selectedDashboard.graphsArray?.map((graph, index) => (
                <div key={index} className="graph-card">
                  <div className="graph-card-header">
                    <h4 className="graph-card-title">{graph.query}</h4>
                    <span className="graph-type-badge">{graph.graphType}</span>
                  </div>
                  <div className="graph-card-body">
                    <div className="graph-card-body">
                      <DashboardChart graph={graph} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Anomaly Detection Assistant */}
          <div className="chat-assistant">
            <div className="chat-assistant-header">
              <span className="assistant-icon">🤖</span>
              <h3>Anomaly Detection Assistant</h3>
            </div>

            <div className="chat-assistant-messages">
              {chatMessages.length === 0 ? (
                <div className="chat-welcome">
                  <span className="chat-welcome-icon">🔔</span>
                  <p>Hi! I can help you create alerts and detect anomalies on this dashboard. What would you like to monitor?</p>
                </div>
              ) : (
                chatMessages.map((msg, index) => (
                  <div key={index} className={`chat-message ${msg.role}`}>
                    <div className="chat-message-content">
                      {msg.content}
                    </div>
                    {msg.sql_query && (
                      <div className="sql-indicator">
                        <span className="sql-badge">SQL Query Generated</span>
                      </div>
                    )}
                  </div>
                ))
              )}
              {isChatLoading && (
                <div className="chat-message assistant">
                  <div className="chat-message-content loading">
                    <span className="typing-indicator">
                      <span></span><span></span><span></span>
                    </span>
                  </div>
                </div>
              )}
              {isCreatingAlert && (
                <div className="chat-message system">
                  <div className="chat-message-content">
                    <div className="creating-alert">
                      <div className="mini-spinner"></div>
                      Creating alert...
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <form className="chat-input-form" onSubmit={handleChatSubmit}>
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Describe the alert you want to create..."
                className="chat-input"
                disabled={isChatLoading || isCreatingAlert}
              />
              <button
                type="submit"
                className="chat-send-btn"
                disabled={isChatLoading || isCreatingAlert || !chatInput.trim()}
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
