# Pydantic을 사용하여 API 데이터 모델(스키마)을 정의합니다.
# 이는 데이터 유효성 검사, 직렬화, 문서화에 사용됩니다.
from pydantic import BaseModel
from datetime import datetime

# 게시글의 기본 속성을 정의하는 기본 스키마입니다.
class PostBase(BaseModel):
    title: str
    content: str

# 게시글을 생성할 때 사용하는 스키마입니다.
# PostBase를 상속받아 title과 content 필드를 가집니다.
class PostCreate(PostBase):
    pass

# 게시글을 조회할 때 사용하는 스키마입니다.
# PostBase를 상속받고, 추가로 id와 created_at 필드를 가집니다.
class Post(PostBase):
    id: int
    created_at: datetime

    # ORM 모델(SQLAlchemy 모델)과 Pydantic 모델을 연결해주는 설정입니다.
    # 이를 통해 데이터베이스에서 읽어온 객체를 이 스키마로 쉽게 변환할 수 있습니다.
    class Config:
        orm_mode = True
