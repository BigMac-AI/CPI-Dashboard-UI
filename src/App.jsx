import React, { useState, useEffect } from "react";
import Papa from "papaparse";

import CategoryFilter from "./components/CategoryFilter";
import DateRangePicker from "./components/DateRangePicker";
import CPIChart from "./components/CPIChart";
import CategoryChart from "./components/CategoryChart";
import CPITableCPI from "./components/CPITableCPI";
import CPITableCategory from "./components/CPITableCategory";

import { getSentimentDashboardData } from "./utils/getSentimentDashboardData";

import MonthSelector from "./components/sentiment/MonthSelector";
import SentimentTrendLine from "./components/sentiment/SentimentTrendLine";
import RatioBarChart from "./components/sentiment/RatioBarChart";
import KpiSummaryCards from "./components/sentiment/KpiSummaryCards";
import SentimentDonutChart from "./components/sentiment/SentimentDonutChart";
import RealTimeAnalysis from "./components/sentiment/RealTimeAnalysis";


import ParameterFilter from "./components/ParameterFilter";
import LassoSentimentFilter from "./components/LassoSentimentFilter";

export default function App() {
  const [categories, setCategories] = useState([]); 
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });
  const [viewMode, setViewMode] = useState("cpi");
  const [selectedMonth, setSelectedMonth] = useState("");

  const [cpiRows, setCpiRows] = useState([]);
  const [allDates, setAllDates] = useState([]);

  const [params, setParams] = useState({
    lr: "",
    epochs: "",
    ps: "",
    doParam: "",
  });

  const [mode, setMode] = useState("");

  const [sentimentData, setSentimentData] = useState([]);

  useEffect(() => {
    setCategories([]);
  }, [viewMode]);

  const handleCategoryChange = (val) => {
    setCategories(val ? [val] : []);
  };

  useEffect(() => {
    Papa.parse("/data/cpi_firstday_with_actual.csv", {
      header: true,
      download: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),
      complete: (result) => {
        const rows = result.data.filter((r) => r.date);

        console.log("🔥 CSV 헤더:", Object.keys(rows[0] || {}));
        console.log("🔥 첫 데이터:", rows[0]);

        setCpiRows(rows);

        const dates = Array.from(new Set(rows.map((d) => d.date))).sort();
        setAllDates(dates);

        if (dates.length > 0 && (!dateRange.startDate || !dateRange.endDate)) {
          setDateRange({ startDate: dates[0], endDate: dates[dates.length - 1] });
          setSelectedMonth(dates[0]);
        }
        console.log("✅ CSV 로드 완료:", rows.length, "행");
      },
    });
  }, [dateRange.endDate, dateRange.startDate]);

  useEffect(() => {
    fetch("/data/sentimentData.json")
      .then((res) => res.json())
      .then((json) => setSentimentData(json))
      .catch((err) => console.error("❌ 감성 데이터 로드 실패", err));
  }, []);

  const sentimentDashboard = getSentimentDashboardData(
    sentimentData,
    [],
    selectedMonth
  );

  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        fontFamily: "Pretendard, sans-serif",
        boxSizing: "border-box",
        overflowX: "hidden",
        maxWidth: "100%",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          textAlign: "right",
          padding: "0.25rem 0.3rem",
          backgroundColor: "#f9fafb",
        }}
      >
        {["cpi", "category", "sentiment"].map((mode) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            style={{
              marginRight: mode !== "sentiment" ? "0.25rem" : 0,
              backgroundColor: viewMode === mode ? "#3b82f6" : "#e5e7eb",
              color: viewMode === mode ? "#fff" : "#000",
              fontSize: "12px",
              padding: "0.3rem 2.0rem",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            {mode === "cpi"
              ? "CPI 전용 차트"
              : mode === "category"
              ? "품목별 차트"
              : "감성 분석"}
          </button>
        ))}
        <a
          href="https://10455cd1bb94ce6526.gradio.live"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-block",
            marginRight: "0.25rem",
            marginLeft: "0.25rem",
            backgroundColor: "#e5e7eb",
            color: "#000",
            fontSize: "12px",
            padding: "0.3rem 2.0rem",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            textDecoration: "none",
            verticalAlign: "middle",
            lineHeight: "1.5",
          }}
        >
          챗봇
        </a>
      </div>

      <div
        style={{
          marginTop: "0",
          border: "1px solid #d1d5db",
          borderRadius: "12px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            height: viewMode === "sentiment" ? "calc(100vh - 48px)" : "auto",
          }}
        >
          <div
            style={{
              flex: 3,
              display: "flex",
              flexDirection: "column",
              padding: "1rem",
              gap: "1rem",
              borderRight: "1px solid #d1d5db",
            }}
          >
            {viewMode === "cpi" && (
              <div style={{ height: "42%" }}>
                <CPIChart
                  data={cpiRows}
                  startDate={dateRange.startDate}
                  endDate={dateRange.endDate}
                  {...params}
                  mode={mode}  
                />
              </div>
            )}

            {viewMode === "category" && (
              <div style={{ height: "42%" }}>
                <CategoryChart categories={categories} {...dateRange} />
              </div>
            )}

            {viewMode === "sentiment" && sentimentDashboard && (
              <>
              <div style={{ 
                flex: 1,
                minHeight: 0,
                display: 'flex',
                flexDirection: 'column'
              }}>
                <RealTimeAnalysis />
              </div>
              
              <div style={{
                height: '1px',
                backgroundColor: '#000000',
                width: '100%',
                flexShrink: 0,
              }} />
            </>
            )}
          </div>

          <div
            style={{
              flex: 1.3,
              display: "flex",
              flexDirection: "column",
              padding: "1rem",
              gap: "1rem",
              backgroundColor: "#fff",
            }}
          >
            {viewMode === "cpi" && (
              <>
                <DateRangePicker
                  {...dateRange}
                  onChange={setDateRange}
                  allDates={allDates}
                />
                <ParameterFilter data={cpiRows} onChange={setParams} />
                <LassoSentimentFilter onChange={setMode} /> 
              </>
            )}

            {viewMode === "category" && (
              <>
                <DateRangePicker
                  {...dateRange}
                  onChange={setDateRange}
                  allDates={allDates}
                />
                <CategoryFilter
                  selected={categories[0] || null}
                  onChange={handleCategoryChange}
                  onReset={() => setCategories([])}
                />
              </>
            )}

            {viewMode === "sentiment" &&
              sentimentData.length > 0 &&
              sentimentDashboard.kpi_summary && (
                <>
                  <MonthSelector
                    selected={selectedMonth}
                    onChange={setSelectedMonth}
                    availableMonths={sentimentData.map((d) =>
                      d.date.slice(0, 7)
                    )}
                  />
                  <KpiSummaryCards {...sentimentDashboard.kpi_summary} />
                  <SentimentDonutChart
                    N_pos={sentimentDashboard.kpi_summary.N_pos}
                    N_neg={sentimentDashboard.kpi_summary.N_neg}
                  />
                </>
              )}
          </div>
        </div>

        {viewMode !== "sentiment" && (
          <div
            style={{ height: "1px", backgroundColor: "#e5e7eb", width: "100%" }}
          />
        )}

        {viewMode !== "sentiment" && (
          <div
            style={{
              backgroundColor: "#fff",
              padding: "1rem 1rem",
              overflowX: "auto",
              boxSizing: "border-box",
              width: "100%",
            }}
          >
            {viewMode === "cpi" && (
              <CPITableCPI
                data={cpiRows}
                {...dateRange}
                {...params}
                mode={mode} 
              />
            )}
            {viewMode === "category" && (
              <CPITableCategory categories={categories} {...dateRange} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
