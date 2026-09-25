import os
import logging
from datetime import datetime

time = datetime.now().strftime("%d_%m_%Y_%H_%M_%S")

LOG_FILE_PATH = os.path.join(os.getcwd(), "logs", f"{time}.log")

os.makedirs(os.path.dirname(LOG_FILE_PATH), exist_ok=True)

logging.basicConfig(
    filename=LOG_FILE_PATH,
    format="%(asctime)s %(name)s - %(levelname)s - %(msg)s",
    level=logging.INFO
)

logging.info("Hi from logger :)")