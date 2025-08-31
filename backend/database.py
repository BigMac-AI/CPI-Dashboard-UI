# SQLAlchemy를 사용하여 데이터베이스 엔진 및 세션을 설정합니다.
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# SQLite 데이터베이스 파일 경로를 지정합니다.
# 이 파일은 backend 폴더 내에 'board.db'라는 이름으로 생성됩니다.
SQLALCHEMY_DATABASE_URL = "sqlite:///./board.db"

# SQLAlchemy 엔진을 생성합니다.
# connect_args는 SQLite에서만 필요하며, 스레드 간 연결 공유를 허용합니다.
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# 데이터베이스 세션을 생성하기 위한 SessionLocal 클래스를 정의합니다.
# 이 세션은 각 API 요청마다 생성되고 요청이 끝나면 닫힙니다.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 데이터베이스 모델을 만들기 위한 기본 클래스를 생성합니다.
# 앞으로 만들 모델들은 이 Base 클래스를 상속받게 됩니다.
Base = declarative_base()