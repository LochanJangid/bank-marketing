import os
import pandas as pd
from ucimlrepo import fetch_ucirepo

def download_data():
    # Get raw dataset from UC Irvine ML REPO
    bank_marketing = fetch_ucirepo(id=222)
    X = bank_marketing.data.features
    y = bank_marketing.data.targets

    # Defined path where we will save our raw dataset
    X_RAW_PATH = os.path.join(os.getcwd(), "data", "raw", "X.csv")
    y_RAW_PATH = os.path.join(os.getcwd(), "data", "raw", "y.csv")

    # Make raw folder if not exists
    os.makedirs(os.path.dirname(X_RAW_PATH), exist_ok=True)

    # Time to save X, y into csv's files
    X.to_csv(X_RAW_PATH, index=False)
    y.to_csv(y_RAW_PATH, index=False)

if __name__ == "__main__":
    download_data()