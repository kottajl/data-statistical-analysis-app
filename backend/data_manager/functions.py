import numpy as np
import pandas as pd
from scipy.stats import normaltest, ttest_ind, chi2_contingency, f_oneway

from data_manager.stats_2d_functions import get_value_count

from data_manager.stats_2d_functions import get_values_categories


def normal_test(data):
    statistic, p_value = normaltest(data)
    return dict(statistic=statistic, p_value=p_value)


def statistical_significance_test(all_data, data_types):
    data1, data2 = all_data
    results = dict()
    if data_types.__contains__("numerical") and data_types.__contains__("categorical"):
        numerical_data, categorical_data = all_data[data_types.index("numerical")], all_data[
            data_types.index("categorical")]
        statistic, p_value = f_oneway(*get_values_categories(numerical_data, categorical_data))
        results = dict(statistic=statistic, p_value=p_value)

    elif data_types.count("numerical") == 2:
        statistic, p_value = ttest_ind(data1, data2)
        results = dict(statistic=statistic, p_value=p_value)

    elif data_types.count("categorical") == 2:
        statistic, p_value, _, _ = chi2_contingency(np.array(get_value_count(data1, data2)))
        results = dict(statistic=statistic, p_value=p_value)

    return results
