import { useState } from 'react'
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

    return {
      labels: results.map(item => item[x_axis_key]),
      values: results.map(item => item[y_axis_key])
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
      const conversation_id = crypto.randomUUID();
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
        const response = await fetch('http://localhost:9898/api/v1/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, conversation_id}),
        })
        data = await response.json()
      }
      var display_content = ""
      if(data.is_final === true){
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
      console.error('Error calling API:', error)
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
    const graphsArray = savedGraphs.map(graph => ({
      query: graph.query,
      graphType: graph.type,
      attributes: {
        xAxis: {
          key: 'labels',
          values: graph.data.labels
        },
        yAxis: {
          key: 'values',
          values: graph.data.values
        }
      }
    }))

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
        const response = await fetch('http://localhost:9999/api/v1/dashboards', {
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
      <div className={`query-panel ${savedGraphs.length > 0 ? 'with-sidebar' : ''}`}>
        <div className="query-panel-header">
          <span className="query-icon">🔍</span>
          <h3>Natural Language Query</h3>
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
