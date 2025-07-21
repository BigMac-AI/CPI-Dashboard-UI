import ReactECharts from "echarts-for-react";
import cpiData from "../data/parsedCPIData_with_full_predictions.json";

const CPIOnlyChart = ({ startDate, endDate }) => {
  const records = cpiData["CPI"];

  const allDates = records
    .map((r) => r.날짜)
    .filter((d) => d >= startDate && d <= endDate);

  const actual = allDates.map((date) =>
    records.find((r) => r.날짜 === date)?.값 ?? null
  );
  const predicted = allDates.map((date) =>
    records.find((r) => r.날짜 === date)?.예측값 ?? null
  );

  if (actual.every(v => v === null) && predicted.every(v => v === null)) {
    return (
      <div style={{ padding: 16, textAlign: "center", color: "#6b7280" }}>
        선택한 기간에 표시할 수 있는 데이터가 없습니다.
      </div>
    );
  }

  const combined = [...actual, ...predicted].filter(v => typeof v === "number");
  const minVal = Math.min(...combined);
  const maxVal = Math.max(...combined);

  let computedInterval = (maxVal - minVal) / 5;
  computedInterval = Math.ceil(computedInterval * 10) / 10; // 소수점 반올림
  const interval = Math.max(1, computedInterval);

  const adjustedMin = Math.floor(minVal / interval) * interval;
  const adjustedMax = Math.ceil(maxVal / interval) * interval;

  const actualColor = "#2563eb";
  const predictedColor = "#ef4444";

  const option = {
    animation: false, // ✅ 이동 애니메이션 제거
    tooltip: {
      trigger: "axis",
      backgroundColor: "#fff",
      borderColor: "#d1d5db",
      borderWidth: 1,
      textStyle: { color: "#111827" }
    },
    legend: {
      top: 10,
      left: "center",
      textStyle: { fontWeight: "bold" }
    },
    grid: { left: 50, right: 30, top: 80, bottom: 60 },
    xAxis: {
      type: "category",
      data: allDates,
      axisLabel: { rotate: 45, fontSize: 11 },
      axisLine: { lineStyle: { color: "#9ca3af" } }
    },
    yAxis: {
      type: "value",
      min: adjustedMin,
      max: adjustedMax,
      interval: interval,
      axisLabel: { formatter: "{value}", fontSize: 11 },
      axisLine: { lineStyle: { color: "#9ca3af" } }
    },
    series: [
      {
        name: "CPI (실제)",
        type: "line",
        data: actual,
        smooth: true,
        symbol: "circle",
        symbolSize: 6,
        lineStyle: { width: 3, color: actualColor },
        itemStyle: { color: actualColor }
      },
      {
        name: "CPI (예측)",
        type: "line",
        data: predicted,
        smooth: true,
        symbol: "circle",
        symbolSize: 6,
        lineStyle: {
          type: "dashed",
          width: 2,
          color: predictedColor
        },
        itemStyle: { color: predictedColor }
        // ✅ markPoint 제거
      }
    ]
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
        flexDirection: "column"
      }}
    >
      <h3
        style={{
          fontSize: "18px",
          fontWeight: "600",
          marginBottom: "16px",
          color: "#111827",
          textAlign: "center"
        }}
      >
        CPI 추세 차트
      </h3>

      <ReactECharts
        option={option}
        notMerge={true}
        style={{ width: "100%", height: 280 }}
      />
    </div>
  );
};

export default CPIOnlyChart;
