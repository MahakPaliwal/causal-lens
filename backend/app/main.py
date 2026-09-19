from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import power_analysis, bayesian_ab, sequential_test, multiple_testing, diff_in_diff, psm, causal_impact, interpret

app = FastAPI(title="Experimentation & Causal Impact Platform")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten this later for production
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(power_analysis.router)
app.include_router(bayesian_ab.router)
app.include_router(sequential_test.router)
app.include_router(multiple_testing.router)
app.include_router(diff_in_diff.router)
app.include_router(psm.router)
app.include_router(causal_impact.router)
app.include_router(interpret.router)
@app.get("/health")
def health_check():
    return {"status": "ok"}