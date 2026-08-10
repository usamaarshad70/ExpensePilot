import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function VerifyEmail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { verifyEmail, resendVerificationCode } = useAuth();

  const [email, setEmail] = useState(searchParams.get("email") || "");

  const [code, setCode] = useState("");

  const [loading, setLoading] = useState(false);

  const [resending, setResending] = useState(false);

  // ==========================================
  // VERIFY
  // ==========================================

  const handleVerify = async (e) => {
    e.preventDefault();

    if (code.length !== 6) {
      return;
    }

    setLoading(true);

    const result = await verifyEmail(email, code);

    setLoading(false);

    if (result.success) {
      navigate("/");
    }
  };

  // ==========================================
  // RESEND
  // ==========================================

  const handleResend = async () => {
    if (!email) {
      return;
    }

    setResending(true);

    await resendVerificationCode(email);

    setResending(false);
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
            Verify Your Email
          </h1>

          <p
            className="
            mt-2
            text-slate-500
            dark:text-slate-400
          "
          >
            We sent a 6-digit verification code to your email.
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-5">
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
              Verification Code
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
            {loading ? "Verifying..." : "Verify Email"}
          </button>
        </form>

        <div className="text-center mt-6">
          <p
            className="
            text-sm
            text-slate-500
            dark:text-slate-400
          "
          >
            Didn't receive the code?
          </p>

          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="
              mt-2
              text-blue-600
              dark:text-blue-400
              font-semibold
            "
          >
            {resending ? "Sending..." : "Resend Code"}
          </button>
        </div>

        <button
          type="button"
          onClick={() => navigate("/auth")}
          className="
            w-full
            mt-5
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

export default VerifyEmail;
