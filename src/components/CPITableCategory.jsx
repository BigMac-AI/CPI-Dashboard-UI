import React, { useEffect, useState } from "react";
import Papa from "papaparse";

const CATEGORY_LABELS = {
  "Actual_Food and non-alcoholic beverages": "식료품 및 비알코올 음료",
  "Actual_Miscellaneous goods and services": "기타 상품 및 서비스",
  "Actual_Actual rentals for housing": "실제 주거 임대료",
  "Actual_Maintenance and repair of the dwelling": "주택 유지 및 보수",
};

const CPITableCategory = ({ categories = [], startDate, endDate }) => {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    Papa.parse("/data/top4_firstday.csv", {
      header: true,
      download: true,
      dynamicTyping: false,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),
      complete: (result) => {
        setRows(result.data);
      },
    });
  }, []);

  if (!rows.length) {
    return <div style={{ padding: 16 }}>Loading category data...</div>;
  }

  const filteredDates = Array.from(new Set(rows.map((r) => r.Date)))
    .filter(
      (d) =>
        (!startDate || d >= startDate) &&
        (!endDate || d <= endDate)
    )
    .sort();

  const defaultCols = 12; 
  const fallbackDates = Array(defaultCols).fill("-");

  const buildRow = (cat, type) => {
    return filteredDates.map((date) => {
      const record = rows.find((r) => r.Date === date);
      if (!record) return "-";

      const col =
        type === "actual"
          ? cat
          : type === "predictedO"
          ? cat.replace("Actual_", "PredictedSent_")
          : cat.replace("Actual_", "PredictedNoSent_");

      return record?.[col] !== undefined && record?.[col] !== ""
        ? Number(record[col]).toFixed(2)
        : "-";
    });
  };

  let korName = "선택된 품목";
  let actualRow = [];
  let predictedRow = [];
  let optimalRow = [];

  if (categories.length) {
    const category = categories[0];
    korName = CATEGORY_LABELS[category] || category;
    actualRow = buildRow(category, "actual");
    predictedRow = buildRow(category, "predictedO");
    optimalRow = buildRow(category, "predictedX");
  } else {
    actualRow = Array(defaultCols).fill("-");
    predictedRow = Array(defaultCols).fill("-");
    optimalRow = Array(defaultCols).fill("-");
  }

  const datesToRender = categories.length ? filteredDates : fallbackDates;

  return (
    <div
      style={{
        border: "1px solid #d1d5db",
        borderRadius: 8,
        padding: "1rem",
        backgroundColor: "#fff",
      }}
    >
      <h3 style={{ fontWeight: 700, fontSize: "16px", marginBottom: "12px" }}>
        {korName} 상세 수치
      </h3>
      <div style={{ overflowX: "auto", width: "100%" }}>
        <div style={{ maxHeight: "125px", overflowY: "auto" }}>
          <table
            style={{
              tableLayout: "fixed",
              borderCollapse: "collapse",
              minWidth: `${datesToRender.length * 140 + 150}px`,
              fontSize: "12px",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f1f5f9" }}>
                <th
                  style={{
                    position: "sticky",
                    top: 0,
                    background: "#f1f5f9",
                    zIndex: 2,
                    width: "150px",
                    padding: "4px 6px",
                    textAlign: "left",
                    whiteSpace: "nowrap",
                  }}
                >
                  항목 / 날짜
                </th>
                {datesToRender.map((d, i) => (
                  <th
                    key={i}
                    style={{
                      position: "sticky",
                      top: 0,
                      background: "#f1f5f9",
                      zIndex: 1,
                      width: "140px",
                      padding: "4px 6px",
                      textAlign: "center",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {d}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["실제값", actualRow],
                ["예측값(감성분석O)", predictedRow],
                ["예측값(감성분석X)", optimalRow],
              ].map(([label, row]) => (
                <tr key={label}>
                  <td
                    style={{
                      padding: "4px 6px",
                      fontWeight: 500,
                      whiteSpace: "nowrap",
                      color: "#374151",
                    }}
                  >
                    {label}
                  </td>
                  {row.map((v, i) => (
                    <td
                      key={i}
                      style={{
                        padding: "4px 6px",
                        textAlign: "center",
                        whiteSpace: "nowrap",
                        color: "#111827",
                      }}
                    >
                      {v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CPITableCategory;
