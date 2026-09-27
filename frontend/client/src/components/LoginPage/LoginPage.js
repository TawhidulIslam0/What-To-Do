// src/components/LoginPage/LoginPage.js
import React, { useState, useEffect } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import "./LoginPage.css";
import API_URL from "../../config";

const LoginPage = ({ onLogin, onSwitchToSignup, onBack, onGoogleLogin }) => {
  // State for form data, password visibility, and error messages
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    account: "",
    general: "",
  });

  // Error popup component for displaying messages
  const ErrorPopup = ({ message, onClose }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
      if (message) {
        setIsVisible(true);

        const timer = setTimeout(() => {
          setIsVisible(false);
          setTimeout(onClose, 300);
        }, 5000);

        return () => clearTimeout(timer);
      }
    }, [message, onClose]);

    if (!message || !isVisible) return null;

    return (
      <div className="error-popup">
        <div className="popup-content">
          <p className="popup-message">{message}</p>
        </div>
      </div>
    );
  };

  // Clear all error messages
  const clearErrors = () => {
    setErrors({ email: "", password: "", account: "", general: "" });
  };

  // Google OAuth login configuration
  const googleLogin = useGoogleLogin({
    flow: "implicit",
    ux_mode: "popup",
    onSuccess: async (resp) => {
      clearErrors();
      try {
        const r = await fetch(`${API_URL}/api/oauth/google`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ access_token: resp.access_token }),
        });
        const data = await r.json();
        if (r.ok && data.ok) {
          onLogin(data.user);
        } else {
          setErrors({
            general: data.errors?.join(", ") || "Google login failed",
          });
        }
      } catch (e) {
        console.error(e);
        setErrors({ general: "Network error talking to backend." });
      }
    },
    onError: () =>
      setErrors({ general: "Google Sign-In failed. Please try again." }),
  });

  // Handle form submission for email/password login
  const handleSubmit = async (e) => {
    e.preventDefault();
    clearErrors();

    try {
      const res = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const ct = res.headers.get("content-type") || "";
      const payload = ct.includes("application/json")
        ? await res.json()
        : { ok: false, raw: await res.text() };

      console.log("Backend response:", {
        status: res.status,
        payload: payload,
        rawError: payload.raw,
        errors: payload.errors,
      });

      if (res.ok && payload.ok) {
        onLogin(payload.user);
        setFormData({ email: "", password: "" });
      } else {
        const errorMsg =
          payload.errors?.join(", ") ||
          payload.raw ||
          `Login failed (status ${res.status})`;
        const lowerMsg = errorMsg.toLowerCase();

        // Handle different error types
        if (
          res.status === 404 ||
          lowerMsg.includes("user not found") ||
          lowerMsg.includes("no account") ||
          lowerMsg.includes("user does not exist")
        ) {
          setErrors({
            account: "No account found with this email. Please sign up.",
          });
        } else if (
          res.status === 401 ||
          lowerMsg.includes("password") ||
          lowerMsg.includes("invalid password") ||
          lowerMsg.includes("incorrect password")
        ) {
          setErrors({ password: "Incorrect password. Please try again." });
        } else if (
          lowerMsg.includes("email") ||
          lowerMsg.includes("invalid email")
        ) {
          setErrors({ email: "Please enter a valid email address." });
        } else {
          setErrors({ general: errorMsg });
        }
      }
    } catch (err) {
      console.error("Login error:", err);
      setErrors({ general: "Something went wrong. Please try again." });
    }
  };

  // Handle input field changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (e.target.name === "email")
      setErrors((prev) => ({ ...prev, email: "", account: "" }));
    if (e.target.name === "password")
      setErrors((prev) => ({ ...prev, password: "" }));
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Handle back button click
  const handleBack = () => {
    onBack();
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Back Button */}
        <div className="back-button-container">
          <button className="back-button" onClick={handleBack}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
            </svg>
            Back
          </button>
        </div>

        {/* Login Header */}
        <div className="login-header">
          <h1>Log In To Your Account</h1>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="login-form">
          {/* Email Input */}
          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              className={`form-input ${
                errors.email || errors.account ? "error" : ""
              }`}
              required
            />
          </div>

          {/* Password Input with Toggle */}
          <div className="form-group password-input-wrapper">
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className={`form-input ${errors.password ? "error" : ""}`}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" />
                  </svg>
                ) : (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="button-container">
            <button type="submit" className="login-button">
              Log In
            </button>
          </div>
        </form>

        {/* Google Login Button */}
        <div className="button-container">
          <button
            className="google-custom-button"
            onClick={() => googleLogin()}
            type="button"
          >
            <span className="google-button-content">
              <svg
                className="google-logo"
                width="20"
                height="20"
                viewBox="0 0 24 24"
              >
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Log in with Google
            </span>
          </button>
        </div>

        {/* Switch to Signup Link */}
        <div className="login-switch">
          <p>
            Don't have an account?{" "}
            <span className="switch-link" onClick={onSwitchToSignup}>
              Sign Up
            </span>
          </p>
        </div>

        {/* Error Popups */}
        <ErrorPopup
          message={errors.email}
          onClose={() => setErrors((prev) => ({ ...prev, email: "" }))}
          type="email"
        />
        <ErrorPopup
          message={errors.password}
          onClose={() => setErrors((prev) => ({ ...prev, password: "" }))}
          type="password"
        />
        <ErrorPopup
          message={errors.account}
          onClose={() => setErrors((prev) => ({ ...prev, account: "" }))}
          type="account"
        />
        <ErrorPopup
          message={errors.general}
          onClose={() => setErrors((prev) => ({ ...prev, general: "" }))}
          type="general"
        />
      </div>
    </div>
  );
};

export default LoginPage;
