from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import User, UserToken

bearer_scheme = HTTPBearer(auto_error=False)

FREE_RECORD_LIMIT = 10  # legacy display helper; browsing is no longer credit-gated
CREDITS_PER_PAGE = 0  # pagination is free
CREDITS_PER_TECHNOLOGY_EXPORT = 1
MAX_EXPORT_ROWS = 5000


def store_user_token(db: Session, user_id: int, token: str) -> None:
    db.query(UserToken).filter(UserToken.user_id == user_id).delete()
    db.add(UserToken(token=token, user_id=user_id))
    db.flush()


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    if not credentials or not credentials.credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    row = (
        db.query(UserToken)
        .filter(UserToken.token == credentials.credentials)
        .first()
    )
    if not row:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    user = db.query(User).filter(User.id == row.user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


def get_current_user_optional(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User | None:
    if not credentials or not credentials.credentials:
        return None
    row = (
        db.query(UserToken)
        .filter(UserToken.token == credentials.credentials)
        .first()
    )
    if not row:
        return None
    return db.query(User).filter(User.id == row.user_id).first()
