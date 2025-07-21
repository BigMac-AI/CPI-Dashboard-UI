// src/components/CPITableCategory.jsx
import React from "react";
import cpiData from "../data/parsedCPIData_with_full_predictions.json";

const CPITableCategory = ({
  categories = [],
  startDate,
  endDate,
}) => {
  if (!categories.length) {
    return (
      <div style={{ padding: 16, textAlign: "center", color: "#6b7280" }}>
        선택된 항목이 없습니다.
      </div>
    );
  }

  // CPI 기준 날짜 목록
  const dates = cpiData["CPI"]
    .map((r) => r.날짜)
    .filter((d) => d >= startDate && d <= endDate);

  // 각 카테고리별 실제값 배열 생성
  const rows = categories.map((cat) => {
    const recs = cpiData[cat] || [];
    const values = dates.map((date) => {
      const r = recs.find((r) => r.날짜 === date);
      return r?.값 !== undefined ? r.값.toFixed(2) : "-";
    });
    return { cat, values };
  });

  // 선택 항목이 4개 초과일 때만 세로 스크롤 활성화
  const containerStyle = {
    maxHeight: categories.length > 4 ? "130px" : "auto",
    overflowY: categories.length > 4 ? "auto" : "visible",
    overflowX: "auto",
  };

  return (
    <div
      style={{
        border: "1px solid #d1d5db",
        borderRadius: 8,
        padding: "1rem",
        backgroundColor: "#fff",
      }}
    >
      <h3
        style={{
          fontWeight: 700,
          fontSize: "16px",
          marginBottom: "12px",
          color: "#111827",
        }}
      >
        선택된 품목 실제값
      </h3>

      <div style={containerStyle}>
        <table
          style={{
            tableLayout: "fixed",
            borderCollapse: "collapse",
            minWidth: `${dates.length * 120 + 150}px`,
            fontSize: "12px",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#f1f5f9" }}>
              <th
                style={{
                  width: "150px",
                  padding: "4px 6px",
                  textAlign: "left",
                  whiteSpace: "nowrap",
                }}
              >
                항목 / 날짜
              </th>
              {dates.map((d) => (
                <th
                  key={d}
                  style={{
                    width: "120px",
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
            {rows.map((row) => (
              <tr key={row.cat}>
                <td
                  style={{
                    padding: "4px 6px",
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                    color: "#374151",
                  }}
                >
                  {row.cat}
                </td>
                {row.values.map((v, i) => (
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
  );
};

export default CPITableCategory;
