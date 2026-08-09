import { saveAs } from "file-saver";
import toast from "react-hot-toast";
import { useExpense } from "../context/ExpenseContext";

function ExportCSV() {
  const { transactions } = useExpense();

  // Convert date to: 08 Aug 2026
  const formatDate = (date) => {
    if (!date) return "";

    const d = new Date(date);

    if (Number.isNaN(d.getTime())) {
      return "";
    }

    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Properly escape CSV values
  const escapeCSV = (value) => {
    return `"${String(value ?? "").replace(/"/g, '""')}"`;
  };

  const exportToCSV = () => {
    if (transactions.length === 0) {
      toast.error("No transactions to export");
      return;
    }

    const headers = ["Title", "Amount", "Type", "Category", "Date"];

    const rows = transactions.map((transaction) => [
      escapeCSV(transaction.title),
      escapeCSV(transaction.amount),
      escapeCSV(transaction.type),
      escapeCSV(transaction.category),
      escapeCSV(formatDate(transaction.date)),
    ]);

    const csvContent = [
      headers.map(escapeCSV).join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\r\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const fileName = `ExpensePilot-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    saveAs(blob, fileName);

    toast.success("CSV Exported Successfully");
  };

  return (
    <button
      onClick={exportToCSV}
      className="
        bg-green-600
        hover:bg-green-700
        text-white
        px-5
        py-3
        rounded-lg
        font-semibold
      "
    >
      Export CSV
    </button>
  );
}

export default ExportCSV;
