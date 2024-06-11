import numpy as np
import pandas as pd
from scipy.stats import stats

from data_manager.available_stats import numpy_functions, scipy_functions


def convert_data(value: str):
    try:
        return float(value)
    except ValueError:
        return np.nan

def get_numerical_stats(functions: list[str], all_data):
    num_data = all_data[np.logical_not(np.isnan(all_data))]
    results = dict()
    for function in functions:
        if function == "mode":
            # return only one value
            results[function] = stats.mode(num_data).mode
        elif function == "percentile":
            quartiles = np.percentile(num_data, [25, 50, 75])
            results["percentile25"] = quartiles[0]
            results["percentile50"] = quartiles[1]
            results["percentile75"] = quartiles[2]
        elif function == "missing":
            results[function] = np.isnan(all_data).sum()
        else:
            results[function] = calculate_numerical_stats(function, num_data)
    return results

def calculate_numerical_stats(function_name: str, data):
    if function_name in numpy_functions.keys():
        return numpy_functions.get(function_name)(data)
    if function_name in scipy_functions.keys():
        return scipy_functions.get(function_name)(data)
    return f"{function_name} is not supported"

def get_categorical_stats(functions: list[str], all_data: list):
    data = pd.Series(all_data)
    results = dict()
    for function in functions:
        if function == "missing":
            results[function] = data.isnull().sum()
        elif function == "unique":
            results[function] = data.nunique()
        elif function == "count":
            results[function] = data.value_counts().to_dict()
        else:
            results[function] = f"{function} is not supported"
    return results

