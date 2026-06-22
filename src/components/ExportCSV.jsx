import { saveAs } from "file-saver";
import toast from "react-hot-toast";

import { useExpense } from "../context/ExpenseContext";

function ExportCSV() {
  const { transactions } = useExpense();

  const exportToCSV = () => {
    if (transactions.length === 0) {
      toast.error("No transactions to export");
      return;
    }

    const headers = ["Title", "Amount", "Type", "Category", "Date"];

    const rows = transactions.map((item) => [
      item.title,
      item.amount,
      item.type,
      item.category,
      item.date,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    saveAs(blob, `ExpensePilot-${new Date().toISOString().slice(0, 10)}.csv`);

    toast.success("CSV Exported Successfully");
  };

  return (
    <button
      onClick={exportToCSV}
      className="
      bg-emerald-600
      hover:bg-emerald-700
      text-white
      px-4
      py-2
      rounded-lg
      transition
      "
    >
      Export CSV
    </button>
  );
}

export default ExportCSV;
