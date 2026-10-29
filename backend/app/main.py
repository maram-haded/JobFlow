from fastapi import FastAPI

from .database import Base, engine
from .routers import applications, auth

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="JobFlow API",
    description="Smart Job Application Tracker API",
    version="1.0.0",
)

app.include_router(auth.router)
app.include_router(applications.router)


@app.get("/")
def root():
    return {
        "message": "JobFlow API is running",
        "version": "1.0.0",
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
    }