import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, CheckSquare, RotateCcw, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const AuthForm: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const { signUp, signIn, resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (isSignUp && password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password);
        if (error) {
          setError(error.message);
        } else {
          setMessage('Check your email for the confirmation link!');
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          setError(error.message);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (!email.trim()) {
      setError('Please enter your email address');
      setLoading(false);
      return;
    }

    try {
      const { error } = await resetPassword(email);
      if (error) {
        setError(error.message);
      } else {
        setMessage('Password reset email sent! Check your inbox for instructions.');
        // Auto-switch back to sign in after 3 seconds
        setTimeout(() => {
          setShowPasswordReset(false);
          setMessage('');
        }, 3000);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError('');
    setMessage('');
    setShowPassword(false);
  };

  const switchToSignIn = () => {
    setIsSignUp(false);
    setShowPasswordReset(false);
    resetForm();
  };

  const switchToSignUp = () => {
    setIsSignUp(true);
    setShowPasswordReset(false);
    resetForm();
  };

  const switchToPasswordReset = () => {
    setShowPasswordReset(true);
    setIsSignUp(false);
    resetForm();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 flex items-center justify-center p-4 relative">
      {/* Bolt.new Hackathon Badge - Top Right */}
      <div className="absolute top-4 right-4 z-10">
        <a
          href="https://bolt.new/"
          target="_blank"
          rel="noopener noreferrer"
          className="block transition-transform duration-300 hover:scale-110"
          title="Powered by Bolt.new"
        >
          <img
            src="/black_circle_360x360.png"
            alt="Powered by Bolt.new"
            className="w-12 h-12 sm:w-16 sm:h-16 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-300"
          />
        </a>
      </div>

      <div className="max-w-md w-full">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4">
            <CheckSquare className="h-8 w-8 text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">TaskQuest</h1>
          <p className="text-purple-200">Gamify your productivity journey</p>
        </div>

        {/* Auth Form */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="mb-6">
            {showPasswordReset ? (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <button
                    onClick={() => setShowPasswordReset(false)}
                    className="p-2 text-gray-500 hover:text-purple-600 rounded-full hover:bg-purple-50 transition-colors"
                    title="Back to sign in"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <RotateCcw className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Reset Password</h2>
                <p className="text-gray-600 mt-2">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 text-center">
                  {isSignUp ? 'Create Account' : 'Welcome Back'}
                </h2>
                <p className="text-gray-600 text-center mt-2">
                  {isSignUp 
                    ? 'Start your productivity adventure' 
                    : 'Continue your quest'}
                </p>
              </div>
            )}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md text-sm">
              {message}
            </div>
          )}

          {showPasswordReset ? (
            /* Password Reset Form */
            <form onSubmit={handlePasswordReset} className="space-y-4">
              {/* Email */}
              <div>
                <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    id="reset-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter your email address"
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <RotateCcw className="h-5 w-5 mr-2" />
                    Send Reset Link
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Sign In/Sign Up Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password (Sign Up only) */}
              {isSignUp && (
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Confirm your password"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Forgot Password Link (Sign In only) */}
              {!isSignUp && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={switchToPasswordReset}
                    className="text-sm text-purple-600 hover:text-purple-700 font-medium hover:underline"
                  >
                    Forgot your password?
                  </button>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    {isSignUp ? <User className="h-5 w-5 mr-2" /> : <CheckSquare className="h-5 w-5 mr-2" />}
                    {isSignUp ? 'Create Account' : 'Sign In'}
                  </>
                )}
              </button>
            </form>
          )}

          {/* Toggle Sign Up/Sign In */}
          {!showPasswordReset && (
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                <button
                  onClick={isSignUp ? switchToSignIn : switchToSignUp}
                  className="ml-2 text-purple-600 hover:text-purple-700 font-medium"
                >
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </button>
              </p>
            </div>
          )}

          {/* Back to Sign In from Password Reset */}
          {showPasswordReset && (
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Remember your password?
                <button
                  onClick={switchToSignIn}
                  className="ml-2 text-purple-600 hover:text-purple-700 font-medium"
                >
                  Back to Sign In
                </button>
              </p>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="mt-8 text-center">
          <div className="grid grid-cols-3 gap-4 text-white">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mb-2">
                <CheckSquare className="h-5 w-5" />
              </div>
              <p className="text-sm">Track Tasks</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mb-2">
                <User className="h-5 w-5" />
              </div>
              <p className="text-sm">Level Up</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mb-2">
                <Mail className="h-5 w-5" />
              </div>
              <p className="text-sm">Achievements</p>
            </div>
          </div>
        </div>

        {/* Bottom Bolt.new Badge for Mobile */}
        <div className="mt-8 text-center">
          <p className="text-purple-200 text-xs mb-2">Powered by</p>
          <a
            href="https://bolt.new/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block transition-transform duration-300 hover:scale-110"
            title="Powered by Bolt.new"
          >
            <img
              src="/black_circle_360x360.png"
              alt="Powered by Bolt.new"
              className="w-10 h-10 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-300 mx-auto"
            />
          </a>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;