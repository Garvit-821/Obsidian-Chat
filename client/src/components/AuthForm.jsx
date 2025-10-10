import React, { useState } from 'react';
import axios from 'axios';

const AuthForm = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [captchaResponse, setCaptchaResponse] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!isLogin && formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }

      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const response = await axios.post(`http://localhost:3001${endpoint}`, {
        username: formData.username,
        password: formData.password,
        captchaResponse: captchaResponse,
        captchaAnswer: parseInt(captchaResponse)
      }, {
        withCredentials: true
      });

      if (response.data.user) {
        onAuthSuccess(response.data.user);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const generateMathCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const operation = Math.random() > 0.5 ? '+' : '-';
    let answer;
    
    if (operation === '+') {
      answer = num1 + num2;
    } else {
      answer = num1 - num2;
    }
    
    return { question: `${num1} ${operation} ${num2} = ?`, answer };
  };

  const [captcha] = useState(generateMathCaptcha());

  const verifyCaptcha = (userAnswer) => {
    return parseInt(userAnswer) === captcha.answer;
  };

  const handleCaptchaChange = (e) => {
    const userAnswer = e.target.value;
    setCaptchaResponse(userAnswer);
    
    if (verifyCaptcha(userAnswer)) {
      setError('');
    } else if (userAnswer !== '') {
      setError('Incorrect CAPTCHA answer');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center terminal-container">
      <div className="auth-form">
        <div className="terminal-header text-center mb-8">
          <h1 className="text-2xl font-bold glow-text">
            [ ACCESS TERMINAL ]
          </h1>
          <p className="text-sm mt-2" style={{opacity: 0.7}}>
            {isLogin ? 'Enter credentials to access' : 'Create new account'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-mono mb-2">
              &gt; username:
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="auth-input"
              placeholder="Enter username"
              required
              pattern="[a-zA-Z0-9_]+"
              title="Only letters, numbers, and underscores allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-mono mb-2">
              &gt; password:
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="auth-input"
              placeholder="Enter password"
              required
              minLength="6"
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-mono mb-2">
                &gt; confirm password:
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="auth-input"
                placeholder="Confirm password"
                required
              />
            </div>
          )}

          <div className="captcha-container">
            <div className="text-center">
              <label className="block text-sm font-mono mb-2">
                &gt; [ VERIFY CAPTCHA ]
              </label>
              <p className="text-neon-cyan mb-2">{captcha.question}</p>
              <input
                type="number"
                value={captchaResponse}
                onChange={handleCaptchaChange}
                className="auth-input w-32 text-center"
                placeholder="?"
                required
              />
            </div>
          </div>

          {error && (
            <div className="text-red-400 text-sm font-mono text-center">
              ERROR: {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !captchaResponse || (captchaResponse && !verifyCaptcha(captchaResponse))}
            className="terminal-button w-full"
          >
            {loading ? 'PROCESSING...' : (isLogin ? 'LOGIN' : 'REGISTER')}
          </button>
        </form>

        <div className="text-center mt-6">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setFormData({ username: '', password: '', confirmPassword: '' });
              setCaptchaResponse('');
            }}
            className="text-neon-cyan transition-colors text-sm font-mono"
            style={{cursor: 'pointer'}}
          >
            {isLogin ? 'Need an account? Register' : 'Have an account? Login'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
