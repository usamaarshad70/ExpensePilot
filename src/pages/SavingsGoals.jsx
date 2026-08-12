import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";

// ==========================================
// API
// ==========================================

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ==========================================
// HELPERS
// ==========================================

const getToken = () => {
  return (
    localStorage.getItem("expensepilot_token") ||
    localStorage.getItem("token") ||
    localStorage.getItem("authToken")
  );
};

const formatCurrency = (value) => {
  return `PKR ${Number(value || 0).toLocaleString("en-PK", {
    maximumFractionDigits: 0,
  })}`;
};

const formatDate = (dateValue) => {
  if (!dateValue) {
    return "No deadline";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "No deadline";
  }

  return date.toLocaleDateString("en-PK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getToday = () => {
  const date = new Date();

  return date.toISOString().split("T")[0];
};

// ==========================================
// COMPONENT
// ==========================================

function SavingsGoals() {
  const { user, loading: authLoading } = useAuth();

  // ==========================================
  // STATE
  // ==========================================

  const [goals, setGoals] = useState([]);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [editingGoal, setEditingGoal] = useState(null);

  const [showContribution, setShowContribution] = useState(null);

  // ==========================================
  // FORM
  // ==========================================

  const [title, setTitle] = useState("");

  const [targetAmount, setTargetAmount] = useState("");

  const [currentAmount, setCurrentAmount] = useState("");

  const [deadline, setDeadline] = useState("");

  const [contributionAmount, setContributionAmount] = useState("");

  // ==========================================
  // FETCH GOALS
  // ==========================================

  const fetchGoals = async () => {
    try {
      setLoading(true);

      const token = getToken();

      if (!token || !user) {
        setGoals([]);
        return;
      }

      const response = await axios.get(`${API_URL}/savings-goals`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setGoals(response.data?.goals || []);
    } catch (error) {
      console.error("Fetch savings goals error:", error);

      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
      } else {
        toast.error(
          error.response?.data?.message || "Failed to load savings goals",
        );
      }

      setGoals([]);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    if (!authLoading && user) {
      fetchGoals();
    }

    if (!authLoading && !user) {
      setGoals([]);
      setLoading(false);
    }
  }, [user, authLoading]);

  // ==========================================
  // SUMMARY
  // ==========================================

  const summary = useMemo(() => {
    const totalTarget = goals.reduce(
      (sum, goal) => sum + Number(goal.targetAmount || 0),
      0,
    );

    const totalSaved = goals.reduce(
      (sum, goal) => sum + Number(goal.currentAmount || 0),
      0,
    );

    const totalRemaining = Math.max(totalTarget - totalSaved, 0);

    const overallProgress =
      totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

    const completedGoals = goals.filter(
      (goal) =>
        Number(goal.currentAmount || 0) >= Number(goal.targetAmount || 0),
    ).length;

    return {
      totalTarget,
      totalSaved,
      totalRemaining,
      overallProgress,
      completedGoals,
    };
  }, [goals]);

  // ==========================================
  // RESET FORM
  // ==========================================

  const resetForm = () => {
    setTitle("");
    setTargetAmount("");
    setCurrentAmount("");
    setDeadline("");
    setEditingGoal(null);
  };

  // ==========================================
  // EDIT GOAL
  // ==========================================

  const handleEdit = (goal) => {
    setEditingGoal(goal);

    setTitle(goal.title || "");

    setTargetAmount(goal.targetAmount ?? "");

    setCurrentAmount(goal.currentAmount ?? "");

    if (goal.deadline) {
      const date = new Date(goal.deadline);

      if (!Number.isNaN(date.getTime())) {
        setDeadline(date.toISOString().split("T")[0]);
      } else {
        setDeadline("");
      }
    } else {
      setDeadline("");
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ==========================================
  // SAVE GOAL
  // ==========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      toast.error("Please enter a goal title");
      return;
    }

    if (!targetAmount || Number(targetAmount) <= 0) {
      toast.error("Please enter a valid target amount");
      return;
    }

    if (currentAmount !== "" && Number(currentAmount) < 0) {
      toast.error("Saved amount cannot be negative");
      return;
    }

    const target = Number(targetAmount);

    const saved = currentAmount === "" ? 0 : Number(currentAmount);

    if (saved > target) {
      toast.error("Saved amount cannot be greater than target amount");
      return;
    }

    const token = getToken();

    if (!token || !user) {
      toast.error("Please login first");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        title: trimmedTitle,
        targetAmount: target,
        currentAmount: saved,
        deadline: deadline || null,
      };

      let response;

      if (editingGoal) {
        const goalId = editingGoal._id || editingGoal.id;

        response = await axios.put(
          `${API_URL}/savings-goals/${goalId}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        toast.success("Savings goal updated successfully");
      } else {
        response = await axios.post(`${API_URL}/savings-goals`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        toast.success("Savings goal created successfully");
      }

      const updatedGoal = response.data?.goal;

      if (updatedGoal) {
        setGoals((previous) => {
          if (editingGoal) {
            return previous.map((goal) =>
              (goal._id || goal.id) === (updatedGoal._id || updatedGoal.id)
                ? updatedGoal
                : goal,
            );
          }

          return [updatedGoal, ...previous];
        });
      } else {
        await fetchGoals();
      }

      resetForm();
    } catch (error) {
      console.error("Save savings goal error:", error);

      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
      } else {
        toast.error(
          error.response?.data?.message || "Failed to save savings goal",
        );
      }
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // ADD CONTRIBUTION
  // ==========================================

  const handleContribution = async (event) => {
    event.preventDefault();

    if (!contributionAmount || Number(contributionAmount) <= 0) {
      toast.error("Please enter a valid contribution");
      return;
    }

    const goal = showContribution;

    if (!goal) {
      return;
    }

    const goalTarget = Number(goal.targetAmount || 0);

    const goalSaved = Number(goal.currentAmount || 0);

    const contribution = Number(contributionAmount);

    const remaining = Math.max(goalTarget - goalSaved, 0);

    if (contribution > remaining) {
      toast.error(`Maximum contribution is ${formatCurrency(remaining)}`);
      return;
    }

    const token = getToken();

    if (!token || !user) {
      toast.error("Please login first");
      return;
    }

    try {
      setSaving(true);

      const goalId = goal._id || goal.id;

      const response = await axios.post(
        `${API_URL}/savings-goals/${goalId}/contribute`,
        {
          amount: contribution,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const updatedGoal = response.data?.goal;

      if (updatedGoal) {
        setGoals((previous) =>
          previous.map((item) =>
            (item._id || item.id) === (updatedGoal._id || updatedGoal.id)
              ? updatedGoal
              : item,
          ),
        );
      }

      toast.success("Savings contribution added");

      setContributionAmount("");

      setShowContribution(null);
    } catch (error) {
      console.error("Add savings contribution error:", error);

      toast.error(
        error.response?.data?.message || "Failed to add contribution",
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // DELETE
  // ==========================================

  const handleDelete = async (goal) => {
    const goalId = goal._id || goal.id;

    if (!goalId) {
      toast.error("Invalid savings goal");
      return;
    }

    const confirmed = window.confirm(`Delete "${goal.title}" savings goal?`);

    if (!confirmed) {
      return;
    }

    const token = getToken();

    if (!token || !user) {
      toast.error("Please login first");
      return;
    }

    try {
      await axios.delete(`${API_URL}/savings-goals/${goalId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setGoals((previous) =>
        previous.filter((item) => (item._id || item.id) !== goalId),
      );

      toast.success("Savings goal deleted");

      if (editingGoal && (editingGoal._id || editingGoal.id) === goalId) {
        resetForm();
      }
    } catch (error) {
      console.error("Delete savings goal error:", error);

      toast.error(
        error.response?.data?.message || "Failed to delete savings goal",
      );
    }
  };

  // ==========================================
  // GOAL STATUS
  // ==========================================

  const getGoalInfo = (goal) => {
    const target = Number(goal.targetAmount || 0);

    const saved = Number(goal.currentAmount || 0);

    const remaining = Math.max(target - saved, 0);

    const percentage = target > 0 ? Math.min((saved / target) * 100, 100) : 0;

    const completed = target > 0 && saved >= target;

    let overdue = false;

    if (goal.deadline && !completed) {
      const deadlineDate = new Date(goal.deadline);

      const today = new Date();

      today.setHours(0, 0, 0, 0);

      deadlineDate.setHours(0, 0, 0, 0);

      overdue = deadlineDate < today;
    }

    let status = "On Track";

    let statusClass =
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400";

    if (completed) {
      status = "Completed";

      statusClass =
        "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400";
    } else if (overdue) {
      status = "Overdue";

      statusClass =
        "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400";
    } else if (percentage >= 80) {
      status = "Almost There";

      statusClass =
        "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-400";
    }

    return {
      target,
      saved,
      remaining,
      percentage,
      completed,
      overdue,
      status,
      statusClass,
    };
  };

  // ==========================================
  // DAYS REMAINING
  // ==========================================

  const getDaysRemaining = (goal) => {
    if (!goal.deadline) {
      return null;
    }

    if (getGoalInfo(goal).completed) {
      return 0;
    }

    const deadlineDate = new Date(goal.deadline);

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    deadlineDate.setHours(0, 0, 0, 0);

    const difference = deadlineDate.getTime() - today.getTime();

    return Math.ceil(difference / (1000 * 60 * 60 * 24));
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="min-h-[500px] flex items-center justify-center">
          <div className="text-center">
            <div className="text-5xl mb-4">🎯</div>

            <p className="text-slate-500 dark:text-slate-400">
              Loading savings goals...
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <Layout>
      <div className="space-y-7 pb-10">
        {/* ==========================================
            HEADER
        ========================================== */}

        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
            Savings Goals
          </h1>

          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Set financial goals, save money and track your progress.
          </p>
        </div>

        {/* ==========================================
            SUMMARY CARDS
        ========================================== */}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* TOTAL TARGET */}

          <div className="bg-blue-600 text-white rounded-2xl p-5 shadow-lg">
            <p className="text-sm opacity-90">Total Target</p>

            <h2 className="text-2xl md:text-3xl font-bold mt-2">
              {formatCurrency(summary.totalTarget)}
            </h2>

            <p className="text-xs mt-2 opacity-80">
              Across {goals.length} goal
              {goals.length !== 1 ? "s" : ""}
            </p>
          </div>

          {/* TOTAL SAVED */}

          <div className="bg-emerald-600 text-white rounded-2xl p-5 shadow-lg">
            <p className="text-sm opacity-90">Total Saved</p>

            <h2 className="text-2xl md:text-3xl font-bold mt-2">
              {formatCurrency(summary.totalSaved)}
            </h2>

            <p className="text-xs mt-2 opacity-80">Money already saved</p>
          </div>

          {/* REMAINING */}

          <div className="bg-indigo-600 text-white rounded-2xl p-5 shadow-lg">
            <p className="text-sm opacity-90">Remaining</p>

            <h2 className="text-2xl md:text-3xl font-bold mt-2">
              {formatCurrency(summary.totalRemaining)}
            </h2>

            <p className="text-xs mt-2 opacity-80">Still needed</p>
          </div>

          {/* PROGRESS */}

          <div className="bg-purple-600 text-white rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between">
              <p className="text-sm opacity-90">Overall Progress</p>

              <span className="text-lg">📈</span>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold mt-2">
              {summary.overallProgress.toFixed(0)}%
            </h2>

            <div className="mt-3 h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full"
                style={{
                  width: `${Math.min(summary.overallProgress, 100)}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* ==========================================
            CREATE / EDIT FORM
        ========================================== */}

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-lg p-5 md:p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xl">
              {editingGoal ? "✏️" : "🎯"}
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {editingGoal ? "Edit Savings Goal" : "Create New Savings Goal"}
              </h2>

              <p className="text-sm text-slate-500 dark:text-slate-400">
                {editingGoal
                  ? "Update your savings target"
                  : "Set a target and start saving"}
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4"
          >
            {/* TITLE */}

            <div className="xl:col-span-1">
              <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                Goal Name
              </label>

              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. New Laptop"
                maxLength={100}
                className="
                  w-full
                  border border-slate-300
                  dark:border-slate-600
                  bg-white dark:bg-slate-700
                  text-slate-900 dark:text-white
                  px-4 py-3
                  rounded-lg
                  outline-none
                  focus:ring-2
                  focus:ring-blue-500
                "
              />
            </div>

            {/* TARGET */}

            <div>
              <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                Target Amount
              </label>

              <input
                type="number"
                min="1"
                value={targetAmount}
                onChange={(event) => setTargetAmount(event.target.value)}
                placeholder="Enter target"
                className="
                  w-full
                  border border-slate-300
                  dark:border-slate-600
                  bg-white dark:bg-slate-700
                  text-slate-900 dark:text-white
                  px-4 py-3
                  rounded-lg
                  outline-none
                  focus:ring-2
                  focus:ring-blue-500
                "
              />
            </div>

            {/* INITIAL SAVED */}

            <div>
              <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                Already Saved
              </label>

              <input
                type="number"
                min="0"
                value={currentAmount}
                onChange={(event) => setCurrentAmount(event.target.value)}
                placeholder="0"
                className="
                  w-full
                  border border-slate-300
                  dark:border-slate-600
                  bg-white dark:bg-slate-700
                  text-slate-900 dark:text-white
                  px-4 py-3
                  rounded-lg
                  outline-none
                  focus:ring-2
                  focus:ring-blue-500
                "
              />
            </div>

            {/* DEADLINE */}

            <div>
              <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                Deadline
              </label>

              <input
                type="date"
                min={getToday()}
                value={deadline}
                onChange={(event) => setDeadline(event.target.value)}
                className="
                  w-full
                  border border-slate-300
                  dark:border-slate-600
                  bg-white dark:bg-slate-700
                  text-slate-900 dark:text-white
                  px-4 py-3
                  rounded-lg
                  outline-none
                  focus:ring-2
                  focus:ring-blue-500
                "
              />
            </div>

            {/* BUTTON */}

            <div className="flex items-end gap-2">
              <button
                type="submit"
                disabled={saving}
                className="
                  w-full
                  bg-blue-600
                  hover:bg-blue-700
                  disabled:opacity-60
                  text-white
                  font-semibold
                  px-5
                  py-3
                  rounded-lg
                  transition
                "
              >
                {saving
                  ? "Saving..."
                  : editingGoal
                    ? "Update Goal"
                    : "Create Goal"}
              </button>

              {editingGoal && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="
                    px-4
                    py-3
                    rounded-lg
                    border
                    border-slate-300
                    dark:border-slate-600
                    text-slate-700
                    dark:text-slate-300
                    hover:bg-slate-100
                    dark:hover:bg-slate-700
                  "
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* ==========================================
            GOALS HEADER
        ========================================== */}

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
              Your Savings Goals
            </h2>

            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Track how close you are to each target.
            </p>
          </div>

          <div className="px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 text-sm font-semibold">
            {goals.length} Goal
            {goals.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* ==========================================
            EMPTY STATE
        ========================================== */}

        {goals.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-lg p-10 text-center">
            <div className="text-6xl mb-4">🎯</div>

            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              No Savings Goals Yet
            </h3>

            <p className="mt-2 max-w-lg mx-auto text-slate-500 dark:text-slate-400">
              Create your first savings goal above and start tracking your
              financial progress.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            {goals.map((goal) => {
              const info = getGoalInfo(goal);

              const daysRemaining = getDaysRemaining(goal);

              return (
                <div
                  key={goal._id || goal.id}
                  className="
                    bg-white
                    dark:bg-slate-800
                    border
                    border-slate-200
                    dark:border-slate-700
                    rounded-2xl
                    shadow-lg
                    p-5
                  "
                >
                  {/* TOP */}

                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white truncate">
                          {goal.title}
                        </h3>

                        <span
                          className={`
                            px-3
                            py-1
                            rounded-full
                            text-xs
                            font-semibold
                            ${info.statusClass}
                          `}
                        >
                          {info.status}
                        </span>
                      </div>

                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Target: {formatCurrency(info.target)}
                      </p>
                    </div>

                    <div className="flex gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleEdit(goal)}
                        className="
                          w-9 h-9
                          rounded-lg
                          bg-yellow-500
                          hover:bg-yellow-600
                          text-white
                          flex
                          items-center
                          justify-center
                        "
                        title="Edit"
                      >
                        ✏️
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(goal)}
                        className="
                          w-9 h-9
                          rounded-lg
                          bg-red-500
                          hover:bg-red-600
                          text-white
                          flex
                          items-center
                          justify-center
                        "
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  {/* AMOUNTS */}

                  <div className="grid grid-cols-3 gap-3 mt-6">
                    <div className="bg-blue-50 dark:bg-blue-500/10 rounded-xl p-3">
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Target
                      </p>

                      <p className="font-bold text-blue-700 dark:text-blue-400 mt-1">
                        {formatCurrency(info.target)}
                      </p>
                    </div>

                    <div className="bg-emerald-50 dark:bg-emerald-500/10 rounded-xl p-3">
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Saved
                      </p>

                      <p className="font-bold text-emerald-700 dark:text-emerald-400 mt-1">
                        {formatCurrency(info.saved)}
                      </p>
                    </div>

                    <div className="bg-slate-100 dark:bg-slate-700 rounded-xl p-3">
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Remaining
                      </p>

                      <p className="font-bold text-slate-800 dark:text-white mt-1">
                        {formatCurrency(info.remaining)}
                      </p>
                    </div>
                  </div>

                  {/* PROGRESS */}

                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Savings Progress
                      </p>

                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        {info.percentage.toFixed(0)}%
                      </p>
                    </div>

                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`
                          h-full
                          rounded-full
                          transition-all
                          ${
                            info.completed
                              ? "bg-blue-600"
                              : info.overdue
                                ? "bg-red-500"
                                : info.percentage >= 80
                                  ? "bg-yellow-500"
                                  : "bg-emerald-500"
                          }
                        `}
                        style={{
                          width: `${info.percentage}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* DEADLINE */}

                  <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Deadline
                      </p>

                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1">
                        {formatDate(goal.deadline)}
                      </p>
                    </div>

                    {daysRemaining !== null && (
                      <div
                        className={`
                          text-sm font-semibold
                          ${
                            daysRemaining < 0
                              ? "text-red-600 dark:text-red-400"
                              : daysRemaining <= 30
                                ? "text-yellow-600 dark:text-yellow-400"
                                : "text-emerald-600 dark:text-emerald-400"
                          }
                        `}
                      >
                        {daysRemaining < 0
                          ? `${Math.abs(daysRemaining)} days overdue`
                          : info.completed
                            ? "Goal completed"
                            : `${daysRemaining} days remaining`}
                      </div>
                    )}
                  </div>

                  {/* CONTRIBUTION BUTTON */}

                  {!info.completed && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowContribution(goal);
                        setContributionAmount("");
                      }}
                      className="
                        w-full
                        mt-5
                        bg-blue-600
                        hover:bg-blue-700
                        text-white
                        font-semibold
                        py-3
                        rounded-lg
                        transition
                      "
                    >
                      + Add Savings
                    </button>
                  )}

                  {/* CONTRIBUTION FORM */}

                  {showContribution &&
                    (showContribution._id || showContribution.id) ===
                      (goal._id || goal.id) && (
                      <form
                        onSubmit={handleContribution}
                        className="
                          mt-4
                          p-4
                          bg-slate-50
                          dark:bg-slate-700/50
                          border
                          border-slate-200
                          dark:border-slate-600
                          rounded-xl
                        "
                      >
                        <div className="flex items-center justify-between mb-3">
                          <p className="font-semibold text-slate-900 dark:text-white">
                            Add Savings
                          </p>

                          <button
                            type="button"
                            onClick={() => {
                              setShowContribution(null);
                              setContributionAmount("");
                            }}
                            className="text-slate-500 hover:text-red-500"
                          >
                            ✕
                          </button>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                          <input
                            type="number"
                            min="1"
                            max={info.remaining}
                            value={contributionAmount}
                            onChange={(event) =>
                              setContributionAmount(event.target.value)
                            }
                            placeholder="Enter amount"
                            className="
                              flex-1
                              border
                              border-slate-300
                              dark:border-slate-600
                              bg-white
                              dark:bg-slate-800
                              text-slate-900
                              dark:text-white
                              px-4
                              py-3
                              rounded-lg
                              outline-none
                              focus:ring-2
                              focus:ring-blue-500
                            "
                          />

                          <button
                            type="submit"
                            disabled={saving}
                            className="
                              bg-emerald-600
                              hover:bg-emerald-700
                              disabled:opacity-60
                              text-white
                              font-semibold
                              px-5
                              py-3
                              rounded-lg
                            "
                          >
                            {saving ? "Adding..." : "Add Money"}
                          </button>
                        </div>

                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                          Remaining target: {formatCurrency(info.remaining)}
                        </p>
                      </form>
                    )}
                </div>
              );
            })}
          </div>
        )}

        {/* ==========================================
            COMPLETED GOALS
        ========================================== */}

        {summary.completedGoals > 0 && (
          <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <div className="text-2xl">🎉</div>

              <div>
                <h3 className="font-bold text-blue-900 dark:text-blue-300">
                  Great progress!
                </h3>

                <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                  You have completed {summary.completedGoals} savings goal
                  {summary.completedGoals !== 1 ? "s" : ""}.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default SavingsGoals;
