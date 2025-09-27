import React, { useState } from "react";

const styles = {
  container: {
    padding: '16px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
  },
  title: {
    fontSize: "20px",
    fontWeight: "700",
    marginTop: 0,
    marginBottom: "24px",
    color: '#111827'
  },
  searchInputContainer: {
    display: "flex",
    gap: "8px",
    marginBottom: "20px"
  },
  input: {
    flex: 1,
    padding: "10px 12px",
    borderRadius: "6px",
    border: "1px solid #d1d5db",
    fontSize: '14px',
  },
  button: {
    padding: "10px 20px",
    borderRadius: "6px",
    border: "none",
    backgroundColor: "#3b82f6",
    color: "white",
    cursor: "pointer",
    fontWeight: '600',
    fontSize: '14px',
    transition: 'background-color 0.2s',
  },
  backButton: {
    padding: "8px 16px",
    borderRadius: "6px",
    border: "1px solid #d1d5db",
    backgroundColor: "#fff",
    color: "#374151",
    cursor: "pointer",
    fontWeight: '600',
    fontSize: '14px',
    transition: 'background-color 0.2s',
    marginRight: 'auto',
  },
  statusMessage: {
    textAlign: 'center',
    padding: '40px 20px',
    color: '#6b7280',
    backgroundColor: '#f3f4f6',
    borderRadius: '8px',
    border: '1px dashed #d1d5db',
  },
  articleListContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  articleItem: {
    padding: "12px 16px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    cursor: "pointer",
    backgroundColor: '#fff',
    transition: 'all 0.2s ease-in-out',
    boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  },
  analysisResultContainer: {
    marginTop: '24px',
    padding: '16px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    backgroundColor: '#fff',
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    fontSize: "14px",
  },
  analysisHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px'
  },
  resultSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  resultTitle: {
    margin: 0,
    fontWeight: 'bold',
    color: '#374151'
  },
  resultContent: {
    margin: 0,
    padding: "12px",
    backgroundColor: "#f9fafb",
    borderRadius: "4px",
    border: '1px solid #f3f4f6',
    maxHeight: '9.6em', // 6줄
    overflowY: 'auto',
    wordBreak: 'break-word',
    lineHeight: '1.6',
    color: '#4b5563'
  },
  sentimentText: {
    fontSize: '16px',
    fontWeight: 'bold',
    margin: 0,
  }
};


const RealTimeAnalysis = () => {
  const [keyword, setKeyword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [searchedArticles, setSearchedArticles] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    if (!keyword.trim()) {
      setError("키워드를 입력해주세요.");
      return;
    }
    setIsLoading(true);
    setSearchedArticles([]);
    setSelectedArticle(null);
    setAnalysisResult(null);
    setError(null);

    try {
      const response = await fetch("http://127.0.0.1:8000/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword }),
      });
      if (!response.ok) throw new Error("서버에서 뉴스 검색 중 오류가 발생했습니다.");
      const data = await response.json();
      if (data.articles && data.articles.length > 0) {
        setSearchedArticles(data.articles);
      } else {
        setError(`'${keyword}'에 대한 뉴스를 찾을 수 없습니다.`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyze = async (article) => {
    if (selectedArticle?.url === article.url) return;

    setSelectedArticle(article);
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setError(null);

    try {
      const response = await fetch("http://127.0.0.1:8000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: article.url, title: article.title }),
      });
      if (!response.ok) throw new Error("서버에서 뉴스 분석 중 오류가 발생했습니다.");
      const data = await response.json();
      setAnalysisResult(data);
    } catch (err) {
      setError(err.message);
      setAnalysisResult(null); 
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGoBack = () => {
    setAnalysisResult(null);
    setSelectedArticle(null);
    setError(null);
  };

  const getSentimentColor = (sentiment) => {
    if (sentiment === '긍정') return '#22c55e';
    if (sentiment === '부정') return '#ef4444';
    return '#6b7280';
  }

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>실시간 뉴스 분석</h3>
      
      <div style={styles.searchInputContainer}>
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyUp={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="분석할 키워드를 입력하세요 (예: 금리)"
          style={styles.input}
          disabled={isLoading || isAnalyzing}
        />
        <button
          onClick={handleSearch}
          disabled={isLoading || isAnalyzing}
          style={{...styles.button, opacity: (isLoading || isAnalyzing) ? 0.6 : 1}}
        >
          {isLoading ? "검색 중..." : "뉴스 검색"}
        </button>
      </div>
      
      {error && <p style={{ color: "#ef4444", textAlign: 'center', marginBottom: '20px' }}>⚠️ {error}</p>}
      
      <div>
        {isLoading ? (
            <div style={styles.statusMessage}>최신 뉴스를 검색하고 있습니다...</div>
        ) : searchedArticles.length > 0 && !analysisResult ? (
          <>
            <p style={{ margin: '0 0 12px 0', fontWeight: 'bold', color: '#374151' }}>
              분석할 뉴스를 선택하세요 ({searchedArticles.length}개)
            </p>
            <div style={styles.articleListContainer}>
              {searchedArticles.map((article, index) => (
                <div
                  key={index}
                  onClick={() => handleAnalyze(article)}
                  style={{
                    ...styles.articleItem,
                    borderColor: selectedArticle?.url === article.url ? '#3b82f6' : '#e5e7eb',
                    backgroundColor: selectedArticle?.url === article.url ? '#eff6ff' : '#fff',
                    transform: selectedArticle?.url === article.url ? 'scale(1.02)' : 'scale(1)',
                  }}
                >
                  {article.title}
                </div>
              ))}
            </div>
          </>
        ) : (
            !error && !analysisResult && <div style={styles.statusMessage}>키워드를 입력하고 뉴스 검색 버튼을 눌러주세요.</div>
        )}

        {isAnalyzing && (
            <div style={{...styles.statusMessage, marginTop: '20px'}}>
                기사를 분석 중입니다. 잠시만 기다려주세요...
            </div>
        )}

        {analysisResult && (
          <div style={styles.analysisResultContainer}>
            <div style={styles.analysisHeader}>
                <button onClick={handleGoBack} style={styles.backButton}>
                    ← 목록으로 돌아가기
                </button>
                <p style={{ ...styles.sentimentText, margin: 0, color: getSentimentColor(analysisResult.sentiment) }}>
                    {analysisResult.sentiment}
                </p>
            </div>
            
            <div style={styles.resultSection}>
              <p style={styles.resultTitle}>원본 기사: "{analysisResult.article_title}"</p>
              <p style={styles.resultContent}>{analysisResult.article_content}</p>
            </div>

            <div style={styles.resultSection}>
                <p style={styles.resultTitle}>요약</p>
                <p style={styles.resultContent}>{analysisResult.summary}</p>
            </div>
            
          </div>
        )}
      </div>
    </div>
  );
};

export default RealTimeAnalysis;