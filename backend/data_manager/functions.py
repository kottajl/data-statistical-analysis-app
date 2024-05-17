import os
import numpy as np
from scipy import stats
from backend.settings import FILES_URL
from data_manager.available_stats import numpy_functions, scipy_functions


def get_file_url(destination: str) -> str:
    directory_path = str(os.path.join(FILES_URL, destination))
    if os.path.exists(directory_path) and len(os.listdir(directory_path)) == 1:
        return str(os.path.join(directory_path, os.listdir(directory_path)[0]))
    return ""

def calculate_stats(function_name: str, data):
    if function_name in numpy_functions.keys():
        return numpy_functions.get(function_name)(data)
    if function_name in scipy_functions.keys():
        return scipy_functions.get(function_name)(data)
    # if function_name == "mode":
    #     return stats.mode(data).mode[0]
    # if function_name == "precentile":
    #     return np.percentile(data, [25, 50, 75])
    # if function_name == "isnan":
    #     return np.isnan(data).sum()
    # TODO: error handle


