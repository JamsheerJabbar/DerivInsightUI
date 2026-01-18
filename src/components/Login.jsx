import { useState } from 'react'
import './Login.css'

function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Please enter both email and password')
      return
    }

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      // TODO: Replace with actual authentication API call
      if (email && password) {
        onLogin({ email })
      } else {
        setError('Invalid credentials')
      }
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="login-branding">
          <h1 className="logo-text">DerivInsights</h1>
          <p className="tagline">Analytics Made Simple</p>
        </div>

        <div className="login-description">
          <h2>Automated Analytics Dashboard</h2>
          <p className="description-text">
            DerivInsights is your intelligent analytics companion, transforming complex data into actionable insights.
            Similar to Power BI but powered by natural language queries, our platform lets you explore your data
            through simple conversations.
          </p>

          <div className="features-list">
            <div className="feature-item">
              <span className="feature-icon">💬</span>
              <div>
                <h4>Natural Language Queries</h4>
                <p>Ask questions in plain English and get instant insights</p>
              </div>
            </div>

            <div className="feature-item">
              <span className="feature-icon">📊</span>
              <div>
                <h4>Real-time Analytics</h4>
                <p>Monitor your key metrics with live data updates</p>
              </div>
            </div>

            <div className="feature-item">
              <span className="feature-icon">🚀</span>
              <div>
                <h4>Smart Suggestions</h4>
                <p>AI-powered prompts guide you to deeper insights</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-card">
          <h2>Welcome Back</h2>
          <p className="login-subtitle">Sign in to access your analytics dashboard</p>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                disabled={isLoading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={isLoading}
                required
              />
            </div>

            <div className="form-options">
              <label className="checkbox-label">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <a href="#" className="forgot-password">Forgot password?</a>
            </div>

            <button type="submit" className="login-button" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="login-footer">
            <p>Don't have an account? <a href="#" className="signup-link">Sign up</a></p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
