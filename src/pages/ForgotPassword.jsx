import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function ForgotPassword() {
  const navigate = useNavigate();

  const { forgotPassword } = useAuth();

  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    const result = await forgotPassword(email);

    setLoading(false);

    if (result.success) {
      navigate(`/reset-password?email=${encodeURIComponent(email)}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950 px-4">
      <div
        className="
        w-full
        max-w-md
        bg-white
        dark:bg-slate-900
        rounded-2xl
        shadow-xl
        p-6
        sm:p-8
        border
        border-slate-200
        dark:border-slate-800
      "
      >
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
            text-2xl
            font-bold
            text-slate-900
            dark:text-white
          "
          >
            Forgot Password?
          </h1>

          <p
            className="
            mt-2
            text-slate-500
            dark:text-slate-400
          "
          >
            Enter your email and we'll send you a password reset code.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
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
            "
          >
            {loading ? "Sending..." : "Send Reset Code"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => navigate("/auth")}
          className="
            w-full
            mt-6
            text-sm
            text-slate-500
            hover:text-blue-600
            dark:text-slate-400
          "
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}

export default ForgotPassword;
