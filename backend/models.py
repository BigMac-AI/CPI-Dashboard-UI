# 데이터베이스 테이블의 구조(스키마)를 정의합니다.
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from database import Base

# 'Post'라는 이름의 데이터베이스 모델(테이블)을 정의합니다.
class Post(Base):
    # 테이블 이름을 'posts'로 지정합니다.
    __tablename__ = "posts"

    # 각 컬럼(열)을 정의합니다.
    # id: 정수형, 기본 키(Primary Key), 자동으로 값이 증가합니다.
    id = Column(Integer, primary_key=True, index=True)
    # title: 문자열, 필수 값입니다.
    title = Column(String, nullable=False)
    # content: 문자열, 필수 값입니다.
    content = Column(String, nullable=False)
    # created_at: 날짜/시간, 기본값으로 현재 시간이 자동으로 입력됩니다.
    created_at = Column(DateTime(timezone=True), server_default=func.now())