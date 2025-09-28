import React from "react";
import ReactECharts from "echarts-for-react";

const CPIChart = ({
  data,
  startDate,
  endDate,
  lr,
  epochs,
  ps,
  doParam,
  mode,
}) => {
  const isComplete = lr && epochs && ps && doParam;

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

  const baseFiltered = data.filter(
    (r) => r.date >= startDate && r.date <= endDate
  );
  const allDates = Array.from(new Set(baseFiltered.map((r) => r.date))).sort();

  const actualPoints = getUniqueByDate(baseFiltered, "actual");
  const actual = allDates.map(
    (d) => actualPoints.find((p) => p.date === d)?.value ?? null
  );

  let predicted = new Array(allDates.length).fill(null);
  if (isComplete && mode) {
    const paramFiltered = data.filter(
      (r) =>
        r.lr === Number(lr) &&
        r.epochs === Number(epochs) &&
        r.ps === Number(ps) &&
        r.do === Number(doParam) &&
        r.date >= startDate &&
        r.date <= endDate
    );
    const predictedPoints = getUniqueByDate(paramFiltered, mode);
    predicted = allDates.map(
      (d) => predictedPoints.find((p) => p.date === d)?.value ?? null
    );
  }

  const optimalParams = {
    Nonlasso_Nonsenti: { lr: 0.0005, epochs: 100, ps: 90, do: 0.1 },
    Lasso_Nonsenti:    { lr: 0.0005, epochs: 100, ps: 30, do: 0.1 },
    Nonlasso_Senti:    { lr: 0.001,  epochs: 75,  ps: 90, do: 0.1 },
    Lasso_Senti:       { lr: 0.0005, epochs: 75,  ps: 30, do: 0.1 },
  };

  let optimal = new Array(allDates.length).fill(null);
  if (mode && optimalParams[mode]) {
    const opt = optimalParams[mode];
    const optimalFiltered = data.filter(
      (r) =>
        r.lr === opt.lr &&
        r.epochs === opt.epochs &&
        r.ps === opt.ps &&
        r.do === opt.do &&
        r.date >= startDate &&
        r.date <= endDate
    );
    const optimalPoints = getUniqueByDate(optimalFiltered, mode);
    optimal = allDates.map(
      (d) => optimalPoints.find((p) => p.date === d)?.value ?? null
    );
  }

  const option = {
    tooltip: {
      trigger: "axis",
      backgroundColor: "#fff",
      borderColor: "#e5e7eb",
      borderWidth: 1,
      textStyle: { color: "#111827", fontSize: 12 },
      padding: 10,
      extraCssText:
        "box-shadow:0 2px 8px rgba(0,0,0,0.15); border-radius:8px;",
      formatter: (params) => {
        const date = params[0]?.axisValue || "";
        let html = `<div style="font-weight:600; margin-bottom:6px; font-size:13px;">${date}</div>`;
        params.forEach((p) => {
          const color = p.color;
          let extra = "";

          if (p.seriesName === "예측값" && isComplete) {
            extra = `<div style="font-size:11px; color:#6b7280;">
                      lr=${lr}, epochs=${epochs}, ps=${ps}, dropout=${doParam}
                     </div>`;
          }
          if (p.seriesName === "최적 예측값" && mode && optimalParams[mode]) {
            const opt = optimalParams[mode];
            extra = `<div style="font-size:11px; color:#6b7280;">
                      lr=${opt.lr}, epochs=${opt.epochs}, ps=${opt.ps}, dropout=${opt.do}
                     </div>`;
          }

          html += `
            <div style="display:flex; align-items:center; margin-bottom:4px;">
              <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:${color}; margin-right:6px;"></span>
              <span style="flex:1; font-size:12px;">${p.seriesName}</span>
              <span style="font-weight:600; font-size:12px; margin-left:8px;">${p.value ?? "-"}</span>
            </div>
            ${extra}
          `;
        });
        return html;
      },
    },
    legend: {
      top: 10,
      left: "center",
      data: ["실제값", "예측값", "최적 예측값"],
    },
    grid: { left: 40, right: 20, top: 80, bottom: 40 },
    xAxis: {
      type: "category",
      data: allDates.length ? allDates : [""],
      axisLabel: {
        fontSize: 10,
        rotate: 45,
        formatter: (value) => (value ? value.slice(0, 7) : ""),
      },
    },
    yAxis: { type: "value", scale: true },
    dataZoom: [
      { type: "inside", zoomOnMouseWheel: true, moveOnMouseMove: true, moveOnMouseWheel: true },
      { type: "inside", orient: "horizontal" },
    ],
    series: [
      {
        name: "실제값",
        type: "line",
        data: actual,
        smooth: false,
        connectNulls: false,
        symbol: "circle",
        symbolSize: 4,
        lineStyle: { width: 2, color: "#2563eb" },
        itemStyle: { color: "#2563eb" },
      },
      {
        name: "예측값",
        type: "line",
        data: predicted,
        smooth: false,
        connectNulls: false,
        symbol: "circle",
        symbolSize: 4,
        lineStyle: { width: 2, color: "#ef4444" },
        itemStyle: { color: "#ef4444" },
      },
      {
        name: "최적 예측값",
        type: "line",
        data: optimal,
        smooth: false,
        connectNulls: false,
        symbol: "circle",
        symbolSize: 4,
        lineStyle: { width: 2, color: "#10b981" },
        itemStyle: { color: "#10b981" },
      },
    ],
  };

  return (
    <div
      style={{
        backgroundColor: "white",
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
        padding: "5px",
        marginTop: "2.5px",
        marginBottom: "2.5px",
        minHeight: "400px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <h3
        style={{
          fontSize: "15px",
          fontWeight: "600",
          marginBottom: "10px",
          color: "#111827",
          textAlign: "center",
        }}
      >
        CPI 추세 차트
      </h3>

      <ReactECharts
        option={option}
        notMerge={true}
        style={{ width: "100%", height: 320 }}
      />
    </div>
  );
};

export default CPIChart;
