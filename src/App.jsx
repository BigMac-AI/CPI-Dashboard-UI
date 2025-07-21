import React, { useState, useEffect } from "react";

// cpi
import CPIOnlyChart from "./components/CPIOnlyChart";
import CPITableCPI from "./components/CPITableCPI";
import DateRangePicker from "./components/DateRangePicker";

// category
import CategoryChart from "./components/CategoryChart";
import CPITableCategory from "./components/CPITableCategory";
import CategoryFilter from "./components/CategoryFilter";

// sentiment
import MonthSelector from "./components/sentiment/MonthSelector";
import SentimentTrendLine from "./components/sentiment/SentimentTrendLine";
import RatioBarChart from "./components/sentiment/RatioBarChart";
import KpiSummaryCards from "./components/sentiment/KpiSummaryCards";
import SentimentDonutChart from "./components/sentiment/SentimentDonutChart";

import cpiData from "./data/parsedCPIData_with_full_predictions.json";
import sentimentData from "./data/sentimentData.json";
import { getSentimentDashboardData } from "./utils/getSentimentDashboardData";

export default function App() {
  const [categories, setCategories] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: "2023-03-01",
    endDate: "2024-03-01",
  });
  const [viewMode, setViewMode] = useState("cpi");
  const [selectedMonth, setSelectedMonth] = useState("2006-01-01");

  useEffect(() => {
    setCategories([]); // 뷰 전환 시 선택 초기화
  }, [viewMode]);

  const handleCategoryChange = (newCategories) => {
    if (viewMode === "category") {
      setCategories(newCategories);
    }
  };

  const sentimentDashboard = getSentimentDashboardData(
    sentimentData,
    cpiData,
    selectedMonth
  );

  const cpiDates = cpiData["CPI"].map((r) => r.날짜).sort();
  const minCpiDate = cpiDates[0];
  const maxCpiDate = cpiDates[cpiDates.length - 1];

  const visiblePredictions = cpiData["CPI"]
    .filter(
      (r) =>
        r.날짜 >= dateRange.startDate &&
        r.날짜 <= dateRange.endDate &&
        typeof r.예측값 === "number"
    )
    .map((r) => ({
      날짜: r.날짜,
      예측값: r.예측값.toFixed(2),
    }));

  const half = Math.ceil(visiblePredictions.length / 2);
  const leftCol = visiblePredictions.slice(0, half);
  const rightCol = visiblePredictions.slice(half);

  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        fontFamily: "Pretendard, sans-serif",
      }}
    >
      {/* 상단 탭 */}
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
              backgroundColor:
                viewMode === mode ? "#3b82f6" : "#e5e7eb",
              color: viewMode === mode ? "#fff" : "#000",
              fontSize: "12px",
              padding: "0.3rem 3.0rem",
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
      </div>

      {/* 본문 */}
      <div
        style={{
          border: "1px solid #d1d5db",
          borderRadius: "12px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            height:
              viewMode === "sentiment"
                ? "calc(100vh - 48px)"
                : "auto",
          }}
        >
          {/* 왼쪽 */}
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
                <CPIOnlyChart {...dateRange} />
              </div>
            )}
            {viewMode === "category" && (
              <CategoryChart
                categories={categories}
                {...dateRange}
              />
            )}
            {viewMode === "sentiment" && (
              <>
                <SentimentTrendLine
                  months={sentimentDashboard.monthList}
                  sentiment={
                    sentimentDashboard.sentiment_trend.scores
                  }
                  cpiActual={sentimentDashboard.cpiActual}
                  cpiPredicted={
                    sentimentDashboard.cpiPredicted
                  }
                />
                <RatioBarChart
                  months={sentimentDashboard.monthList}
                  positive={
                    sentimentDashboard.stacked_bar.positive_ratio
                  }
                  negative={
                    sentimentDashboard.stacked_bar.negative_ratio
                  }
                  newsCount={
                    sentimentDashboard.stacked_bar.news_count
                  }
                  N_pos={
                    sentimentDashboard.stacked_bar.N_pos
                  }
                  N_neg={
                    sentimentDashboard.stacked_bar.N_neg
                  }
                />
              </>
            )}
          </div>

          {/* 오른쪽 */}
          <div
            style={{
              flex: 1.1,
              display: "flex",
              flexDirection: "column",
              padding: "1rem",
              gap: "1rem",
              backgroundColor: "#fff",
            }}
          >
            {(viewMode === "cpi" ||
              viewMode === "category") && (
              <DateRangePicker
                {...dateRange}
                onChange={setDateRange}
                minDate={minCpiDate}
                maxDate={maxCpiDate}
              />
            )}

            {viewMode === "cpi" && (
              <div
                style={{
                  flex: 1,
                  backgroundColor: "#ecfdf5",
                  border: "1px solid #d1fae5",
                  borderRadius: "8px",
                  padding: "1rem",
                  fontSize: "13px",
                  color: "#065f46",
                  display: "flex",
                  flexDirection: "column",
                  overflowY: "auto",
                }}
              >
                <div
                  style={{
                    fontWeight: "bold",
                    textAlign: "center",
                    fontSize: "15px",
                    marginBottom: "0.75rem",
                  }}
                >
                  예측값
                </div>
                {visiblePredictions.length > 0 ? (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      gap: "4rem",
                    }}
                  >
                    {[leftCol, rightCol].map(
                      (col, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.4rem",
                          }}
                        >
                          {col.map((item) => (
                            <div key={item.날짜}>
                              {item.날짜}: {item.예측값}
                            </div>
                          ))}
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <div
                    style={{
                      textAlign: "center",
                      color: "#6b7280",
                    }}
                  >
                    예측값이 없습니다.
                  </div>
                )}
              </div>
            )}

            {viewMode === "category" && (
              <div
                style={{
                  maxHeight: "450px",
                  overflowY: "auto",
                  paddingRight: "0.25rem",
                }}
              >
                <CategoryFilter
                  selected={categories}
                  onChange={handleCategoryChange}
                  onReset={() => setCategories([])}
                />
              </div>
            )}

            {viewMode === "sentiment" && (
              <>
                <MonthSelector
                  selectedMonth={selectedMonth}
                  onChange={setSelectedMonth}
                  availableMonths={
                    sentimentDashboard.monthList
                  }
                />
                <KpiSummaryCards
                  {...sentimentDashboard.kpi_summary}
                />
                <SentimentDonutChart
                  N_pos={
                    sentimentDashboard.kpi_summary.N_pos
                  }
                  N_neg={
                    sentimentDashboard.kpi_summary.N_neg
                  }
                />
              </>
            )}
          </div>
        </div>

        {/* 하단 테이블 */}
        {viewMode === "cpi" && (
          <div
            style={{
              padding: "1rem",
              borderTop: "1px solid #e5e7eb",
            }}
          >
            <CPITableCPI {...dateRange} />
          </div>
        )}
        {viewMode === "category" &&
          categories.length > 0 && (
            <div
              style={{
                padding: "1rem",
                borderTop: "1px solid #e5e7eb",
              }}
            >
              <CPITableCategory
                categories={categories}
                {...dateRange}
              />
            </div>
          )}
      </div>
    </div>
  );
}
