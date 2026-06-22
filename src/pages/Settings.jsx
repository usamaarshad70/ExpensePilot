import { useState } from "react";

import Layout from "../components/Layout";

import { useExpense } from "../context/ExpenseContext";

import { useTheme } from "../context/ThemeContext";

function Settings() {
  const { categories, addCategory, deleteCategory, resetAllData } =
    useExpense();

  const { darkMode, toggleTheme } = useTheme();

  const [newCategory, setNewCategory] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!newCategory) return;

    addCategory(newCategory);

    setNewCategory("");
  };

  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      <div
        className="
      bg-white
      dark:bg-gray-800
      p-6
      rounded
      shadow
      "
      >
        <h2
          className="
        text-xl
        font-bold
        mb-4
        "
        >
          Theme
        </h2>

        <button
          onClick={toggleTheme}
          className="
          bg-blue-500
          text-white
          px-4
          py-2
          rounded
          mb-8
          "
        >
          {darkMode ? "Light Mode" : "Dark Mode"}
        </button>

        <hr className="mb-6" />

        <h2
          className="
        text-xl
        font-bold
        mb-4
        "
        >
          Categories
        </h2>

        <form
          onSubmit={handleSubmit}
          className="
          flex
          gap-2
          mb-4
          "
        >
          <input
            type="text"
            placeholder="New Category"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="
            border
            p-2
            rounded
            flex-1
            "
          />

          <button
            className="
            bg-green-500
            text-white
            px-4
            rounded
            "
          >
            Add
          </button>
        </form>

        <div className="mb-8">
          {categories.map((category) => (
            <div
              key={category}
              className="
                flex
                justify-between
                items-center
                border-b
                py-2
                "
            >
              <span>{category}</span>

              <button
                onClick={() => deleteCategory(category)}
                className="
                  bg-red-500
                  text-white
                  px-3
                  py-1
                  rounded
                  "
              >
                Delete
              </button>
            </div>
          ))}
        </div>

        <hr className="mb-6" />

        <button
          onClick={resetAllData}
          className="
          bg-red-700
          text-white
          px-4
          py-2
          rounded
          "
        >
          Reset All Data
        </button>
      </div>
    </Layout>
  );
}

export default Settings;
