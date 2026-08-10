import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function ResetPassword() {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const { resetPassword } = useAuth();

  const [email, setEmail] = useState(searchParams.get("email") || "");

  const [code, setCode] = useState("");

  const [newPassword, setNewPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (code.length !== 6) {
      return;
    }

    setLoading(true);

    const result = await resetPassword(email, code, newPassword);

    setLoading(false);

    if (result.success) {
      navigate("/auth");
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
            Reset Password
          </h1>

          <p
            className="
            mt-2
            text-slate-500
            dark:text-slate-400
          "
          >
            Enter the code sent to your email and create a new password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
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
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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

          {/* CODE */}

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
              Reset Code
            </label>

            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="Enter 6-digit code"
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
                text-center
                text-2xl
                tracking-[0.5em]
                outline-none
                focus:ring-2
                focus:ring-blue-500
              "
            />
          </div>

          {/* NEW PASSWORD */}

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
              New Password
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
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
                "
              >
                {showPassword ? <EyeOff size={21} /> : <Eye size={21} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || code.length !== 6}
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
            {loading ? "Resetting..." : "Reset Password"}
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

export default ResetPassword;
