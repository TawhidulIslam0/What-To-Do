// src/components/AccountSetupPage/AccountSetupPage.js
import React, { useState } from "react";
import "./AccountSetupPage.css";
import API_URL from "../../config";

const AccountSetupPage = ({ user, onComplete, onBack, showError }) => {
  const [formData, setFormData] = useState({
    username: user?.username || "",
    bio: "",
    profilePicture: null,
  });
  const [previewUrl, setPreviewUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Handle form submission to complete profile setup
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Coerce username to string to avoid runtime errors if it's unexpectedly
    // not a string (defensive programming). Use trimmed value for validation.
    const usernameVal = (formData.username ?? "").toString().trim();
    if (!usernameVal) {
      showError("Please enter a display name");
      return;
    }

    setIsLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("username", usernameVal);
      formDataToSend.append("bio", (formData.bio ?? "").toString().trim());

      if (formData.profilePicture) {
        formDataToSend.append("profilePicture", formData.profilePicture);
      }

      const res = await fetch(`${API_URL}/api/user/setup`, {
        method: "POST",
        credentials: "include",
        body: formDataToSend,
      });

      const data = await res.json();

      if (res.ok && data.ok) {
        onComplete(data.user);
      } else {
        const errorMsg = data.errors?.join(", ") || "Setup failed";
        showError(errorMsg);
      }
    } catch (err) {
      console.error("Setup error:", err);
      showError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle skip setup option
  const handleSkip = async () => {
    try {
      // For skip, we still need to set a basic display name
      const formDataToSend = new FormData();
      const displayName =
        (formData.username ?? "").toString().trim() || user?.username || "User";
      formDataToSend.append("username", displayName);
      formDataToSend.append("bio", "");

      const res = await fetch(`${API_URL}`, {
        method: "POST",
        credentials: "include",
        body: formDataToSend,
      });

      const data = await res.json();
      if (res.ok && data.ok) {
        onComplete(data.user);
      } else {
        onComplete(user);
      }
    } catch (err) {
      console.error("Skip setup error:", err);
      onComplete(user);
    }
  };

  // Handle text input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle profile picture file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        showError("Please select an image file");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        showError("File size should be less than 5MB");
        return;
      }

      setFormData((prev) => ({
        ...prev,
        profilePicture: file,
      }));

      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove selected profile picture
  const removeProfilePicture = () => {
    setFormData((prev) => ({
      ...prev,
      profilePicture: null,
    }));
    setPreviewUrl("");
  };

  return (
    <div className="account-setup-page">
      <div className="account-setup-container">
        {/* Back Button */}
        <div className="back-button-container">
          <button className="back-button" onClick={onBack}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
            </svg>
            Back
          </button>
        </div>

        <div className="setup-header">
          <h1>Complete Your Profile</h1>
          <p>Welcome! Let's set up your profile to get started.</p>
        </div>

        <form onSubmit={handleSubmit} className="setup-form">
          {/* Profile Picture Upload Section */}
          <div className="form-group">
            <div className="profile-picture-upload">
              <div className="profile-picture-preview">
                {previewUrl ? (
                  <div className="preview-container">
                    <img
                      src={previewUrl}
                      alt="Profile preview"
                      className="profile-preview"
                    />
                    <button
                      type="button"
                      className="remove-picture-btn"
                      onClick={removeProfilePicture}
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="upload-placeholder">
                    <svg
                      width="48"
                      height="48"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  </div>
                )}
              </div>
              <label className="file-input-label">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="file-input"
                />
                Choose Photo
              </label>
            </div>
          </div>

          {/* Display Name Input Field */}
          <div className="form-group">
            <input
              type="text"
              name="username"
              placeholder="Display Name"
              value={formData.username}
              onChange={handleChange}
              className="form-input"
              required
              maxLength="30"
            />
            <div className="char-count">{formData.username.length}/30</div>
          </div>

          {/* Bio Text area Field */}
          <div className="form-group">
            <textarea
              name="bio"
              placeholder="Tell us a bit about yourself..."
              value={formData.bio}
              onChange={handleChange}
              className="form-textarea"
              rows="3"
              maxLength="150"
            />
            <div className="char-count">{formData.bio.length}/150</div>
          </div>

          {/* Action Buttons */}
          <div className="button-container">
            <button type="submit" className="setup-button" disabled={isLoading}>
              {isLoading ? "Setting Up..." : "Complete Setup"}
            </button>
            <button
              type="button"
              className="skip-button"
              onClick={handleSkip}
              disabled={isLoading}
            >
              Skip and Set Up Later
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountSetupPage;
