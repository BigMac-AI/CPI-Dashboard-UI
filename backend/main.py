from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import requests
from bs4 import BeautifulSoup
import time
import re
from typing import List, Dict, Any

import torch
from transformers import PreTrainedTokenizerFast, BartForConditionalGeneration
import tensorflow as tf
from transformers import TFBertForSequenceClassification, AutoTokenizer

print("요약모델 start")
try:
    summary_model = BartForConditionalGeneration.from_pretrained('./model/kobart_summary')
    summary_tokenizer = PreTrainedTokenizerFast.from_pretrained('gogamza/kobart-base-v1')
    sentiment_model = TFBertForSequenceClassification.from_pretrained('./model/backup_model')
    sentiment_tokenizer = AutoTokenizer.from_pretrained('./model/backup_model_tokenizer')
    sentiment_labels = ["부정", "중립", "긍정"]
    print("요약모델 완료.")
except Exception as e:
    print(f"요약모델 도중 오류: {e}")

try:
    from newspaper import Article, Config
    HAS_NEWSPAPER = True
    NP_CONFIG = Config()
    NP_CONFIG.browser_user_agent = (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/115.0.0.0 Safari/537.36"
    )
except ImportError:
    HAS_NEWSPAPER = False
    NP_CONFIG = None

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "ko-KR,ko;q=0.9",
}

def fetch_latest_naver_news(query: str, limit: int = 5, delay_sec: float = 0.5) -> List[Dict[str, str]]:
    base_url = "https://search.naver.com/search.naver"
    results = []
    seen = set()
    page = 1
    while len(results) < limit:
        start_num = (page - 1) * 10 + 1
        params = {
            "ssc": "tab.news.all", "query": query, "sm": "tab_opt", "sort": "1",
            "photo": "0", "field": "0", "pd": "0", "nso": "so:dd,p:all", "start": str(start_num),
        }
        try:
            resp = requests.get(base_url, headers=HEADERS, params=params, timeout=10)
            if resp.status_code != 200: break
            soup = BeautifulSoup(resp.text, "html.parser")
            items = soup.select("a.news_tit")
            if not items:
                cards = soup.find_all("div", class_=re.compile("sds-comps-vertical-layout"))
                for card in cards:
                    title_span = card.find("span", class_=re.compile("headline"))
                    if not title_span: continue
                    a_tag = title_span.find_parent("a", href=True)
                    if a_tag:
                        items.append(a_tag)
            if not items: break
            for a in items:
                if len(results) >= limit: break
                href = a.get("href")
                title = a.get_text(strip=True)
                if href and title and href not in seen:
                    seen.add(href)
                    results.append({"title": title, "url": href})
            page += 1
            time.sleep(delay_sec)
        except Exception:
            break
    return results

def bs4_content_fallback(html: str) -> str:
    soup = BeautifulSoup(html, "html.parser")
    for tag in soup(['script', 'style', 'aside', 'iframe']):
        tag.decompose()
    selectors = [
        'div#dic_area', 'div#newsEndContents', 'div#articleBodyContents', 'div.article_body',
        'div#article-body', 'div.content', 'div[itemprop="articleBody"]', 'div#article_content',
        'div.cont_view', 'section.news_view', 'section.article-body', 'div#textBody',
        'div#divNewsContent', 'div.article_txt', 'div#news_body_area', 'section.article-body .article-body__content-text',
        'section.article-body p', 'div#article-view-content-div', 'div#news-view', 'div.news_article',
        'div#articeBody', 'div#viewContent', 'div#articleBody > p', 'article#article-view-content-div',
        'div#boodyArea', 'div.news-contents'
    ]
    def clean_txt(t: str) -> str:
        return re.sub(r'\s+', ' ', t).strip()
    for sel in selectors:
        node = soup.select_one(sel)
        if not node: continue
        paragraphs = node.find_all('p')
        if paragraphs:
            raw = ' '.join(p.get_text(strip=True) for p in paragraphs if p.get_text(strip=True))
            cleaned = clean_txt(raw)
            if cleaned: return cleaned
        raw_html = node.decode_contents()
        segments = raw_html.split('<br')
        br_raw = ' '.join(BeautifulSoup(seg, 'html.parser').get_text(strip=True) for seg in segments)
        cleaned_br = clean_txt(br_raw)
        if cleaned_br: return cleaned_br
        fallback_raw = node.get_text(separator=' ', strip=True)
        cleaned_fb = clean_txt(fallback_raw)
        if cleaned_fb: return cleaned_fb
    return clean_txt(soup.get_text(separator=' ', strip=True))

