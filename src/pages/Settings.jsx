import { useEffect, useState } from "react";
import Layout from "../components/Layout";

import { useExpense } from "../context/ExpenseContext";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

function Settings() {
  // ==========================================
  // EXPENSE CONTEXT
  // ==========================================

  const { categories, addCategory, deleteCategory, resetAllData } =
    useExpense();

  // ==========================================
  // THEME
  // ==========================================

  const { darkMode, toggleTheme } = useTheme();

  // ==========================================
  // AUTH
  // ==========================================

  const { user, updateProfile, uploadProfilePicture, changePassword } =
    useAuth();

  // ==========================================
  // CATEGORY STATE
  // ==========================================

  const [newCategory, setNewCategory] = useState("");

  // ==========================================
  // PROFILE STATE
  // ==========================================

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [profilePicture, setProfilePicture] = useState(
    user?.profilePicture || "",
  );

  const [profileLoading, setProfileLoading] = useState(false);
  const [pictureLoading, setPictureLoading] = useState(false);

  // ==========================================
  // PASSWORD STATE
  // ==========================================

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [passwordLoading, setPasswordLoading] = useState(false);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ==========================================
  // UPDATE FORM WHEN USER CHANGES
  // ==========================================

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setProfilePicture(user.profilePicture || "");
    }
  }, [user]);

  // ==========================================
  // ADD CATEGORY
  // ==========================================

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!newCategory.trim()) {
      return;
    }

    addCategory(newCategory.trim());

    setNewCategory("");
  };

  // ==========================================
  // PROFILE PICTURE
  // ==========================================

  const handleProfilePicture = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setPictureLoading(true);

    const result = await uploadProfilePicture(file);

    if (result.success) {
      setProfilePicture(result.user.profilePicture || "");
    }

    setPictureLoading(false);

    // Allow selecting same image again
    e.target.value = "";
  };

  // ==========================================
  // REMOVE PROFILE PICTURE
  // ==========================================

  const removeProfilePicture = () => {
    setProfilePicture("");
  };

  // ==========================================
  // UPDATE PROFILE
  // ==========================================

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      return;
    }

    if (!email.trim()) {
      return;
    }

    setProfileLoading(true);

    const result = await updateProfile({
      name: name.trim(),
      email: email.trim(),
    });

    setProfileLoading(false);

    if (result.success) {
      setName(result.user.name);
      setEmail(result.user.email);
      setProfilePicture(result.user.profilePicture || "");
    }
  };

  // ==========================================
  // CHANGE PASSWORD
  // ==========================================

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!currentPassword) {
      return;
    }

    if (!newPassword) {
      return;
    }

    if (!confirmPassword) {
      return;
    }

    if (newPassword.length < 6) {
      return;
    }

    if (newPassword !== confirmPassword) {
      return;
    }

    setPasswordLoading(true);

    const result = await changePassword(currentPassword, newPassword);

    setPasswordLoading(false);

    if (result.success) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <Layout>
      {/* ======================================
          PAGE HEADER
      ====================================== */}

      <div className="mb-6">
        <h1 className="text-3xl font-bold">Settings</h1>

        <p className="text-slate-500 mt-1">
          Manage your profile and application settings
        </p>
      </div>

      {/* ======================================
          PROFILE
      ====================================== */}

      <div
        className="
          bg-white
          dark:bg-gray-800
          p-6
          rounded-2xl
          shadow-lg
          mb-6
        "
      >
        <div className="mb-6">
          <h2 className="text-xl font-bold">👤 Profile</h2>

          <p className="text-sm text-slate-500 mt-1">
            Update your account information
          </p>
        </div>

        <form onSubmit={handleProfileSubmit} className="space-y-6">
          {/* ======================================
              PROFILE PICTURE
          ====================================== */}

          <div>
            <label className="block text-sm font-medium mb-3">
              Profile Picture
            </label>

            <div className="flex flex-col sm:flex-row items-center gap-5">
              {/* PROFILE IMAGE */}

              <div className="flex-shrink-0">
                {profilePicture ? (
                  <img
                    src={profilePicture}
                    alt="Profile"
                    className="
                      w-28
                      h-28
                      rounded-full
                      object-cover
                      border-4
                      border-blue-500
                      shadow-lg
                    "
                    onError={(e) => {
                      console.error(
                        "Profile image failed to load:",
                        profilePicture,
                      );

                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <div
                    className="
                      w-28
                      h-28
                      rounded-full
                      bg-blue-600
                      text-white
                      flex
                      items-center
                      justify-center
                      text-4xl
                      font-bold
                      border-4
                      border-blue-300
                      shadow-lg
                    "
                  >
                    {name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                )}
              </div>

              {/* IMAGE CONTROLS */}

              <div className="space-y-3">
                <label
                  className={`
                    inline-block
                    bg-blue-600
                    hover:bg-blue-700
                    text-white
                    px-5
                    py-2.5
                    rounded-lg
                    font-medium
                    transition
                    ${
                      pictureLoading
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer"
                    }
                  `}
                >
                  {pictureLoading ? "Uploading..." : "📷 Choose Picture"}

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePicture}
                    disabled={pictureLoading}
                    className="hidden"
                  />
                </label>

                {profilePicture && !pictureLoading && (
                  <button
                    type="button"
                    onClick={removeProfilePicture}
                    className="
                      block
                      text-red-600
                      hover:text-red-700
                      text-sm
                      font-medium
                    "
                  >
                    Remove Picture
                  </button>
                )}

                <p className="text-xs text-slate-500">
                  JPG, PNG, WEBP or other image formats. Maximum 5MB.
                </p>
              </div>
            </div>
          </div>

          {/* ======================================
              NAME
          ====================================== */}

          <div>
            <label className="block text-sm font-medium mb-2">Full Name</label>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              className="
                w-full
                border
                border-slate-300
                dark:border-slate-600
                dark:bg-slate-700
                rounded-lg
                px-4
                py-3
                outline-none
                focus:ring-2
                focus:ring-blue-500
              "
            />
          </div>

          {/* ======================================
              EMAIL
          ====================================== */}

          <div>
            <label className="block text-sm font-medium mb-2">
              Email Address
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="
                w-full
                border
                border-slate-300
                dark:border-slate-600
                dark:bg-slate-700
                rounded-lg
                px-4
                py-3
                outline-none
                focus:ring-2
                focus:ring-blue-500
              "
            />
          </div>

          {/* ======================================
              SAVE PROFILE
          ====================================== */}

          <button
            type="submit"
            disabled={profileLoading}
            className="
              bg-blue-600
              hover:bg-blue-700
              disabled:opacity-50
              disabled:cursor-not-allowed
              text-white
              px-5
              py-3
              rounded-lg
              font-medium
              transition
            "
          >
            {profileLoading ? "Saving..." : "Save Profile"}
          </button>
        </form>
      </div>

      {/* ======================================
          CHANGE PASSWORD
      ====================================== */}

      <div
        className="
          bg-white
          dark:bg-gray-800
          p-6
          rounded-2xl
          shadow-lg
          mb-6
        "
      >
        <div className="mb-6">
          <h2 className="text-xl font-bold">🔐 Change Password</h2>

          <p className="text-sm text-slate-500 mt-1">
            Update your account password
          </p>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-5">
          {/* CURRENT PASSWORD */}

          <div>
            <label className="block text-sm font-medium mb-2">
              Current Password
            </label>

            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                autoComplete="current-password"
                className="
                  w-full
                  border
                  border-slate-300
                  dark:border-slate-600
                  dark:bg-slate-700
                  rounded-lg
                  px-4
                  py-3
                  pr-16
                  outline-none
                  focus:ring-2
                  focus:ring-blue-500
                "
              />

              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="
                  absolute
                  right-3
                  top-1/2
                  -translate-y-1/2
                  text-sm
                  text-slate-500
                  hover:text-blue-600
                "
              >
                {showCurrentPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* NEW PASSWORD */}

          <div>
            <label className="block text-sm font-medium mb-2">
              New Password
            </label>

            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                autoComplete="new-password"
                className="
                  w-full
                  border
                  border-slate-300
                  dark:border-slate-600
                  dark:bg-slate-700
                  rounded-lg
                  px-4
                  py-3
                  pr-16
                  outline-none
                  focus:ring-2
                  focus:ring-blue-500
                "
              />

              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="
                  absolute
                  right-3
                  top-1/2
                  -translate-y-1/2
                  text-sm
                  text-slate-500
                  hover:text-blue-600
                "
              >
                {showNewPassword ? "Hide" : "Show"}
              </button>
            </div>

            <p className="text-xs text-slate-500 mt-2">
              Password must be at least 6 characters.
            </p>
          </div>

          {/* CONFIRM PASSWORD */}

          <div>
            <label className="block text-sm font-medium mb-2">
              Confirm New Password
            </label>

            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                autoComplete="new-password"
                className="
                  w-full
                  border
                  border-slate-300
                  dark:border-slate-600
                  dark:bg-slate-700
                  rounded-lg
                  px-4
                  py-3
                  pr-16
                  outline-none
                  focus:ring-2
                  focus:ring-blue-500
                "
              />

              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="
                  absolute
                  right-3
                  top-1/2
                  -translate-y-1/2
                  text-sm
                  text-slate-500
                  hover:text-blue-600
                "
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* PASSWORD MATCH MESSAGE */}

          {confirmPassword && newPassword !== confirmPassword && (
            <p className="text-sm text-red-600">
              ❌ New passwords do not match.
            </p>
          )}

          {confirmPassword && newPassword === confirmPassword && (
            <p className="text-sm text-green-600">✓ Passwords match.</p>
          )}

          {/* CHANGE PASSWORD BUTTON */}

          <button
            type="submit"
            disabled={passwordLoading}
            className="
              bg-blue-600
              hover:bg-blue-700
              disabled:opacity-50
              disabled:cursor-not-allowed
              text-white
              px-5
              py-3
              rounded-lg
              font-medium
              transition
            "
          >
            {passwordLoading ? "Changing Password..." : "Change Password"}
          </button>
        </form>
      </div>

      {/* ======================================
          THEME
      ====================================== */}

      <div
        className="
          bg-white
          dark:bg-gray-800
          p-6
          rounded-2xl
          shadow-lg
          mb-6
        "
      >
        <h2 className="text-xl font-bold mb-2">🎨 Theme</h2>

        <p className="text-sm text-slate-500 mb-4">
          Choose how ExpensePilot looks.
        </p>

        <button
          onClick={toggleTheme}
          className="
            bg-blue-600
            hover:bg-blue-700
            text-white
            px-5
            py-3
            rounded-lg
            font-medium
            transition
          "
        >
          {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
      </div>

      {/* ======================================
          CATEGORIES
      ====================================== */}

      <div
        className="
          bg-white
          dark:bg-gray-800
          p-6
          rounded-2xl
          shadow-lg
          mb-6
        "
      >
        <h2 className="text-xl font-bold mb-2">🏷️ Categories</h2>

        <p className="text-sm text-slate-500 mb-5">
          Add or remove your transaction categories.
        </p>

        <form
          onSubmit={handleSubmit}
          className="
            flex
            flex-col
            sm:flex-row
            gap-2
            mb-6
          "
        >
          <input
            type="text"
            placeholder="New Category"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="
              border
              border-slate-300
              dark:border-slate-600
              dark:bg-slate-700
              p-3
              rounded-lg
              flex-1
              outline-none
              focus:ring-2
              focus:ring-green-500
            "
          />

          <button
            type="submit"
            className="
              bg-green-600
              hover:bg-green-700
              text-white
              px-5
              py-3
              rounded-lg
              font-medium
              transition
            "
          >
            Add Category
          </button>
        </form>

        <div className="space-y-2">
          {categories.length === 0 ? (
            <p className="text-slate-500">No categories available.</p>
          ) : (
            categories.map((category) => (
              <div
                key={category}
                className="
                  flex
                  justify-between
                  items-center
                  border-b
                  border-slate-200
                  dark:border-slate-700
                  py-3
                "
              >
                <span className="font-medium">{category}</span>

                <button
                  onClick={() => deleteCategory(category)}
                  className="
                    bg-red-500
                    hover:bg-red-600
                    text-white
                    px-3
                    py-1.5
                    rounded-lg
                    text-sm
                    transition
                  "
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ======================================
          DANGER ZONE
      ====================================== */}

      <div
        className="
          bg-white
          dark:bg-gray-800
          border
          border-red-200
          dark:border-red-900
          p-6
          rounded-2xl
          shadow-lg
        "
      >
        <h2 className="text-xl font-bold text-red-600 mb-2">⚠️ Danger Zone</h2>

        <p className="text-sm text-slate-500 mb-5">
          This will permanently remove your local transaction data and
          categories.
        </p>

        <button
          onClick={resetAllData}
          className="
            bg-red-700
            hover:bg-red-800
            text-white
            px-5
            py-3
            rounded-lg
            font-medium
            transition
          "
        >
          Reset All Data
        </button>
      </div>
    </Layout>
  );
}

export default Settings;
