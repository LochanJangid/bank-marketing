import os
import pandas as pd
import numpy as np

from dataclasses import dataclass
from data.download import download_data
from sklearn.model_selection import train_test_split


@dataclass
class PreprocessConfig:
    X_RAW_PATH: str = os.path.join(os.getcwd(), "data", "raw", "X.csv")
    y_RAW_PATH: str = os.path.join(os.getcwd(), "data", "raw", "y.csv")
    Xtr_PATH: str = os.path.join(os.getcwd(), "data", "processed", "Xtr.csv")
    Xdev_PATH: str = os.path.join(os.getcwd(), "data", "processed", "Xdev.csv")
    Xte_PATH: str = os.path.join(os.getcwd(), "data", "processed", "Xte.csv")
    ytr_PATH: str = os.path.join(os.getcwd(), "data", "processed", "ytr.csv")
    ydev_PATH: str = os.path.join(os.getcwd(), "data", "processed", "ydev.csv")
    yte_PATH: str = os.path.join(os.getcwd(), "data", "processed", "yte.csv")

class Preprocess:
    def __init__(self):
        self.config = PreprocessConfig()

    def load_data(self):
        # if data dosen't exists
        if not os.path.isfile(self.config.X_RAW_PATH) or not os.path.isfile(self.config.y_RAW_PATH):
            download_data()

        X = pd.read_csv(self.config.X_RAW_PATH)
        y = pd.read_csv(self.config.y_RAW_PATH)

        return X, y

    def fit(self, X):

        self._columns = X.columns

        self._imputer = {
            "age": "median",
            "job": "unknown",
            "marital": "mode",
            "education": "unknown",
            "default": "mode",
            "balance": "median",
            "housing": "mode",
            "loan": "mode",
            "contact": "unknown",
            "day_of_week": "mode",
            "month": "mode",
            "duration": "median", # duration will drop becauze it can be cause of leakage
            "campaign": "median",
            "pdays": -1,
            "previous": 0,
            "poutcome": "unknown"
        }

        # Get mean, median data from X and update self.imputer with them
        for col in self._imputer:
            if self._imputer[col] == "mode":
                self._imputer[col] = X[col].mode()[0]
            elif self._imputer[col] == "median":
                self._imputer[col] = X[col].median()

        # Format: col_name: [method, lower, upper]
        self._transformers = {
            "campaign": ["log1p", None, X["campaign"].quantile(.99)],
            "previous": ["log1p", None, X["previous"].quantile(.99)],
            "pdays": ["log1p", 0, None],
            "balance": ["sign_log1p"]
        }

        # Format: encoder_name: cols
        self._encoders = {
            "binary": ["default", "housing", "loan"],
            "oht": ["marital", "education", "contact", "poutcome", "job", "month"]
        }

        # Columns to drop
        self._drop = ["duration"]

    def transform(self, X):
        X_clean = X.copy()

        # apply imputers
        for col, impute_val in self._imputer.items():
            X_clean[col] = X_clean[col].fillna(impute_val)

        X_clean["was_contacted"] = (X_clean["pdays"] != -1).astype(int) # extract useful content

        # apply transformation
        for col, decision in self._transformers.items():
            if decision[0] == "log1p":
                X_clean[col] = np.log1p(X_clean[col].clip(lower=decision[1], upper=decision[2]))
            elif decision[0] == "sign_log1p":
                X_clean[col] = np.sign(X_clean[col]) * np.log1p(np.abs(X_clean[col]))


        
        # apply encoders
        X_clean[self._encoders["binary"]] = (X_clean[self._encoders["binary"]] == "yes").astype(int)
        X_clean = pd.get_dummies(X_clean, columns=self._encoders["oht"], dtype=int, drop_first=True)

        # Get same columns as fitted data (some columns can lost into get_dummies)
        X_clean = X_clean.reindex(columns=self._columns, fill_value=0)
        
        # Drop the columns that should dropped
        X_clean = X_clean.drop(columns=self._drop)

        return X_clean

    def y_transform(self, y):
        y_encoded = y.copy()
        y_encoded = (y == "yes").astype(int)
        return y_encoded

    def save_processed(self, X, y, type="train"):
        X_SAVE_PATH = self.config.Xtr_PATH # default for train set
        y_SAVE_PATH = self.config.ytr_PATH # default for train set
        if type=="dev":
            X_SAVE_PATH = self.config.Xdev_PATH
            y_SAVE_PATH = self.config.ydev_PATH
        elif type=="test":
            X_SAVE_PATH = self.config.Xte_PATH
            y_SAVE_PATH = self.config.yte_PATH

        # make path dictionary if not exists
        os.makedirs(os.path.dirname(X_SAVE_PATH), exist_ok=True)

        # Save processed data to path
        X.to_csv(X_SAVE_PATH, index=False)
        y.to_csv(y_SAVE_PATH, index=False)

    def run(self):
        preprocessor = self
        X, y = preprocessor.load_data()
    
        # SPLIT -> train, dev, test
        Xtr, Xdevtest, ytr, ydevtest = train_test_split(X, y, test_size=0.3, stratify=y)
        Xdev, Xte, ydev, yte = train_test_split(Xdevtest, ydevtest, test_size=0.5, stratify=ydevtest)
    
        # fit the data
        preprocessor.fit(Xtr)
    
        # transform the X dataframes
        Xtr = preprocessor.transform(Xtr)
        Xdev = preprocessor.transform(Xdev)
        Xte = preprocessor.transform(Xte)
    
        # transform the y dataframe (just simple binary encoding)
        ytr = preprocessor.y_transform(ytr)
        ydev = preprocessor.y_transform(ydev)
        yte = preprocessor.y_transform(yte)

        self.save_processed(Xtr, ytr, type="train")
        self.save_processed(Xdev, ydev, type="dev")
        self.save_processed(Xte, yte, type="test")

        return (Xtr, Xdev, Xte, ytr, ydev, yte)

    

if __name__ == "__main__":
    preprocessor = Preprocess()
    preprocessor.run()