def crawl_article_text(url: str, timeout: int = 12) -> str:
    if "news.einfomax.co.kr" in url:
        try:
            resp = requests.get(url, headers=HEADERS, timeout=timeout)
            if resp.status_code == 200:
                soup = BeautifulSoup(resp.text, "html.parser")
                article_tag = soup.select_one("article#article-view-content-div")
                if article_tag:
                    return article_tag.get_text(separator=' ', strip=True)
        except Exception: pass
    if HAS_NEWSPAPER:
        try:
            if any(d in url for d in ["www.hankyung.com", "www.dt.co.kr", "www.bizwatch.co.kr"]):
                art = Article(url, language='ko', config=NP_CONFIG)
            else:
                art = Article(url, language='ko')
            art.download()
            art.parse()
            if art.text and len(art.text.strip()) >= 50:
                return re.sub(r'\s+', ' ', art.text.strip())
        except Exception:
            pass
    try:
        resp = requests.get(url, headers=HEADERS, timeout=timeout)
        if resp.status_code == 200 and resp.text:
            return bs4_content_fallback(resp.text)
    except Exception:
        pass
    return ""

def summarize_text(text: str):
    inputs = summary_tokenizer([text], max_length=1024, truncation=True, return_tensors="pt", return_token_type_ids=False)
    summary_ids = summary_model.generate(**inputs, num_beams=5, max_new_tokens=128, min_new_tokens=20, no_repeat_ngram_size=3, early_stopping=True)
    summary = summary_tokenizer.decode(summary_ids[0], skip_special_tokens=True)
    return summary

def analyze_sentiment(text: str):
    inputs = sentiment_tokenizer(text, return_tensors="tf", truncation=True, padding=True)
    outputs = sentiment_model(**inputs)
    logits = outputs.logits[0]
    probabilities = tf.nn.softmax(logits)
    prediction_index = tf.argmax(logits).numpy()
    score = probabilities[prediction_index].numpy()
    sentiment = sentiment_labels[prediction_index]
    return {"sentiment": sentiment, "score": float(score)}

app = FastAPI()
origins = ["http://localhost:5173", "http://localhost:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SearchRequest(BaseModel):
    keyword: str

class AnalyzeRequest(BaseModel):
    url: str
    title: str

@app.post("/search")
def search_news(request: SearchRequest):
    print(f"'{request.keyword}' 뉴스 검색 시작")
    news_list = fetch_latest_naver_news(request.keyword, limit=5)
    if not news_list:
        return {"articles": []}
    print(f"뉴스 {len(news_list)}건 검색")
    return {"articles": news_list}

@app.post("/analyze")
def analyze_news(request: AnalyzeRequest):
    print(f"뉴스 분석 시작: {request.title}")
    content = crawl_article_text(request.url)
    
    if not content or len(content.strip()) < 50:
        print("본문 크롤링 실패")
        content = "기사 본문을 가져오는 데 실패했거나 분석하기에 내용이 너무 짧습니다."
        summarized_text = "요약할 수 없습니다."
        sentiment_result = {"sentiment": "중립", "score": 0.5}
    else:
        summarized_text = summarize_text(content)
        sentiment_result = analyze_sentiment(summarized_text)
    
    return {
        "article_title": request.title,
        "article_content": content,
        "summary": summarized_text,
        "sentiment": sentiment_result["sentiment"],
        "sentiment_score": sentiment_result["score"],
    }