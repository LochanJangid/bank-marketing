import os
import pandas as pd
import numpy as np
import joblib

from dataclasses import dataclass
from sklearn.model_selection import train_test_split

from ml.bankml.logger import logging


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

    PREPROCESSOR_PATH: str = os.path.join(
        os.getcwd(), "models", "preprocessor.joblib"
    )


class Preprocess:

    def __init__(self):
        self.config = PreprocessConfig()

    def load_data(self):

        X = pd.read_csv(self.config.X_RAW_PATH)
        y = pd.read_csv(self.config.y_RAW_PATH)

        logging.info("Dataset is loaded.")

        return X, y

    def fit(self, X):

        self._input_columns = X.columns.tolist()


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
            # "duration": "median", # suuuuu.....
            "campaign": "median",
            "pdays": -1,
            "previous": 0,
            "poutcome": "unknown",
        }

        for col in self._imputer:

            if self._imputer[col] == "mode":
                self._imputer[col] = X[col].mode()[0]

            elif self._imputer[col] == "median":
                self._imputer[col] = X[col].median()


        self._transformers = {
            "campaign": [
                "log1p",
                None,
                X["campaign"].quantile(0.99),
            ],
            "previous": [
                "log1p",
                None,
                X["previous"].quantile(0.99),
            ],
            "pdays": [
                "log1p",
                0,
                None,
            ],
            "balance": [
                "sign_log1p"
            ],
        }


        self._binary_columns = [
            "default",
            "housing",
            "loan",
        ]

        self._categorical_columns = [
            "marital",
            "education",
            "contact",
            "poutcome",
            "job",
            "month",
        ]


        self._drop = ["duration"]


        X_fitted = self._transform(X, fitting=True)

        self._feature_columns = X_fitted.columns.tolist()

        logging.info("Preprocessor fitted.")
        logging.info(
            f"Final feature count: {len(self._feature_columns)}"
        )

        return self


    def _transform(self, X, fitting=False):

        X_clean = X.copy()


        for col, impute_val in self._imputer.items():

            X_clean[col] = X_clean[col].fillna(impute_val)


        for col, decision in self._transformers.items():

            method = decision[0]

            if method == "log1p":

                lower = decision[1]
                upper = decision[2]

                X_clean[col] = np.log1p(
                    X_clean[col].clip(
                        lower=lower,
                        upper=upper,
                    )
                )

            elif method == "sign_log1p":

                X_clean[col] = (
                    np.sign(X_clean[col])
                    * np.log1p(np.abs(X_clean[col]))
                )


        X_clean["was_contacted"] = (
            X_clean["pdays"] != -1
        ).astype(int)

        X_clean["campaign × previous"] = (
            X_clean["campaign"]
            * X_clean["previous"]
        )

        poutcome_success = (
            X_clean["poutcome"] == "success"
        ).astype(int)

        X_clean["poutcome × campaign"] = (
            poutcome_success
            * X_clean["campaign"]
        )


        X_clean[self._binary_columns] = (
            X_clean[self._binary_columns] == "yes"
        ).astype(int)


        X_clean = pd.get_dummies(
            X_clean,
            columns=self._categorical_columns,
            dtype=int,
            drop_first=True,
        )


        X_clean = X_clean.drop(
            columns=self._drop,
            errors="ignore",
        )


        if not fitting:

            X_clean = X_clean.reindex(
                columns=self._feature_columns,
                fill_value=0,
            )

        return X_clean

    def transform(self, X):

        X_clean = self._transform(
            X,
            fitting=False,
        )

        logging.info("Transform the data.")

        return X_clean


    def y_transform(self, y):

        y_encoded = (y == "yes").astype(int)

        logging.info("Transform y data.")

        return y_encoded


    def save_processed(self, X, y, type="train"):

        X_SAVE_PATH = self.config.Xtr_PATH
        y_SAVE_PATH = self.config.ytr_PATH

        if type == "dev":

            X_SAVE_PATH = self.config.Xdev_PATH
            y_SAVE_PATH = self.config.ydev_PATH

        elif type == "test":

            X_SAVE_PATH = self.config.Xte_PATH
            y_SAVE_PATH = self.config.yte_PATH

        os.makedirs(
            os.path.dirname(X_SAVE_PATH),
            exist_ok=True,
        )

        X.to_csv(
            X_SAVE_PATH,
            index=False,
        )

        y.to_csv(
            y_SAVE_PATH,
            index=False,
        )

        logging.info(f"{type} set saved.")


    def save(self):

        os.makedirs(
            os.path.dirname(
                self.config.PREPROCESSOR_PATH
            ),
            exist_ok=True,
        )

        joblib.dump(
            self,
            self.config.PREPROCESSOR_PATH,
        )

        logging.info(
            f"Preprocessor saved to "
            f"{self.config.PREPROCESSOR_PATH}"
        )


    def run(self):

        X, y = self.load_data()


        Xtr, Xdevtest, ytr, ydevtest = train_test_split(
            X,
            y,
            test_size=0.30,
            stratify=y,
            random_state=42,
        )

        Xdev, Xte, ydev, yte = train_test_split(
            Xdevtest,
            ydevtest,
            test_size=0.50,
            stratify=ydevtest,
            random_state=42,
        )


        self.fit(Xtr)


        Xtr = self.transform(Xtr)
        Xdev = self.transform(Xdev)
        Xte = self.transform(Xte)


        ytr = self.y_transform(ytr)
        ydev = self.y_transform(ydev)
        yte = self.y_transform(yte)


        self.save_processed(
            Xtr,
            ytr,
            type="train",
        )

        self.save_processed(
            Xdev,
            ydev,
            type="dev",
        )

        self.save_processed(
            Xte,
            yte,
            type="test",
        )


        self.save()

        logging.info("Preprocessing pipeline completed.")

        return (
            Xtr,
            Xdev,
            Xte,
            ytr,
            ydev,
            yte,
        )


if __name__ == "__main__":
    print("RUNNING PREPROCESS MODULE")
    print("CLASS:", Preprocess.__module__)

    preprocessor = Preprocess()
    preprocessor.run()