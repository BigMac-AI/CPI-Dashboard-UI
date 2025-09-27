import { useState, useEffect } from "react";

const ParameterFilter = ({ data, onChange }) => {
  const [lr, setLr] = useState("");
  const [epochs, setEpochs] = useState("");
  const [ps, setPs] = useState("");
  const [doParam, setDoParam] = useState("");

  const getUniqueOptions = (rows, key) => {
    if (!Array.isArray(rows) || !rows.length) return [];
    const values = rows
      .map((d) => d?.[key])
      .filter((v) => v !== undefined && v !== null && v !== "");
    const unique = Array.from(new Set(values));

    const asNums = unique.map((x) => Number(x));
    const allNums = asNums.every((n) => !Number.isNaN(n));
    return allNums
      ? unique.sort((a, b) => Number(a) - Number(b))
      : unique.sort((a, b) => String(a).localeCompare(String(b)));
  };

  const lrOptions = getUniqueOptions(data, "lr");
  const epochOptions = getUniqueOptions(data, "epochs");
  const psOptions = getUniqueOptions(data, "ps");
  const doOptions = getUniqueOptions(data, "do");

  useEffect(() => {
    onChange({ lr, epochs, ps, doParam });
  }, [lr, epochs, ps, doParam, onChange]);

  const Select = ({ label, value, onChange, options }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
      <label style={{ fontSize: "13px", color: "#6b7280" }}>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          boxSizing: "border-box",
          padding: "4px 6px",
          border: "1px solid #ccc",
          borderRadius: 6,
          fontSize: 13,
        }}
      >
        <option value="">전체</option>
        {options.map((opt) => (
          <option key={String(opt)} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div
      style={{
        border: "1px solid #d1d5db",
        borderRadius: "12px",
        padding: "1rem",
        backgroundColor: "#ffffff",
        fontSize: "14px",

        width: "100%",
        maxWidth: "720px",  
        marginRight: "auto",
        boxSizing: "border-box",

        display: "flex",
        gap: "1rem",
        flexWrap: "wrap",
      }}
    >
      <div
        style={{
          fontWeight: "600",
          marginBottom: "0.75rem",
          color: "#374151",
          width: "100%",
        }}
      >
        파라미터 필터
      </div>
      <Select label="Learning Rate" value={lr} onChange={setLr} options={lrOptions} />
      <Select label="Epochs" value={epochs} onChange={setEpochs} options={epochOptions} />
      <Select label="PS" value={ps} onChange={setPs} options={psOptions} />
      <Select label="Dropout" value={doParam} onChange={setDoParam} options={doOptions} />
    </div>
  );
};

export default ParameterFilter;
