# FastAPI 애플리케이션의 메인 로직을 구현합니다.
from typing import List
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware

# 로컬 파일에서 필요한 모듈들을 가져옵니다.
import models, schemas
from database import SessionLocal, engine

# 데이터베이스 테이블을 생성합니다.
models.Base.metadata.create_all(bind=engine)

# FastAPI 앱 인스턴스를 생성합니다.
app = FastAPI()

# CORS(Cross-Origin Resource Sharing) 미들웨어를 설정합니다.
# React 앱(보통 localhost:5173)에서 오는 요청을 허용하기 위해 필요합니다.
origins = [
    "http://localhost",
    "http://localhost:5173", # React 개발 서버 주소
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # 모든 HTTP 메소드 허용
    allow_headers=["*"], # 모든 HTTP 헤더 허용
)

# API 요청 처리 시 데이터베이스 세션을 가져오는 함수입니다.
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- API 엔드포인트 정의 ---

# 게시글 생성 (Create)
@app.post("/posts/", response_model=schemas.Post)
def create_post(post: schemas.PostCreate, db: Session = Depends(get_db)):
    db_post = models.Post(title=post.title, content=post.content)
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post

# 모든 게시글 조회 (Read)
@app.get("/posts/", response_model=List[schemas.Post])
def read_posts(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    posts = db.query(models.Post).offset(skip).limit(limit).all()
    return posts

# 특정 게시글 조회 (Read)
@app.get("/posts/{post_id}", response_model=schemas.Post)
def read_post(post_id: int, db: Session = Depends(get_db)):
    db_post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if db_post is None:
        raise HTTPException(status_code=404, detail="Post not found")
    return db_post

# 게시글 수정 (Update)
@app.put("/posts/{post_id}", response_model=schemas.Post)
def update_post(post_id: int, post: schemas.PostCreate, db: Session = Depends(get_db)):
    db_post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if db_post is None:
        raise HTTPException(status_code=404, detail="Post not found")
    db_post.title = post.title
    db_post.content = post.content
    db.commit()
    db.refresh(db_post)
    return db_post

# 게시글 삭제 (Delete)
@app.delete("/posts/{post_id}", response_model=dict)
def delete_post(post_id: int, db: Session = Depends(get_db)):
    db_post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if db_post is None:
        raise HTTPException(status_code=404, detail="Post not found")
    db.delete(db_post)
    db.commit()
    return {"ok": True}
