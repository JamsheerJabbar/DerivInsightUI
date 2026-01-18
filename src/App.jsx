import { useState } from 'react'
import './App.css'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import QueryInterface from './components/QueryInterface'
import Alerts from './components/Alerts'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState('query')
  const [activeCategory, setActiveCategory] = useState('compliance')

  const handleLogin = (userData) => {
    setUser(userData)
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    setUser(null)
    setIsAuthenticated(false)
    setActiveTab('query')
  }

  const mainTabs = [
    { id: 'query', label: 'Query' },
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'alerts', label: 'Smart Alerts' }
  ]

  const categories = [
    { id: 'compliance', label: 'Compliance' },
    { id: 'security', label: 'Security' },
    { id: 'risk', label: 'Risk' }
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />
      case 'query':
        return <QueryInterface category={activeCategory} />
      case 'alerts':
        return <Alerts />
      default:
        return <QueryInterface category={activeCategory} />
    }
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <div className="app-container">
      {/* Top Header with Logo and Main Navigation */}
      <header className="app-header">
        <div className="header-content">
          <div className="logo">
            <span className="logo-text">deriv</span>
          </div>
          
          <nav className="main-nav">
            {mainTabs.map((tab) => (
              <button
                key={tab.id}
                className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="header-right">
            <span className="user-email">{user?.email}</span>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Sub-navigation for categories (only shown on Query tab) */}
      {activeTab === 'query' && (
        <div className="sub-nav">
          <div className="breadcrumb">
            <span>Home</span>
            <span className="separator">›</span>
            <span className="current">Query Interface</span>
          </div>
          <div className="category-tabs">
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`category-tab ${activeCategory === cat.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  )
}

export default App
