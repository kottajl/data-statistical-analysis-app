import os
import numpy as np
import pandas as pd
from scipy import stats
from backend.settings import FILES_URL
from data_manager.available_stats import numpy_functions, scipy_functions


def get_file_url(destination: str) -> str:
    directory_path = str(os.path.join(FILES_URL, destination))
    if os.path.exists(directory_path) and len(os.listdir(directory_path)) == 1:
        return str(os.path.join(directory_path, os.listdir(directory_path)[0]))
    raise Exception("File not found.")


def load_to_dataframe(destination: str) -> pd.DataFrame:
    file_url = get_file_url(destination)
    df = pd.read_csv(file_url, sep=';', decimal=",")
    return df


def save_from_dataframe(destination: str, df: pd.DataFrame) -> None:
    file_url = get_file_url(destination)
    df.to_csv(file_url, index=False, sep=';', decimal=",")



def convert_data(value):
    try:
        return float(value)
    except ValueError:
        return np.nan


def calculate_stats(function_name: str, data):
    if function_name in numpy_functions.keys():
        return numpy_functions.get(function_name)(data)
    if function_name in scipy_functions.keys():
        return scipy_functions.get(function_name)(data)
    # TODO: error handle
