from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine
from .routers import applications, auth


Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="JobFlow API",
    description="Smart Job Application Tracker API",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
    return {"status": "healthy"}