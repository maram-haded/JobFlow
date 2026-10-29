from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

import os
from dotenv import load_dotenv

from ..database import get_db
from ..models import Application, ApplicationStatus, User
from ..schemas import (
    ApplicationCreate,
    ApplicationResponse,
    ApplicationUpdate,
)

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/auth/login"
)

router = APIRouter(
    prefix="/applications",
    tags=["Applications"],
)


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
        )

        user_id = payload.get("sub")

        if user_id is None:
            raise credentials_exception

    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(
        User.id == int(user_id)
    ).first()

    if user is None:
        raise credentials_exception

    return user


@router.post(
    "/",
    response_model=ApplicationResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_application(
    application_data: ApplicationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    application = Application(
        **application_data.model_dump(),
        user_id=current_user.id,
    )

    db.add(application)
    db.commit()
    db.refresh(application)

    return application


@router.get(
    "/",
    response_model=list[ApplicationResponse],
)
def get_applications(
    search: str | None = None,
    status_filter: ApplicationStatus | None = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Application).filter(
        Application.user_id == current_user.id
    )

    if search:
        search_value = f"%{search}%"

        query = query.filter(
            (Application.company.ilike(search_value))
            | (Application.position.ilike(search_value))
        )

    if status_filter:
        query = query.filter(
            Application.status == status_filter
        )

    return query.order_by(
        Application.created_at.desc()
    ).all()


@router.get(
    "/{application_id}",
    response_model=ApplicationResponse,
)
def get_application(
    application_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    application = db.query(Application).filter(
        Application.id == application_id,
        Application.user_id == current_user.id,
    ).first()

    if not application:
        raise HTTPException(
            status_code=404,
            detail="Application not found",
        )

    return application


@router.put(
    "/{application_id}",
    response_model=ApplicationResponse,
)
def update_application(
    application_id: int,
    application_data: ApplicationUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    application = db.query(Application).filter(
        Application.id == application_id,
        Application.user_id == current_user.id,
    ).first()

    if not application:
        raise HTTPException(
            status_code=404,
            detail="Application not found",
        )

    update_data = application_data.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(application, field, value)

    db.commit()
    db.refresh(application)

    return application


@router.delete(
    "/{application_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_application(
    application_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    application = db.query(Application).filter(
        Application.id == application_id,
        Application.user_id == current_user.id,
    ).first()

    if not application:
        raise HTTPException(
            status_code=404,
            detail="Application not found",
        )

    db.delete(application)
    db.commit()

    return None