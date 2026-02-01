import { useState, useEffect } from 'react'
import './QueryInterface.css'
import DynamicChart from './DynamicChart'

function QueryInterface({ category = 'compliance' }) {
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showChartTypeModal, setShowChartTypeModal] = useState(false);
  const [selectedChartType, setSelectedChartType] = useState(null);
  const [graphData, setGraphData] = useState(null)
  const [showGraphModal, setShowGraphModal] = useState(false)
  const [savedGraphs, setSavedGraphs] = useState([])
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [dashboardName, setDashboardName] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // Conversation management state
  const [conversationId, setConversationId] = useState(null)
  const [conversationHistory, setConversationHistory] = useState({}) // { category: [{ id, messages, savedGraphs, title, timestamp }] }
  const [activeConversationIndex, setActiveConversationIndex] = useState(null)

  // Helper to get conversation title from first user message
  const getConversationTitle = (msgs) => {
    const firstUserMsg = msgs.find(m => m.role === 'user')
    if (!firstUserMsg) return 'New Conversation'
    return firstUserMsg.content.length > 40
      ? firstUserMsg.content.substring(0, 40) + '...'
      : firstUserMsg.content
  }

  // Save current conversation to history
  const saveCurrentConversation = (prevCategory) => {
    if (messages.length > 0 && conversationId) {
      setConversationHistory(prev => {
        const categoryHistory = prev[prevCategory] || []
        // Check if conversation already exists in history
        const existingIndex = categoryHistory.findIndex(c => c.id === conversationId)

        const conversationData = {
          id: conversationId,
          messages: messages,
          savedGraphs: savedGraphs,
          title: getConversationTitle(messages),
          timestamp: Date.now()
        }

        if (existingIndex >= 0) {
          // Update existing conversation
          const updated = [...categoryHistory]
          updated[existingIndex] = conversationData
          return { ...prev, [prevCategory]: updated }
        } else {
          // Add new conversation
          return { ...prev, [prevCategory]: [...categoryHistory, conversationData] }
        }
      })
    }
  }

  // Start a new conversation
  const startNewConversation = () => {
    // Save current conversation first
    if (messages.length > 0 && conversationId) {
      saveCurrentConversation(category)
    }

    const newId = crypto.randomUUID()
    setConversationId(newId)
    setMessages([])
    setSavedGraphs([])
    setActiveConversationIndex(null)
    setInputValue('')
    setGraphData(null)
    setShowGraphModal(false)
  }

  // Load a conversation from history
  const loadConversation = (conversation, index) => {
    // Save current conversation before loading another
    if (messages.length > 0 && conversationId) {
      saveCurrentConversation(category)
    }

    setConversationId(conversation.id)
    setMessages(conversation.messages)
    setSavedGraphs(conversation.savedGraphs || [])
    setActiveConversationIndex(index)
    setInputValue('')
    setGraphData(null)
    setShowGraphModal(false)
  }

  // Handle category changes - save current and reset for new category
  useEffect(() => {
    // Save current conversation before switching (need to track previous category)
    return () => {
      // Cleanup is handled by the next effect
    }
  }, [])

  // Track previous category for saving
  const [prevCategory, setPrevCategory] = useState(category)

  useEffect(() => {
    if (prevCategory !== category) {
      // Save conversation from previous category
      if (messages.length > 0 && conversationId) {
        saveCurrentConversation(prevCategory)
      }

      // Reset for new category
      setMessages([])
      setInputValue('')
      setIsLoading(false)
      setShowChartTypeModal(false)
      setSelectedChartType(null)
      setGraphData(null)
      setShowGraphModal(false)
      setSavedGraphs([])
      setShowSaveModal(false)
      setDashboardName('')

      // Start fresh conversation for new category
      setConversationId(crypto.randomUUID())
      setActiveConversationIndex(null)

      setPrevCategory(category)
    }
  }, [category, prevCategory, messages, conversationId, savedGraphs])

  // Initialize conversation ID on mount
  useEffect(() => {
    if (!conversationId) {
      setConversationId(crypto.randomUUID())
    }
  }, [])

  // Category-based suggested queries
  const categorizedQueries = {
    compliance: [
      "Show regulatory compliance status",
      "Pending audit items",
      "Data privacy compliance report",
      "License compliance across teams",
      "Policy adherence rates",
      "Certification expiry dates",
      "KYC verification status"
    ],
    security: [
      "Recent security incidents",
      "Unauthorized access attempts",
      "Vulnerability scan results",
      "Password policy compliance",
      "Multi-factor authentication status",
      "High-risk user accounts",
      "Firewall breach attempts"
    ],
    risk: [
      "Top risk indicators",
      "Operational risk assessment",
      "Business continuity metrics",
      "Third-party risk scores",
      "Critical system vulnerabilities",
      "Incident impact analysis",
      "Market exposure report"
    ]
  }

  const CHART_TYPES = [
    { key: "bar", label: "Bar Chart" },
    { key: "line", label: "Line Chart" },
    { key: "pie", label: "Pie Chart" },
    { key: "doughnut", label: "Doughnut Chart" },
    { key: "scatter", label: "Scatter Plot" },
    { key: "table", label: "Table" },
  ];


  const suggestedQueries = categorizedQueries[category] || categorizedQueries.compliance

  const generateMockGraphData = (query) => {
    const mockDataSets = {
      revenue: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        values: [65000, 72000, 80000, 85000, 78000, 92000]
      },
      transactions: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        values: [120, 145, 132, 167, 189, 98, 76]
      },
      users: {
        labels: ['User A', 'User B', 'User C', 'User D', 'User E'],
        values: [45000, 38000, 32000, 28000, 25000]
      },
      risk: {
        labels: ['Low', 'Medium', 'High', 'Critical'],
        values: [65, 25, 8, 2]
      },
      countries: {
        labels: ['UAE', 'Saudi', 'Qatar', 'Bahrain', 'Kuwait'],
        values: [340, 280, 150, 120, 95]
      }
    }

    const queryLower = query.toLowerCase()
    if (queryLower.includes('transaction') || queryLower.includes('volume')) {
      return mockDataSets.transactions
    } else if (queryLower.includes('user') || queryLower.includes('top')) {
      return mockDataSets.users
    } else if (queryLower.includes('risk') || queryLower.includes('flag')) {
      return mockDataSets.risk
    } else if (queryLower.infcludes('country') || queryLower.includes('region')) {
      return mockDataSets.countries
    }
    return mockDataSets.revenue
  }

  function transformChartData(results, visualizationConfig) {
    const { x_axis_key, y_axis_key } = visualizationConfig;

    // Handle x_axis_key - can be a string or array of strings
    const xKeys = Array.isArray(x_axis_key) ? x_axis_key : [x_axis_key];
    // Handle y_axis_key - can be a string or array of strings
    const yKeys = Array.isArray(y_axis_key) ? y_axis_key : [y_axis_key];

    // Build labels (x-axis values)
    // If multiple x keys, combine them or keep as array for table display
    let labels;
    if (xKeys.length === 1) {
      labels = results.map(item => item[xKeys[0]]);
    } else {
      // Multiple x columns - for tables, keep as objects; for charts, combine
      labels = results.map(item =>
        xKeys.map(key => item[key])
      );
    }

    // Build datasets (y-axis values)
    // If single y key, keep simple structure for backward compatibility
    if (yKeys.length === 1) {
      return {
        labels,
        values: results.map(item => item[yKeys[0]]),
        xKeys,
        yKeys
      };
    }

    // Multiple y keys - create datasets array for multi-series charts
    const datasets = yKeys.map(key => ({
      label: key,
      values: results.map(item => item[key])
    }));

    return {
      labels,
      datasets,
      xKeys,
      yKeys
    };
  }

  const sendQuery = async (query) => {
    if (!query.trim()) return

    const userMessage = { role: 'user', content: query }
    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      const useDemoMode = false

      let data
      // Use the persistent conversation_id from state
      const conversation_id = conversationId;
      if (useDemoMode) {
        await new Promise(resolve => setTimeout(resolve, 1000))

        const queryLower = query.toLowerCase()
        const isFinalQuery = queryLower.includes('show') ||
          queryLower.includes('display') ||
          queryLower.includes('graph') ||
          queryLower.includes('yes') ||
          queryLower.includes('confirm')

        if (isFinalQuery) {
          data = {
            questions: "Here are the results for your query.",
            is_final: true,
            graph_data: generateMockGraphData(query),
            graph_type: 'bar'
          }
        } else {
          data = {
            questions: "I found some relevant data. Would you like to:\n\n• View detailed breakdown\n• See trend analysis\n• Show comparison report\n\nPlease specify which analysis you'd like to see.",
            is_final: false
          }
        }
      } else {
        const response = await fetch('http://localhost:8080/api/v1/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, conversation_id }),
        })
        data = await response.json()
      }
      var display_content = ""
      if (data.is_final === true) {
        display_content = data.visualization_config.description
      } else {
        display_content = data.clarification_question
      }

      const assistantMessage = {
        role: 'assistant',
        content: display_content
      }
      setMessages(prev => [...prev, assistantMessage])

      if (data.is_final === true && data.visualization_config.x_axis_key !== null && data.visualization_config.y_axis_key !== null) {
        setGraphData({
          id: conversation_id,
          query: query,
          description: data.visualization_config.description,
          data: transformChartData(data.results, data.visualization_config),
          recommendedType: data.visualization_config.chart_type || 'bar',
          type: data.visualization_config.chart_type || 'bar'
        })
        setSelectedChartType(graphData.type); // recommended type
        console.log('Graph Data = ', graphData);
        setShowGraphModal(true)
      }
    } catch (error) {
      console.log('Error calling API:', error)
      const errorMessage = {
        role: 'assistant',
        content: 'Error: Unable to process your request. Please try again.'
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    sendQuery(inputValue)
  }

  const handleAddToDashboard = () => {
    const finalGraph = {
      ...graphData,
      id: crypto.randomUUID(),
      conversationId: conversationId, // Track which conversation this graph belongs to
    };

    setSavedGraphs(prev => [...prev, finalGraph]);
    closeModal();
  };

  const handleRemoveGraph = (graphId) => {
    setSavedGraphs(prev => prev.filter(g => g.id !== graphId))
  }

  const closeModal = () => {
    setShowGraphModal(false)
  }

  const openSaveModal = () => {
    setDashboardName('')
    setShowSaveModal(true)
  }

  const closeSaveModal = () => {
    setShowSaveModal(false)
    setDashboardName('')
  }

  const handleSaveDashboard = async () => {
    if (!dashboardName.trim()) {
      alert('Please enter a dashboard name')
      return
    }

    setIsSaving(true)

    // Format the graphs_array according to API spec
    const graphsArray = savedGraphs.map(graph => {
      const hasMultipleDatasets = graph.data.datasets && Array.isArray(graph.data.datasets);

      return {
        query: graph.query,
        graphType: graph.type,
        attributes: {
          xAxis: {
            keys: graph.data.xKeys || ['labels'],
            values: graph.data.labels
          },
          yAxis: hasMultipleDatasets
            ? {
              keys: graph.data.yKeys || graph.data.datasets.map(ds => ds.label),
              datasets: graph.data.datasets
            }
            : {
              keys: graph.data.yKeys || ['values'],
              values: graph.data.values
            }
        }
      };
    })

    const payload = {
      userId: 'current_user_id', // TODO: Get from auth context
      dashboardName: dashboardName.trim(),
      domainType: category,
      graphsArray: graphsArray
    }

    try {
      const useDemoMode2 = false

      if (useDemoMode2) {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        console.log('Save Dashboard Payload:', JSON.stringify(payload, null, 2))
        alert(`Dashboard "${dashboardName}" saved successfully!`)
      } else {
        const response = await fetch('http://localhost:8080/api/v1/dashboards', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        if (!response.ok) {
          throw new Error('Failed to save dashboard')
        }

        const result = await response.json()
        alert(`Dashboard "${dashboardName}" saved successfully!`)
      }

      closeSaveModal()
      // Optionally clear saved graphs after saving
      // setSavedGraphs([])
    } catch (error) {
      console.error('Error saving dashboard:', error)
      alert('Error saving dashboard. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  // Mini bar chart component for saved graphs
  const MiniBarChart = ({ data }) => (
    <div className="mini-bar-chart">
      {data.labels.map((label, index) => (
        <div key={index} className="mini-bar-item">
          <div
            className="mini-bar"
            style={{
              height: `${(data.values[index] / Math.max(...data.values)) * 100}%`
            }}
          />
        </div>
      ))}
    </div>
  )

  return (
    <div className="query-interface">
      {/* Main Query Panel */}
      <div className={`query-panel ${savedGraphs.length > 0 ? 'with-sidebar' : ''} ${conversationHistory[category]?.length > 0 ? 'with-history' : ''}`}>
        <div className="query-panel-header">
          <span className="query-icon">🔍</span>
          <h3>Natural Language Query</h3>
          <button
            className="new-conversation-btn"
            onClick={startNewConversation}
            title="Start new conversation"
          >
            + New
          </button>
        </div>

        <div className="chat-messages">
          {messages.length === 0 ? (
            <div className="welcome-section">
              <div className="welcome-message">
                Welcome to DerivInsight! Ask me anything about your {category} data.
              </div>

              {/* Try These Queries */}
              <div className="suggestions-inline">
                <div className="suggestions-header">
                  <span className="sparkle-icon">✨</span>
                  <h4>Try These Queries</h4>
                </div>
                <div className="suggestions-grid">
                  {suggestedQueries.map((query, index) => (
                    <button
                      key={index}
                      className="suggestion-chip"
                      onClick={() => sendQuery(query)}
                      disabled={isLoading}
                    >
                      {query}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            messages.map((message, index) => (
              <div key={index} className={`message ${message.role}`}>
                <div className="message-content">{message.content}</div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="message assistant">
              <div className="message-content loading">Thinking...</div>
            </div>
          )}
        </div>

        <form className="input-form" onSubmit={handleSubmit}>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask a question about your data..."
            className="query-input"
            disabled={isLoading}
          />
          <button type="submit" className="send-button" disabled={isLoading || !inputValue.trim()}>
            🔍 Query
          </button>
        </form>
      </div>

      {/* Saved Graphs Panel */}
      {savedGraphs.length > 0 && (
        <div className="saved-graphs-panel">
          <div className="saved-graphs-header">
            <span className="chart-icon">📊</span>
            <h3>Saved Graphs</h3>
            <span className="graph-count">{savedGraphs.length}</span>
          </div>
          <div className="saved-graphs-list">
            {savedGraphs.map((graph) => (
              <div key={graph.id} className="saved-graph-card">
                <div className="saved-graph-header">
                  <span className="saved-graph-title" title={graph.query}>
                    {graph.query.length > 30 ? graph.query.substring(0, 30) + '...' : graph.query}
                  </span>
                  <button
                    className="remove-graph-btn"
                    onClick={() => handleRemoveGraph(graph.id)}
                    title="Remove graph"
                  >
                    ×
                  </button>
                </div>
                <DynamicChart
                  type={graph.type || "bar"}
                  data={graph.data}
                />
              </div>
            ))}
          </div>
          <div className="saved-graphs-footer">
            <button className="save-dashboard-btn" onClick={openSaveModal}>
              💾 Save Dashboard
            </button>
          </div>
        </div>
      )}

      {/* Conversation History Sidebar */}
      {conversationHistory[category] && conversationHistory[category].length > 0 && (
        <div className="conversation-history-panel">
          <div className="conversation-history-header">
            <span className="history-icon">💬</span>
            <h3>Chat History</h3>
            <span className="history-count">{conversationHistory[category].length}</span>
          </div>
          <div className="conversation-history-list">
            {conversationHistory[category].map((conv, index) => (
              <button
                key={conv.id}
                className={`conversation-history-item ${conv.id === conversationId ? 'active' : ''}`}
                onClick={() => loadConversation(conv, index)}
                title={conv.title}
              >
                <div className="history-item-content">
                  <span className="history-item-title">{conv.title}</span>
                  <span className="history-item-time">
                    {new Date(conv.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                {conv.savedGraphs && conv.savedGraphs.length > 0 && (
                  <span className="history-item-badge">{conv.savedGraphs.length} 📊</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Graph Modal Popup */}
      {showGraphModal && graphData && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4 className="modal-title">{graphData.query}</h4>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>

            <div className="modal-body">
              <div className="graph-visualization">
                <DynamicChart
                  type={graphData.type}
                  data={graphData.data}
                />
              </div>

              {/* 🔥 Chart Type Switcher */}
              <div className="chart-type-switcher">
                {["bar", "line", "pie", "doughnut", "scatter", "table"].map((type) => {
                  const isActive = graphData.type === type;
                  const isRecommended = graphData.recommendedType === type;

                  return (
                    <button
                      key={type}
                      className={`chart-type-btn ${isActive ? "active" : ""}`}
                      onClick={() =>
                        setGraphData(prev => ({
                          ...prev,
                          type
                        }))
                      }
                    >
                      {type}
                      {isRecommended && (
                        <span className="recommended-dot">●</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="modal-footer">
              <button className="cancel-button" onClick={closeModal}>
                Close
              </button>
              <button className="add-to-dashboard-button" onClick={handleAddToDashboard}>
                + Add to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Save Dashboard Modal */}
      {showSaveModal && (
        <div className="modal-overlay" onClick={closeSaveModal}>
          <div className="modal-content save-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4 className="modal-title">💾 Save Dashboard</h4>
              <button className="modal-close" onClick={closeSaveModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="save-form">
                <label className="save-label">Dashboard Name</label>
                <input
                  type="text"
                  className="save-input"
                  placeholder="Enter dashboard name..."
                  value={dashboardName}
                  onChange={(e) => setDashboardName(e.target.value)}
                  autoFocus
                />
                <div className="save-info">
                  <div className="save-info-row">
                    <span className="save-info-label">Domain Type:</span>
                    <span className="save-info-value">{category}</span>
                  </div>
                  <div className="save-info-row">
                    <span className="save-info-label">Graphs:</span>
                    <span className="save-info-value">{savedGraphs.length} graph(s)</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-button" onClick={closeSaveModal} disabled={isSaving}>
                Cancel
              </button>
              <button
                className="save-confirm-button"
                onClick={handleSaveDashboard}
                disabled={isSaving || !dashboardName.trim()}
              >
                {isSaving ? 'Saving...' : 'Save Dashboard'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default QueryInterface
