import { useState } from 'react'
import './QueryInterface.css'

function QueryInterface() {
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [promptTabs, setPromptTabs] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [activePromptTab, setActivePromptTab] = useState(null)
  const [graphData, setGraphData] = useState(null)
  const [isGraphMinimized, setIsGraphMinimized] = useState(false)
  const [activeCategory, setActiveCategory] = useState('security')

  // Category tabs configuration
  const categories = [
    { id: 'security', name: 'Security', icon: '🔒' },
    { id: 'compliance', name: 'Compliance', icon: '✓' },
    { id: 'risk', name: 'Risk', icon: '⚠️' }
  ]

  // Categorized suggested questions
  const categorizedQuestions = {
    security: [
      "What are the recent security incidents?",
      "Show unauthorized access attempts",
      "Analyze vulnerability scan results",
      "Check password policy compliance",
      "Review multi-factor authentication status",
      "Identify high-risk user accounts"
    ],
    compliance: [
      "Show regulatory compliance status",
      "What are the pending audit items?",
      "Review data privacy compliance",
      "Check license compliance across teams",
      "Analyze policy adherence rates",
      "Show certification expiry dates"
    ],
    risk: [
      "What are the top risk indicators?",
      "Show operational risk assessment",
      "Analyze business continuity metrics",
      "Review third-party risk scores",
      "Identify critical system vulnerabilities",
      "Show incident impact analysis"
    ]
  }

  // Get current category questions
  const currentQuestions = categorizedQuestions[activeCategory] || []

  const parsePrompts = (responseString) => {
    // Split by colons and filter out empty strings
    const prompts = responseString.split(':').filter(prompt => prompt.trim() !== '')
    return prompts
  }

  const sendQuery = async (query) => {
    if (!query.trim()) return

    // Add user message to chat
    const userMessage = { role: 'user', content: query }
    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      // DEMO MODE: For testing purposes, using mock data
      // TODO: Replace with your actual API endpoint
      const useDemoMode = true // Set to false when using real API

      let data
      if (useDemoMode) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Mock response with prompt_questions
        data = {
          prompt_questions: "What is the monthly revenue trend?:Which products are most profitable?:Show customer acquisition costs:Compare regional performance"
        }
      } else {
        const response = await fetch('YOUR_API_ENDPOINT', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query }),
        })
        data = await response.json()
      }

      // Expecting API to return { prompt_questions: "ques1:ques2:ques3" }
      const promptQuestions = data.prompt_questions || ''

      // Add assistant message to chat
      const assistantMessage = {
        role: 'assistant',
        content: 'Here are some related questions you can explore:'
      }
      setMessages(prev => [...prev, assistantMessage])

      // Parse the prompt_questions to create prompt tabs
      const prompts = parsePrompts(promptQuestions)
      if (prompts.length > 0) {
        setPromptTabs(prompts)
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

  const fetchGraphData = async (question) => {
    setIsLoading(true)
    try {
      // DEMO MODE: For testing purposes, using mock data
      // TODO: Replace with your actual API endpoint for graph data
      const useDemoMode = true // Set to false when using real API

      let data
      if (useDemoMode) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800))

        // Generate different mock data based on question
        data = {
          graph_data: generateMockGraphData(question),
          graph_type: 'bar'
        }
      } else {
        const response = await fetch('YOUR_GRAPH_API_ENDPOINT', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ question }),
        })
        data = await response.json()
      }

      setGraphData({
        question: question,
        data: data.graph_data || generateMockGraphData(question),
        type: data.graph_type || 'bar'
      })
    } catch (error) {
      console.error('Error fetching graph data:', error)
      setGraphData({
        question: question,
        data: generateMockGraphData(question),
        type: 'bar'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const generateMockGraphData = (question) => {
    // Generate varied mock data for demonstration based on question
    const mockDataSets = {
      revenue: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        values: [65000, 72000, 80000, 85000, 78000, 92000]
      },
      products: {
        labels: ['Product A', 'Product B', 'Product C', 'Product D', 'Product E'],
        values: [45, 67, 89, 52, 78]
      },
      costs: {
        labels: ['Q1', 'Q2', 'Q3', 'Q4'],
        values: [1200, 980, 1100, 890]
      },
      performance: {
        labels: ['North', 'South', 'East', 'West', 'Central'],
        values: [85, 92, 78, 88, 95]
      }
    }

    // Select data based on keywords in question
    const questionLower = question.toLowerCase()
    if (questionLower.includes('revenue') || questionLower.includes('trend')) {
      return mockDataSets.revenue
    } else if (questionLower.includes('product')) {
      return mockDataSets.products
    } else if (questionLower.includes('cost')) {
      return mockDataSets.costs
    } else if (questionLower.includes('regional') || questionLower.includes('performance')) {
      return mockDataSets.performance
    }

    // Default data
    return {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      values: [65, 59, 80, 81, 56, 55]
    }
  }

  const handleAddToDashboard = () => {
    // TODO: Implement add to dashboard functionality
    alert(`Graph for "${graphData?.question}" will be added to dashboard`)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    sendQuery(inputValue)
  }

  const handlePromptTabClick = (prompt, index) => {
    // Set the active tab and fetch graph data
    setActivePromptTab(index)
    setIsGraphMinimized(false)
    fetchGraphData(prompt)
  }

  return (
    <div className="query-interface">
      {/* Sidebar with Category Tabs */}
      <div className="sidebar">
        <h3 className="sidebar-title">Categories</h3>
        <div className="category-tabs">
          {categories.map((category) => (
            <button
              key={category.id}
              className={`category-tab ${activeCategory === category.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(category.id)}
            >
              <span className="category-icon">{category.icon}</span>
              <span className="category-name">{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Query Container */}
      <div className="query-container">
        {/* Suggested Questions Section */}
        <div className="suggested-questions-section">
          <div className="suggested-header">
            <span className="suggested-icon">💡</span>
            <h3>Here are some related questions you can explore:</h3>
          </div>
          <div className="suggested-questions-grid">
            {currentQuestions.map((question, index) => (
              <button
                key={index}
                className="suggested-question-card"
                onClick={() => sendQuery(question)}
                disabled={isLoading}
              >
                {question}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Prompt Tabs */}
        {promptTabs.length > 0 && (
          <div className="prompt-tabs">
            <div className="prompt-tabs-header">Explore Related Questions:</div>
            <div className="prompt-tabs-container">
              {promptTabs.map((prompt, index) => (
                <button
                  key={index}
                  className={`prompt-tab ${activePromptTab === index ? 'active' : ''}`}
                  onClick={() => handlePromptTabClick(prompt, index)}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="main-content-area">
          {/* Chat Messages */}
          <div className={`chat-section ${graphData ? 'with-graph' : ''}`}>
            <div className="chat-messages">
              {messages.length === 0 ? (
                <div className="empty-state">
                  <h3>Start a conversation</h3>
                  <p>Ask a question in natural language to get started</p>
                </div>
              ) : (
                messages.map((message, index) => (
                  <div
                    key={index}
                    className={`message ${message.role}`}
                  >
                    <div className="message-content">
                      {message.content}
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="message assistant">
                  <div className="message-content loading">
                    Thinking...
                  </div>
                </div>
              )}
            </div>

            {/* Input Form */}
            <form className="input-form" onSubmit={handleSubmit}>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask a question in natural language..."
                className="query-input"
                disabled={isLoading}
              />
              <button
                type="submit"
                className="send-button"
                disabled={isLoading || !inputValue.trim()}
              >
                Send
              </button>
            </form>
          </div>

          {/* Graph Panel */}
          {graphData && (
            <div className={`graph-panel ${isGraphMinimized ? 'minimized' : ''}`}>
              <div className="graph-header">
                <h4 className="graph-title">{graphData.question}</h4>
                <button
                  className="minimize-button"
                  onClick={() => setIsGraphMinimized(!isGraphMinimized)}
                >
                  {isGraphMinimized ? '▲' : '▼'}
                </button>
              </div>

              {!isGraphMinimized && (
                <div className="graph-content">
                  <div className="graph-visualization">
                    {/* Simple Bar Chart Visualization */}
                    <div className="bar-chart">
                      {graphData.data.labels.map((label, index) => (
                        <div key={index} className="bar-item">
                          <div className="bar-wrapper">
                            <div
                              className="bar"
                              style={{
                                height: `${(graphData.data.values[index] / Math.max(...graphData.data.values)) * 100}%`
                              }}
                            >
                              <span className="bar-value">{graphData.data.values[index]}</span>
                            </div>
                          </div>
                          <span className="bar-label">{label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    className="add-to-dashboard-button"
                    onClick={handleAddToDashboard}
                  >
                    Add to Dashboard
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default QueryInterface
