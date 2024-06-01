import numpy as np
import pandas as pd
from data_manager.available_stats import numerical_functions_2d, categorical_functions_2d, \
    numerical_categorical_functions_2d


def get_stats(functions: list[str], all_data, data_types: list[str]):
    data1, data2 = all_data
    results = dict()
    if data_types.__contains__("numerical") and data_types.__contains__("categorical"):
        numerical_data, categorical_data = all_data[data_types.index("numerical")], all_data[data_types.index("categorical")]
        for function in functions:
            if function in numerical_categorical_functions_2d:
                results[function] = numerical_categorical_functions_2d[function](numerical_data,pd.DataFrame(categorical_data).value_counts().values).statistic
            else:
                results[function] = f"{function} is not supported"

    elif data_types.count("numerical") == 2:
        for function in functions:
            if function in numerical_functions_2d:
                results[function] = numerical_functions_2d[function](data1, data2).statistic
            else:
                results[function] = f"{function} is not supported"

    elif data_types.count("categorical") == 2:
        for function in functions:
            if function in categorical_functions_2d:
                values1, values2 = get_value_count(data1, data2)
                results[function] = categorical_functions_2d[function](values1, values2).statistic
            else:
                results[function] = f"{function} is not supported"
    return results


def get_value_count(data1, data2):
    values = [[], []]
    unique = np.unique(data1 + data2)
    for i, data in enumerate([data1, data2]):
        for value in unique:
            values[i].append(data.count(value))
    return values
