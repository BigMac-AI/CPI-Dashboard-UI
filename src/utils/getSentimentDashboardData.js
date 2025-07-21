import { parseISO, format, isValid } from "date-fns";

/**
 * 감성 분석 대시보드 전처리 유틸
 * @param {Array} sentimentRaw - 감성 원본 데이터
 * @param {Object} cpiRaw - CPI 원본 데이터 (category → records)
 * @param {string} selectedMonth - 기준 월 (e.g., "2006-01-01")
 */
export function getSentimentDashboardData(sentimentRaw, cpiRaw, selectedMonth) {
  // YYYY-MM 형식 안전하게 뽑는 함수
  const getYM = (d) => {
    if (!d) return "";
    let str = typeof d === "string" ? d.split(" ")[0] : d.toString().split(" ")[0];
    const date = parseISO(str);
    return isValid(date) ? format(date, "yyyy-MM") : "";
  };

  const targetYM = getYM(selectedMonth);
  const allMonths = sentimentRaw.map((d) => getYM(d.date));
  const idx = allMonths.indexOf(targetYM);
  const monthList = allMonths.slice(Math.max(0, idx - 5), idx + 6);

  // 📊 감성 데이터 필터링
  const filteredSentiment = sentimentRaw.filter((d) =>
    monthList.includes(getYM(d.date))
  );

  // 📈 CPI 데이터 정리
  const cpiMap = {};
  (cpiRaw["CPI"] || []).forEach((r) => {
    const ym = getYM(r.날짜);
    if (ym && !cpiMap[ym]) {
      cpiMap[ym] = r;
    }
  });

  const cpiActual = monthList.map((m) =>
    cpiMap[m] && typeof cpiMap[m].값 === "number" ? cpiMap[m].값 : null
  );
  const cpiPredicted = monthList.map((m) =>
    cpiMap[m] && typeof cpiMap[m].예측값 === "number" ? cpiMap[m].예측값 : null
  );

  // 📌 선택 월의 KPI 카드용 감성 데이터
  const current = sentimentRaw.find((d) => getYM(d.date) === targetYM) || {};

  return {
    monthList,
    sentiment_trend: {
      dates: monthList,
      scores: filteredSentiment.map((d) => d.sentiment_score),
    },
    stacked_bar: {
      positive_ratio: filteredSentiment.map((d) => d.positive_ratio),
      negative_ratio: filteredSentiment.map((d) => d.negative_ratio),
      news_count: filteredSentiment.map((d) => d.news_count),
      N_pos: filteredSentiment.map((d) => d.N_pos),
      N_neg: filteredSentiment.map((d) => d.N_neg),
    },
    kpi_summary: {
      date: targetYM,
      news_count: current.news_count || 0,
      sentiment_score: current.sentiment_score || 0,
      positive_ratio: current.positive_ratio || 0,
      negative_ratio: current.negative_ratio || 0,
      N_pos: current.N_pos || 0,
      N_neg: current.N_neg || 0,
    },
    donut_data: {
      labels: ["긍정 뉴스", "부정 뉴스"],
      values: [current.N_pos || 0, current.N_neg || 0],
    },
    cpiActual,
    cpiPredicted,
  };
}
