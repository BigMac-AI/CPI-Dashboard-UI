import React from "react";

const CPITableCPI = ({
  data,
  startDate,
  endDate,
  lr,
  epochs,
  ps,
  doParam,
  mode,
}) => {
  if (!data || !data.length) {
    return <div style={{ padding: 16 }}>Loading CPI data...</div>;
  }

  const isComplete = lr && epochs && ps && doParam;

  const baseFiltered = data.filter(
    (r) => r.date >= startDate && r.date <= endDate
  );
  const allDates = Array.from(new Set(baseFiltered.map((r) => r.date))).sort();

  const getUniqueByDate = (rows, key) => {
    const seen = new Set();
    const result = [];
    rows.forEach((r) => {
      const v = r[key];
      if (!seen.has(r.date) && v !== null && v !== undefined && v !== "") {
        seen.add(r.date);
        result.push({ date: r.date, value: Number(v) });
      }
    });
    return result.sort((a, b) => (a.date > b.date ? 1 : -1));
  };

  const actualPoints = getUniqueByDate(baseFiltered, "actual");
  const actualRow = allDates.map(
    (d) => actualPoints.find((p) => p.date === d)?.value?.toFixed(2) ?? "-"
  );

  let predictedRow = new Array(allDates.length).fill("-");
  if (isComplete && mode) {
    const paramFiltered = data.filter(
      (r) =>
        r.lr === Number(lr) &&
        r.epochs === Number(epochs) &&
        r.ps === Number(ps) &&
        r.do === Number(doParam) &&
        r.date >= startDate &&
        r.date <= endDate &&
        r[mode] !== null &&
        r[mode] !== undefined &&
        r[mode] !== ""
    );

    const predictedPoints = getUniqueByDate(paramFiltered, mode);
    predictedRow = allDates.map(
      (d) => predictedPoints.find((p) => p.date === d)?.value?.toFixed(2) ?? "-"
    );
  }

  const optimalParams = {
    Nonlasso_Nonsenti: { lr: 0.0005, epochs: 100, ps: 90, do: 0.1 },
    Lasso_Nonsenti:    { lr: 0.0005, epochs: 100, ps: 30, do: 0.1 },
    Nonlasso_Senti:    { lr: 0.001,  epochs: 75,  ps: 90, do: 0.1 },
    Lasso_Senti:       { lr: 0.0005, epochs: 75,  ps: 30, do: 0.1 },
  };

  let optimalRow = new Array(allDates.length).fill("-");
  if (mode && optimalParams[mode]) {
    const opt = optimalParams[mode];
    const optimalFiltered = data.filter(
      (r) =>
        r.lr === opt.lr &&
        r.epochs === opt.epochs &&
        r.ps === opt.ps &&
        r.do === opt.do &&
        r.date >= startDate &&
        r.date <= endDate &&
        r[mode] !== null &&
        r[mode] !== undefined &&
        r[mode] !== ""
    );

    const optimalPoints = getUniqueByDate(optimalFiltered, mode);
    optimalRow = allDates.map(
      (d) => optimalPoints.find((p) => p.date === d)?.value?.toFixed(2) ?? "-"
    );
  }

  const rateRow = allDates.map((d, i) => {
    const act = Number(actualRow[i]);
    const pred = Number(predictedRow[i]);
    if (!isNaN(act) && !isNaN(pred) && act !== 0) {
      return `${(((pred - act) / act) * 100).toFixed(1)}%`;
    }
    return "-";
  });

  const optimalRateRow = allDates.map((d, i) => {
    const act = Number(actualRow[i]);
    const opt = Number(optimalRow[i]);
    if (!isNaN(act) && !isNaN(opt) && act !== 0) {
      return `${(((opt - act) / act) * 100).toFixed(1)}%`;
    }
    return "-";
  });

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
        CPI 상세 수치
      </h3>
      <div style={{ overflowX: "auto", width: "100%" }}>
        <div style={{ maxHeight: "125px", overflowY: "auto" }}>
          <table
            style={{
              tableLayout: "fixed",
              borderCollapse: "collapse",
              minWidth: `${allDates.length * 140 + 150}px`,
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
                {allDates.map((d, i) => (
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
                ["예측값", predictedRow],
                ["최적 예측값", optimalRow],
                ["예측률", rateRow],
                ["최적 예측률", optimalRateRow],
              ].map(([label, row]) => (
                <tr key={label}>
                  <td
                    style={{
                      padding: "4px 6px",
                      fontWeight: 500,
                      whiteSpace: "nowrap",
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

export default CPITableCPI;
