import { useState, useEffect } from "react";

const LassoSentimentFilter = ({ onChange }) => {
  const [lasso, setLasso] = useState(null);
  const [sentiment, setSentiment] = useState(null);

  useEffect(() => {
    let mode = "";

    if (lasso !== null && sentiment !== null) {
      if (lasso === 1 && sentiment === 1) mode = "Lasso_Senti";
      else if (lasso === 1 && sentiment === 0) mode = "Lasso_Nonsenti";
      else if (lasso === 0 && sentiment === 1) mode = "Nonlasso_Senti";
      else if (lasso === 0 && sentiment === 0) mode = "Nonlasso_Nonsenti";
    }

    onChange(mode);
  }, [lasso, sentiment, onChange]);

  const renderSelect = (label, value, setter) => (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: "120px" }}>
      <label style={{ fontSize: "13px", color: "#6b7280", marginBottom: "4px" }}>
        {label}
      </label>
      <select
        value={value ?? ""}
        onChange={(e) => {
          const val = e.target.value;
          setter(val === "" ? null : Number(val));
        }}
        style={{
          width: "100%",
          padding: "6px 8px",
          border: "1px solid #ccc",
          borderRadius: "6px",
          fontSize: "13px",
        }}
      >
        <option value="">전체</option>
        <option value="1">적용</option>
        <option value="0">미적용</option>
      </select>
    </div>
  );

  return (
    <div
      style={{
        border: "1px solid #d1d5db",
        borderRadius: "12px",
        padding: "1rem",
        minHeight: "130px",
        backgroundColor: "#ffffff",
        fontSize: "14px",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{ fontWeight: "600", marginBottom: "0.75rem", color: "#374151" }}
      >
        추가 옵션
      </div>

      <div style={{ display: "flex", gap: "1rem" }}>
        {renderSelect("라쏘 회귀", lasso, setLasso)}
        {renderSelect("감성 분석", sentiment, setSentiment)}
      </div>
    </div>
  );
};

export default LassoSentimentFilter;
