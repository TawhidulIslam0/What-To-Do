// src/components/UserProfilePage/ProfileInfo.js
import React from "react";
import "./ProfileInfo.css";
import API_URL from "../../config";

const ProfileInfo = ({ user, isEditing, onSave, onCancel }) => {
  // State for form data and profile picture preview
  const [formData, setFormData] = React.useState({
    username: user.username || "",
    display_name: user.display_name || "",
    bio: user.bio || "",
    profilePicture: null,
  });
  const [previewUrl, setPreviewUrl] = React.useState(user.profilePicture || "");

  const [saving, setSaving] = React.useState(false);

  // Reset form when user data changes
  React.useEffect(() => {
    setFormData({
      username: user.username || "",
      display_name: user.display_name,
      bio: user.bio,
      profilePicture: null,
    });
    setPreviewUrl(user.profilePicture || "");
  }, [user]);

  // Handle text input changes for username and bio
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle profile picture file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert("File size should be less than 5MB");
        return;
      }

      setFormData({
        ...formData,
        profilePicture: file,
      });

      // Create preview URL for selected image
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove selected profile picture
  const removeProfilePicture = () => {
    setFormData({
      ...formData,
      profilePicture: null,
    });
    setPreviewUrl("");
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);

    try {
      const fd = new FormData();
      // We only expose one editable line (username) to the user. To keep the
      // DB columns in sync, send both `username` and `display_name` with the
      // same value when username is changed.
      // Defensive: coerce to strings before trimming to avoid runtime errors
      const usernameVal = (formData.username ?? "").toString().trim();
      if (usernameVal.length > 0) {
        fd.append("username", usernameVal);
        fd.append("display_name", usernameVal);
      }
      const bioVal = (formData.bio ?? "").toString().trim();
      if (bioVal.length > 0) {
        fd.append("bio", bioVal);
      }

      if (formData.profilePicture) {
        fd.append("profilePicture", formData.profilePicture);
      }

      const res = await fetch(`${API_URL}/api/user/setup`, {
        method: "POST",
        credentials: "include",
        body: fd,
      });

      const data = await res.json();

      if (res.ok && data.ok) {
        // update parent/app with canonical server user
        onSave(data.user);
      } else {
        const msg =
          data && data.errors
            ? data.errors.join(", ")
            : "Failed to save profile";
        // use alert for now; you can integrate showError hook later
        alert(msg);
        console.error("Profile save failed:", data);
      }
    } catch (err) {
      console.error("Network or server error saving profile:", err);
      alert("Network error while saving profile.");
    } finally {
      setSaving(false);
    }
  };

  // Reset form and exit edit mode
  const handleCancel = () => {
    setFormData({
      display_name: user.display_name,
      bio: user.bio,
      profilePicture: null,
    });
    setPreviewUrl(user.profilePicture || "");
    onCancel();
  };

  return (
    <div className="profile-top-section">
      {/* Profile Picture Section */}
      <div className="profile-picture-section-modern">
        <div className="profile-picture-container-modern">
          {isEditing ? (
            // Edit mode: Show upload interface
            <div className="profile-picture-upload-modern">
              <div className="profile-picture-preview-modern">
                {previewUrl ? (
                  // New image preview with remove button
                  <div className="preview-container-modern">
                    <img
                      src={previewUrl}
                      alt="Profile preview"
                      className="profile-preview-modern"
                    />
                    <button
                      type="button"
                      className="remove-picture-btn-modern"
                      onClick={removeProfilePicture}
                    >
                      ×
                    </button>
                  </div>
                ) : user.profilePicture ? (
                  // Existing profile picture
                  <img
                    src={user.profilePicture}
                    alt="Profile"
                    className="profile-image-modern"
                  />
                ) : (
                  // Placeholder when no picture
                  <div className="no-profile-picture-modern">
                    <svg
                      width="64"
                      height="64"
                      viewBox="0 0 24 24"
                      fill="#71C19D"
                    >
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  </div>
                )}
              </div>
              {/* File input for changing profile picture */}
              <label className="file-input-label-modern">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="file-input"
                />
                Change Photo
              </label>
            </div>
          ) : (
            // View mode: Display only
            <div className="profile-picture-display-modern">
              {user.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt="Profile"
                  className="profile-image-modern"
                />
              ) : (
                <div className="no-profile-picture-modern">
                  <svg
                    width="80"
                    height="80"
                    viewBox="0 0 24 24"
                    fill="#71C19D"
                  >
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* User Info Section */}
      <div className="profile-info-side">
        {isEditing ? (
          // Edit Form
          <form className="edit-profile-form" onSubmit={handleSubmit}>
            <div className="edit-form-content">
              <div className="edit-fields-container">
                {/* Username input field (single line for both username & display_name) */}
                <div className="edit-input-group">
                  <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleChange}
                    className="edit-input-line"
                    maxLength="30"
                  />
                </div>

                {/* Bio text area field */}
                <div className="edit-input-group">
                  <textarea
                    name="bio"
                    placeholder="Tell everyone about yourself..."
                    value={formData.bio}
                    onChange={handleChange}
                    className="edit-textarea-line"
                    rows="2"
                    maxLength="150"
                  />
                </div>

                {/* Read-only email display */}
                <div className="email-section">
                  <span className="email-text">{user.email}</span>
                </div>
              </div>

              {/* Form action buttons */}
              <div className="edit-actions-side">
                <button type="submit" className="save-button-modern">
                  Save
                </button>
                <button
                  type="button"
                  className="cancel-button-modern"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        ) : (
          // View Mode Display
          <>
            <div className="username-display">
              <h1 className="username-large">{user.username}</h1>
            </div>

            <div className="bio-section">
              <p className="bio-text">
                {user.bio || "No bio yet. Tell everyone about yourself!"}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfileInfo;
