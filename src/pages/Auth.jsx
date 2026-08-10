import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function Auth() {
  const navigate = useNavigate();

  const { login, register } = useAuth();

  const [isLogin, setIsLogin] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  // ==========================================
  // SUBMIT
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    let result;

    if (isLogin) {
      result = await login(email, password);
    } else {
      result = await register(name, email, password);
    }

    setLoading(false);

    if (result.success) {
      if (!isLogin && result.requiresVerification) {
        navigate(`/verify-email?email=${encodeURIComponent(result.email)}`);

        return;
      }

      navigate("/");
    }

    // Login with unverified email
    if (isLogin && result.requiresVerification) {
      navigate(
        `/verify-email?email=${encodeURIComponent(result.email || email)}`,
      );
    }
  };

  // ==========================================
  // SWITCH LOGIN / REGISTER
  // ==========================================

  const switchMode = () => {
    setIsLogin(!isLogin);

    setName("");
    setEmail("");
    setPassword("");

    setShowPassword(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950 px-4 py-8">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 md:p-10">
        {/* ======================================
            LOGO
        ====================================== */}

        <div className="text-center mb-8">
          <img
            src="/Expense Pilot Logo.png"
            alt="ExpensePilot"
            className="
              w-20
              h-20
              object-contain
              mx-auto
              mb-4
            "
          />

          <h1
            className="
            text-3xl
            font-bold
            text-slate-900
            dark:text-white
          "
          >
            ExpensePilot
          </h1>

          <p
            className="
            text-slate-500
            dark:text-slate-400
            mt-2
          "
          >
            {isLogin
              ? "Welcome back! Sign in to continue."
              : "Create your account and start managing your finances."}
          </p>
        </div>

        {/* ======================================
            FORM
        ====================================== */}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* NAME */}

          {!isLogin && (
            <div>
              <label
                className="
                block
                text-sm
                font-medium
                mb-2
                text-slate-700
                dark:text-slate-300
              "
              >
                Full Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
                className="
                  w-full
                  px-4
                  py-3
                  rounded-xl
                  border
                  border-slate-300
                  dark:border-slate-700
                  bg-white
                  dark:bg-slate-800
                  text-slate-900
                  dark:text-white
                  outline-none
                  focus:ring-2
                  focus:ring-blue-500
                "
              />
            </div>
          )}

          {/* EMAIL */}

          <div>
            <label
              className="
              block
              text-sm
              font-medium
              mb-2
              text-slate-700
              dark:text-slate-300
            "
            >
              Email Address
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="
                w-full
                px-4
                py-3
                rounded-xl
                border
                border-slate-300
                dark:border-slate-700
                bg-white
                dark:bg-slate-800
                text-slate-900
                dark:text-white
                outline-none
                focus:ring-2
                focus:ring-blue-500
              "
            />
          </div>

          {/* PASSWORD */}

          <div>
            <label
              className="
              block
              text-sm
              font-medium
              mb-2
              text-slate-700
              dark:text-slate-300
            "
            >
              Password
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                minLength={6}
                required
                className="
                  w-full
                  px-4
                  py-3
                  pr-12
                  rounded-xl
                  border
                  border-slate-300
                  dark:border-slate-700
                  bg-white
                  dark:bg-slate-800
                  text-slate-900
                  dark:text-white
                  outline-none
                  focus:ring-2
                  focus:ring-blue-500
                "
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="
                  absolute
                  right-3
                  top-1/2
                  -translate-y-1/2
                  text-slate-500
                  hover:text-blue-600
                  dark:text-slate-400
                  dark:hover:text-blue-400
                "
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={21} /> : <Eye size={21} />}
              </button>
            </div>
          </div>

          {/* FORGOT PASSWORD */}

          {isLogin && (
            <div className="text-right">
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="
                  text-sm
                  text-blue-600
                  hover:text-blue-700
                  dark:text-blue-400
                  dark:hover:text-blue-300
                  font-medium
                "
              >
                Forgot password?
              </button>
            </div>
          )}

          {/* SUBMIT */}

          <button
            type="submit"
            disabled={loading}
            className="
              w-full
              bg-blue-600
              hover:bg-blue-700
              disabled:bg-blue-400
              text-white
              font-semibold
              py-3
              rounded-xl
              transition
            "
          >
            {loading
              ? "Please wait..."
              : isLogin
                ? "Sign In"
                : "Create Account"}
          </button>
        </form>

        {/* ======================================
            SWITCH
        ====================================== */}

        <div className="text-center mt-6">
          <p
            className="
            text-slate-500
            dark:text-slate-400
          "
          >
            {isLogin ? "Don't have an account?" : "Already have an account?"}
          </p>

          <button
            type="button"
            onClick={switchMode}
            className="
              mt-2
              text-blue-600
              hover:text-blue-700
              dark:text-blue-400
              font-semibold
            "
          >
            {isLogin ? "Create an account" : "Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Auth;
