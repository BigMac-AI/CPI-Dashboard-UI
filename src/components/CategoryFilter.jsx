import { useState, useEffect } from "react";
import Papa from "papaparse";

const CATEGORY_LABELS = {
  "Actual_Food and non-alcoholic beverages": "식료품 및 비알코올 음료",
  "Actual_Miscellaneous goods and services": "기타 상품 및 서비스",
  "Actual_Actual rentals for housing": "실제 주거 임대료",
  "Actual_Maintenance and repair of the dwelling": "주택 유지 및 보수",
};

const CategoryFilter = ({ selected, onChange, onReset }) => {
  const [allCategories, setAllCategories] = useState([]);

  useEffect(() => {
    Papa.parse("/data/top4_firstday.csv", {
      download: true,
      preview: 1,
      header: true,
      complete: (result) => {
        if (!result.meta || !result.meta.fields) return;

        console.log("📌 CSV 헤더:", result.meta.fields);

        const actualCols = result.meta.fields.filter((f) =>
          f.startsWith("Actual_")
        );

        setAllCategories(actualCols);
        console.log("📌 사용 가능한 변수 목록:", actualCols);
      },
    });
  }, []);

  const selectCategory = (category) => {
    if (selected === category) {
      onChange(null);
    } else {
      onChange(category);
    }
  };

  return (
    <div
      style={{
        border: "1px solid #d1d5db",
        borderRadius: "12px",
        padding: "1rem",
        backgroundColor: "#ffffff",
        fontSize: "14px",
        display: "flex",
        flexDirection: "column",
        width: "100%",
        boxSizing: "border-box",
        gap: "0.95rem",
      }}
    >
      <div
        style={{
          fontWeight: "600",
          color: "#374151",
          marginBottom: "0.75rem",
        }}
      >
        변수 선택
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        {allCategories.map((cat) => (
          <label
            key={cat}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              color: "#111827",
              cursor: "pointer",
            }}
          >
            <input
              type="radio"
              name="category"
              checked={selected === cat}
              onChange={() => selectCategory(cat)}
              style={{ accentColor: "#000000", width: "14px", height: "14px" }}
            />
            {CATEGORY_LABELS[cat] || cat}
          </label>
        ))}
        {!allCategories.length && (
          <div style={{ fontSize: "13px", color: "#9ca3af" }}>
            불러올 항목이 없습니다.
          </div>
        )}
      </div>

      <button
        onClick={onReset}
        style={{
          marginTop: "1rem",
          padding: "6px 10px",
          fontSize: "13px",
          border: "1px solid #d1d5db",
          backgroundColor: "#f3f4f6",
          borderRadius: "6px",
          cursor: "pointer",
          color: "#1f2937",
        }}
      >
        선택 초기화
      </button>
    </div>
  );
};

export default CategoryFilter;
