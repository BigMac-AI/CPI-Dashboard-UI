import React, { useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";
import Papa from "papaparse";

const CATEGORY_LABELS = {
  "Actual_Food and non-alcoholic beverages": "식료품 및 비알코올 음료",
  "Actual_Miscellaneous goods and services": "기타 상품 및 서비스",
  "Actual_Actual rentals for housing": "실제 주거 임대료",
  "Actual_Maintenance and repair of the dwelling": "주택 유지 및 보수",
};

const CategoryChart = ({ categories = [], startDate, endDate }) => {
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

  const category = categories[0] || null;
  const actualCol = category;
  const predictedCol = category
    ? category.replace("Actual_", "PredictedSent_")
    : null;
  const optimalCol = category
    ? category.replace("Actual_", "PredictedNoSent_")
    : null;

  const filtered = rows.filter((r) => {
    const d = new Date(r.Date);
    if (isNaN(d)) return false;
    return (
      (!startDate || !startDate.trim() || d >= new Date(startDate)) &&
      (!endDate || !endDate.trim() || d <= new Date(endDate))
    );
  });

  const allDates = filtered.map((r) => r.Date);

  const getVals = (col) =>
    filtered.map((r) =>
      r[col] !== undefined && r[col] !== "" ? Number(r[col]) : null
    );

  const actual = category ? getVals(actualCol) : [];
  const predicted = category ? getVals(predictedCol) : [];
  const optimal = category ? getVals(optimalCol) : [];

  const option = {
    tooltip: { trigger: "axis" },
    legend: {
      top: 10,
      left: "center",
      data: ["실제값", "예측값(감성분석O)", "예측값(감성분석X)"],
    },
    grid: { left: 40, right: 20, top: 80, bottom: 40 },
    xAxis: {
      type: "category",
      data: category ? (allDates.length ? allDates : [""]) : [],
      axisLabel: {
        fontSize: 10,
        rotate: 45,
        formatter: (value) => (value ? value.slice(0, 7) : ""),
      },
      show: !!category,
    },
    yAxis: { type: "value", scale: true, show: !!category },
    dataZoom: category
      ? [
          {
            type: "inside",
            zoomOnMouseWheel: true,
            moveOnMouseMove: true,
            moveOnMouseWheel: true,
          },
          { type: "inside", orient: "horizontal" },
        ]
      : [],
    series: [
      {
        name: "실제값",
        type: "line",
        data: category && allDates.length ? actual : [],
        smooth: true,
        symbol: "circle",
        symbolSize: 4,
        lineStyle: { width: 2, color: "#2563eb" },
        itemStyle: { color: "#2563eb" },
      },
      {
        name: "예측값(감성분석O)",
        type: "line",
        data: category && allDates.length ? predicted : [],
        smooth: true,
        symbol: "circle",
        symbolSize: 4,
        lineStyle: { width: 2, color: "#ef4444" },
        itemStyle: { color: "#ef4444" },
      },
      {
        name: "예측값(감성분석X)",
        type: "line",
        data: category && allDates.length ? optimal : [],
        smooth: true,
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
        {category ? CATEGORY_LABELS[category] || category : "품목별 추세 차트"}
      </h3>

      <ReactECharts
        option={option}
        notMerge={true}
        style={{ width: "100%", height: 320 }}
      />
    </div>
  );
};

export default CategoryChart;
