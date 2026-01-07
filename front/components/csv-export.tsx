import React from "react";
import { map } from "zod";

const ExportCSV = (data: any[], fileName: any) => {
  const downloadCSV = () => {
    const csvString = [
      ["header1", "header2", "header3"],
      ...data.map((item) => [item.field1, item.field2, item.field3]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvString], {
      type: "text/csv",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName || "report.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  return <button onClick={downloadCSV}>Export csv</button>;
};
export default ExportCSV;
