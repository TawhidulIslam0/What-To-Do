// src/components/UserProfilePage/EditProfileForm.js
import React, { useState } from "react";
import "./EditProfileForm.css";
import API_URL from "../../config";

const EditProfileForm = ({ user, onSave, onCancel }) => {
  // State for form data and profile picture preview
  const [formData, setFormData] = useState({
    // username should reflect the canonical username, not display_name
    username: user.username || "",
    bio: user.bio || "",
    profilePicture: null,
  });
  React.useEffect(() => {
    setFormData({
      username: user.username || "",
      bio: user.bio || "",
      profilePicture: null,
    });
    setPreviewUrl(user.profilePicture || "");
  }, [user]);
  const [previewUrl, setPreviewUrl] = useState(user.profilePicture || "");

  const [saving, setSaving] = useState(false);

  // Handle text input changes
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

      // Create preview URL for the selected image
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
      // Single-line UX: when user edits username, keep display_name in sync.
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
        onSave(data.user);
      } else {
        const msg =
          data && data.errors
            ? data.errors.join(", ")
            : "Failed to update profile";
        alert(msg);
        console.error("EditProfileForm save error:", data);
      }
    } catch (err) {
      console.error("Network error updating profile:", err);
      alert("Network error while saving profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="profile-picture-upload-modern" onSubmit={handleSubmit}>
      {/* Profile picture preview and upload */}
      <div className="profile-picture-preview-modern">
        {previewUrl ? (
          // Show new profile picture preview
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
          // Show existing profile picture
          <img
            src={user.profilePicture}
            alt="Profile"
            className="profile-image-modern"
          />
        ) : (
          // Show placeholder when no profile picture
          <div className="no-profile-picture-modern">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="#71C19D">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
        )}
      </div>

      {/* File input for profile picture */}
      <label className="file-input-label-modern">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="file-input"
        />
        Change Photo
      </label>

      {/* Username and bio input fields */}
      <div className="edit-form-fields">
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          className="edit-input-modern"
          maxLength="30"
        />
        <textarea
          name="bio"
          placeholder="Tell everyone about yourself..."
          value={formData.bio}
          onChange={handleChange}
          className="edit-textarea-modern"
          rows="3"
          maxLength="150"
        />
      </div>

      {/* Save and cancel buttons */}
      <div className="edit-actions-modern">
        <button type="submit" className="save-button-modern">
          Save Changes
        </button>
        <button
          type="button"
          className="cancel-button-modern"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default EditProfileForm;
