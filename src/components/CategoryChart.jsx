import React from "react";
import ReactECharts from "echarts-for-react";
import cpiData from "../data/parsedCPIData_with_full_predictions.json";

const palette = [
  "#3b82f6",
  "#ef4444",
  "#facc15",
  "#10b981",
  "#8b5cf6",
  "#ec4899",
  "#f97316",
  "#14b8a6",
];

const CategoryChart = ({
  categories = [],
  startDate,
  endDate,
}) => {
  // X축 날짜
  const dates = cpiData["CPI"]
    .map((r) => r.날짜)
    .filter(
      (d) => d >= startDate && d <= endDate
    );

  // 선택된 카테고리별 series 생성
  const series = categories.map((cat, idx) => {
    const recs = cpiData[cat] || [];
    const data = dates.map((date) => {
      const item = recs.find((r) => r.날짜 === date);
      return item?.값 ?? null;
    });
    return {
      name: cat,
      type: "line",
      data,
      smooth: true,
      symbol: "circle",
      symbolSize: 8,
      lineStyle: { width: 3 },
    };
  });

  const option = categories.length
    ? {
        color: palette,
        tooltip: { trigger: "axis" },
        legend: {
          top: 10,
          left: "center",
          type: "scroll",
          orient: "horizontal",
        },
        grid: {
          left: 40,
          right: 20,
          top: 100,
          bottom: 60,
        },
        xAxis: {
          type: "category",
          data: dates,
          axisLabel: { rotate: 45, fontSize: 11 },
        },
        yAxis: { type: "value", axisLabel: { fontSize: 11 } },
        series,
      }
    : {
        title: {
          text: "항목을 선택해주세요",
          left: "center",
          top: "middle",
          textStyle: {
            fontSize: 14,
            color: "#9ca3af",
          },
        },
        xAxis: {
          type: "category",
          data: [],
          axisLine: { lineStyle: { color: "#d1d5db" } },
        },
        yAxis: {
          type: "value",
          axisLine: { lineStyle: { color: "#d1d5db" } },
        },
        series: [],
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
        minHeight: "420px",  // 높이 조금 늘림
        display: "flex",
        flexDirection: "column",
      }}
    >
      <h3
        style={{
          fontSize: "18px",
          fontWeight: "600",
          marginBottom: "16px",
          color: "#111827",
          textAlign: "center",
        }}
      >
        {categories.length
          ? "품목별 추세 차트"
          : "품목 추세 차트"}
      </h3>
      <ReactECharts
        option={option}
        notMerge={true}
        style={{ width: "100%", height: 350 }}
      />
    </div>
  );
};

export default CategoryChart;
