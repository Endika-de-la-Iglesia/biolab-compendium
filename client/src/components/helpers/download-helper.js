
// import { useReactToPrint } from "react-to-print";

// export const handlePrint = useReactToPrint({
//   content: () => ref.current,
//   onBeforeGetContent: () => {
//     const buttons = ref.current.querySelectorAll(".btn");
//     buttons.forEach((button) => (button.style.display = "none"));
//   },
//   onAfterPrint: () => {
//     const buttons = ref.current.querySelectorAll(".btn");
//     buttons.forEach((button) => (button.style.display = ""));
//   },
// });

// export const downloadTableAsCSV = () => {
//   const table = document.querySelector(".table");
//   if (!table) return;

//   let csvContent = "";
//   const rows = table.querySelectorAll("tr");

//   rows.forEach((row) => {
//     const cols = row.querySelectorAll("td, th");
//     const rowData = Array.from(cols)
//       .map((col) => col.textContent.replace(/,/g, ""))
//       .join(",");
//     csvContent += rowData + "\r\n";
//   });

//   const blob = new Blob([csvContent], { type: "text/csv" });
//   const url = window.URL.createObjectURL(blob);

//   const a = document.createElement("a");
//   a.href = url;
//   a.download = "table.csv";
//   document.body.appendChild(a);
//   a.click();
//   document.body.removeChild(a);
// };
