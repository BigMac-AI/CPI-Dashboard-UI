const DateRangePicker = ({ startDate, endDate, onChange, allDates }) => {
  const safeStart = startDate || allDates?.[0] || "";
  const safeEnd = endDate || allDates?.[allDates.length - 1] || "";

  return (
    <div
      style={{
        border: "1px solid #d1d5db",
        borderRadius: "12px",
        padding: "1rem",
        backgroundColor: "#ffffff",
        fontSize: "14px",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{ fontWeight: "600", marginBottom: "0.75rem", color: "#374151" }}
      >
        날짜 슬라이서
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <label style={{ fontSize: "13px", color: "#6b7280" }}>시작</label>
          <input
            type="date"
            value={safeStart}
            min={allDates?.[0]}
            max={safeEnd}
            onChange={(e) =>
              onChange({ startDate: e.target.value, endDate: safeEnd })
            }
            style={{
              padding: "6px 10px",
              border: "1px solid #ccc",
              borderRadius: "6px",
              fontSize: "13px",
            }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <label style={{ fontSize: "13px", color: "#6b7280" }}>종료</label>
          <input
            type="date"
            value={safeEnd}
            min={safeStart}
            max={allDates?.[allDates.length - 1]}
            onChange={(e) =>
              onChange({ startDate: safeStart, endDate: e.target.value })
            }
            style={{
              padding: "6px 10px",
              border: "1px solid #ccc",
              borderRadius: "6px",
              fontSize: "13px",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default DateRangePicker;
