from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import json
import pandas as pd


app = FastAPI()

preprocessor = joblib.load("models/preprocessor.joblib")
model = joblib.load("models/model.joblib")

with open("models/model_meta.json") as f: 
    metadata = json.load(f)

threshold = float(metadata["threshold"])

class XData(BaseModel):
    age: int
    job: str
    marital: str
    education: str
    default: str
    balance: int
    housing: str
    loan: str
    contact: str
    day_of_week: int
    month: str
    duration: int
    campaign: int
    pdays: int
    previous: int
    poutcome: str


@app.get("/")
def root():
    return {"msg": "Bank Marketing API"}


@app.get("/health")
def health():
    return {"msg": "i am fine bro :)"}


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