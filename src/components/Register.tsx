import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import './Auth.css';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    setLoading(true);

    try {
      await axiosClient.post('/api/auth/register', { username, password });
      // Automatically navigate to login page upon success
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>  
    <div className="auth-container">
      <div className="auth-card">
        <h2>Create an Account</h2>
        <p className="auth-subtitle">Join us to book your dream vacations</p>
        
        {error && <div className="auth-error">{error}</div>}
        
        <form onSubmit={handleRegister} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Choose a username"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Create a password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Confirm your password"
            />
          </div>
          
          <button type="submit" disabled={loading} className="auth-button">
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        
        <div className="auth-footer">
          Already have an account? <Link to="/login">Login here</Link>
        </div>
      </div>
    </div>
      <h2>Why do we use axiosClient instead of normal axios?</h2>
    <pre>{` axiosClient.ts Explanation
 1. Centralized Configuration:
 We set a base URL (http://localhost:3001) in one place. If the backend URL changes, we only update it here instead of in every component
 2. Request Interceptors (Sending Tokens):
 Every time we make an API request, the 'request interceptor' automatically checks for an 'accessToken' in localStorage and attaches it to the Authorization header. This ensures protected routes on the backend know who is making the request without us having to manually add the token to every single fetch/axios call
 3. Response Interceptors (Handling Token Expiration):
 Access tokens expire for security reasons (e.g., after 15 mins). When that happens, the backend returns a 401 Unauthorized error.
 The 'response interceptor' intercepts this error BEFORE it reaches our component. 
 It then automatically sends our 'refreshToken' to get a new 'accessToken'. 
 If successful, it updates the token in localStorage and retries the original failed request seamlessly.
 If the refresh token is also invalid/expired, it forces the user to log in again by redirecting to the login page.`}</pre>
  
  </>
  );
}
