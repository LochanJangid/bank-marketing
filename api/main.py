from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import joblib
import json
import pandas as pd
from typing import Literal


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

preprocessor = joblib.load("models/preprocessor.joblib")
model = joblib.load("models/model.joblib")

with open("models/model_meta.json") as f: 
    metadata = json.load(f)

threshold = float(metadata["threshold"])

class XData(BaseModel):

    age: int = Field(gt=0)

    job: Literal[
        "blue-collar",
        "management",
        "technician",
        "admin.",
        "services",
        "retired",
        "self-employed",
        "entrepreneur",
        "unemployed",
        "housemaid",
        "student"
    ] | None = None

    marital: Literal[
        "married",
        "single",
        "divorced",
    ] | None = None

    education: Literal[
        "secondary",
        "tertiary",
        "primary",
    ] | None = None

    default: Literal[
        "no",
        "yes",
    ] | None = None

    balance: float

    housing: Literal[
        "yes",
        "no",
    ] | None = None

    loan: Literal[
        "no",
        "yes",
    ] | None = None

    contact: Literal[
        "cellular",
        "telephone",
    ] | None = None

    day_of_week: int = Field(ge=1, le=31)

    month: Literal[
        "may",
        "jul",
        "aug",
        "jun",
        "nov",
        "apr",
        "feb",
        "jan",
        "oct",
        "sep",
        "mar",
        "dec",
    ] | None = None

    campaign: int = Field(ge=1)

    pdays: int = Field(ge=-1)

    previous: int = Field(ge=0)

    poutcome: Literal[
        "failure",
        "other",
        "success",
    ] | None = None

@app.get("/")
def root():
    return {"msg": "Bank Marketing API"}


@app.get("/health")
def health():
    return {"msg": "i am fine bro :)"}


# Validate the request
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = []
    for error in exc.errors():
        field = ".".join(str(x) for x in error["loc"][1:])

        errors.append({"field": field, "message": error["msg"]})

    return JSONResponse(
        status_code=422,
        content={
            "error": "Invalid input",
            "message": "Please check the input values.",
            "details": errors
        }
    )


@app.post("/predict")
def predict(data: XData):

    data_dict = data.model_dump() # Dictionary → one-row DataFrame 
    input_data = pd.DataFrame([data_dict])

    processed_data = preprocessor.transform(input_data)

    prob = model.predict_proba(processed_data)[0, 1]
    prob = float(prob)
    pred = int(prob >= threshold)

    return {
        "prediction": pred,
        "probability": round(prob, 4),
        "threshold": threshold,
        "message": ("Customer will subscribe" if pred == 1 else "Customer will not subscribe")
    }