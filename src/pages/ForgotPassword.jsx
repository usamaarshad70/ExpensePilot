import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function ForgotPassword() {
  const navigate = useNavigate();

  const { forgotPassword } = useAuth();

  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);

  const [resetCode, setResetCode] = useState("");

  const [codeGenerated, setCodeGenerated] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    const result = await forgotPassword(email);

    setLoading(false);

    if (result.success) {
      setResetCode(result.resetCode);

      setCodeGenerated(true);
    }
  };

  const continueToReset = () => {
    navigate(
      `/reset-password?email=${encodeURIComponent(
        email,
      )}&code=${encodeURIComponent(resetCode)}`,
    );
  };

  return (
    <div
      className="
        min-h-screen
        flex
        items-center
        justify-center
        bg-slate-100
        dark:bg-slate-950
        px-4
        py-8
      "
    >
      <div
        className="
          w-full
          max-w-md
          bg-white
          dark:bg-slate-900
          rounded-2xl
          shadow-xl
          p-8
          border
          border-slate-200
          dark:border-slate-800
        "
      >
        {/* HEADER */}

        <div className="text-center mb-8">
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
            Enter your email to generate a password reset code.
          </p>
        </div>

        {!codeGenerated ? (
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
              {loading ? "Generating..." : "Generate Reset Code"}
            </button>
          </form>
        ) : (
          /* RESET CODE */

          <div className="space-y-5">
            <div
              className="
                rounded-xl
                border
                border-blue-200
                dark:border-blue-900
                bg-blue-50
                dark:bg-blue-950/40
                p-5
                text-center
              "
            >
              <p
                className="
                  text-sm
                  text-slate-600
                  dark:text-slate-400
                  mb-3
                "
              >
                Your password reset code is:
              </p>

              <div
                className="
                  text-4xl
                  font-bold
                  tracking-[0.4em]
                  text-blue-600
                  dark:text-blue-400
                "
              >
                {resetCode}
              </div>

              <p
                className="
                  mt-4
                  text-xs
                  text-slate-500
                  dark:text-slate-400
                "
              >
                This code expires in 10 minutes.
              </p>
            </div>

            <button
              type="button"
              onClick={continueToReset}
              className="
                w-full
                bg-blue-600
                hover:bg-blue-700
                text-white
                font-semibold
                py-3
                rounded-xl
                transition
              "
            >
              Continue to Reset Password
            </button>
          </div>
        )}

        {/* BACK */}

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
            dark:hover:text-blue-400
          "
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}

export default ForgotPassword;
