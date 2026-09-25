import os
import joblib
import json
from dataclasses import dataclass
import numpy as np
import pandas as pd
import xgboost as xgb
from sklearn.metrics import accuracy_score, average_precision_score, f1_score, precision_score, recall_score, roc_auc_score

from ml.bankml.logger import logging

@dataclass
class TrainConfig:
    Xtr_PATH: str = os.path.join(os.getcwd(), "data", "processed", "Xtr.csv")
    Xdev_PATH: str = os.path.join(os.getcwd(), "data", "processed", "Xdev.csv")
    Xte_PATH: str = os.path.join(os.getcwd(), "data", "processed", "Xte.csv")

    ytr_PATH: str = os.path.join(os.getcwd(), "data", "processed", "ytr.csv")
    ydev_PATH: str = os.path.join(os.getcwd(), "data", "processed", "ydev.csv")
    yte_PATH: str = os.path.join(os.getcwd(), "data", "processed", "yte.csv")

    MODEL_PATH: str = os.path.join(os.getcwd(), "models", "model.joblib")
    MODEL_META_PATH: str = os.path.join(os.getcwd(), "models", "model_meta.json")

class Train:
    def __init__(self):
        self.config = TrainConfig()
        self.Xtr, self.ytr = self.load_dataset("train")
        self.Xdev, self.ydev = self.load_dataset("dev")
        self.Xte, self.yte = self.load_dataset("test")

    def load_dataset(self, type="train"):
        paths = {
            "train": [self.config.Xtr_PATH, self.config.ytr_PATH],
            "dev": [self.config.Xdev_PATH, self.config.ydev_PATH],
            "test": [self.config.Xte_PATH, self.config.yte_PATH]
        }
        X = pd.read_csv(paths[type][0]).values
        y = pd.read_csv(paths[type][1]).values

        return X, y.reshape(-1)

    def evaluate(self, true, probs, threshold, label):
        preds = (probs >= threshold).astype(int)
        matrix = {
            "accuracy": accuracy_score(true, preds), 
            "precision": precision_score(true, preds, zero_division=True), 
            "recall": recall_score(true, preds, zero_division=True), 
            "f1": f1_score(true, preds, zero_division=True), 
            "roc_auc": roc_auc_score(true, probs), 
            "pr_auc": average_precision_score(true, probs), 
        }
        logging.info(f"{label} - {matrix}")

        return matrix

    def train_xgboost(self):
        logging.info("Training XGBoost")

        scale_pos_weight = (self.ytr == 0).sum() / (self.ytr == 1).sum()

        logging.info(f"Scale_pos_weight={scale_pos_weight}")

        model = xgb.XGBClassifier( 
            n_estimators=1000, 
            max_depth=4, 
            learning_rate=0.03, 
            min_child_weight=5, 
            subsample=0.8, 
            colsample_bytree=0.8, 
            scale_pos_weight=scale_pos_weight, 
            eval_metric="auc", 
            early_stopping_rounds=30, 
            random_state=42, 
            n_jobs=1
        )

        model.fit(self.Xtr, self.ytr, eval_set=[(self.Xdev, self.ydev)], verbose=False)

        logging.info(f"Best Iterations: {model.best_iteration}")

        return model

    def run(self):
        model = self.train_xgboost()

        dev_probs = model.predict_proba(self.Xdev)[:, 1]

        metrix = self.evaluate(self.ydev, dev_probs, threshold=0.50, label="XGBoost | Dev | Normal")

        # tune the threshold
        thresholds = np.arange(0.05, 0.96, 0.01)
        scores = [f1_score(self.ydev, (dev_probs >= threshold), zero_division=0) for threshold in thresholds]
        best_idx = np.argmax(scores)
        best_threshold = thresholds[best_idx]
        best_dev_f1 = scores[best_idx]

        metrix = self.evaluate(self.ydev, dev_probs, threshold=best_threshold, label="XGBoost | Dev | Tuned")

        logging.info("Dev Set Evaluated.")

        # Final evaluation

        test_probs = model.predict_proba(self.Xte)[:, 1]

        test_metrices = self.evaluate(self.yte, test_probs, threshold=best_threshold, label="XGBoost | Test | Final")
        logging.info("Final Test Set Evaluated.")

        joblib.dump(model, self.config.MODEL_PATH)
        logging.info(f"Model saved to {self.config.MODEL_PATH}")

        metadata = {
            "model": "xgboost",
            "best_iter": model.best_iteration,
            "threshold": best_threshold,
            "dev_f1": best_dev_f1,
            "test_metrices": test_metrices
        }

        with open(self.config.MODEL_META_PATH, "w") as f:
            json.dump(metadata, f, indent=2)
        
        logging.info(f"Model Metadata saved to {self.config.MODEL_META_PATH}")
        
if __name__ == "__main__":
    traini = Train()
    traini.run()