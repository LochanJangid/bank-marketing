# Bank Marketing Prediction

An end-to-end machine learning application that predicts whether a customer is likely to subscribe to a term deposit.

### Live Demo
[bank-marketing-alpha.vercel.app](https://bank-marketing-alpha.vercel.app/)

### Architecture

```text
Next.js → FastAPI → Preprocessing → XGBoost → Prediction
   │          │
 Vercel     Render
````

### What I Built

* Exploratory data analysis and feature engineering
* Reusable preprocessing pipeline
* XGBoost classification model
* FastAPI inference API with Pydantic validation
* Next.js + TypeScript frontend
* Dockerized backend
* Production deployment with Vercel and Render

### Dataset

Bank Marketing dataset with ~45K customer records and 16 original features.

The model uses customer demographics, financial information, contact details, and campaign history. `duration` is excluded from the prediction interface to avoid using information that would only be available after the call.

### Tech Stack

**ML:** Python, Pandas, NumPy, scikit-learn, XGBoost
**Backend:** FastAPI, Pydantic, Uvicorn
**Frontend:** Next.js, TypeScript, Tailwind CSS
**Deployment:** Docker, Vercel, Render

### Project Structure

```text
bank-marketing/
├── api/          # FastAPI service
├── frontend/     # Next.js application
├── ml/           # Preprocessing & ML logic
├── models/       # Trained model artifacts
├── notebooks/    # Experiments & analysis
├── Dockerfile
└── docker-compose.yml
```

### Run Locally

```bash
git clone https://github.com/LochanJangid/bank-marketing.git
cd bank-marketing
```

Backend:

```bash
uvicorn api.main:app --reload
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Frontend: `http://localhost:3000`
API: `http://localhost:8000/docs`

### Author

[**Lochan Jangid**](https://lochan.vercel.app/)