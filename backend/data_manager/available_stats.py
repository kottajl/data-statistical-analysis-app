# Additional: mode, precentile, missing values
import numpy as np
from scipy import stats

numpy_stats_1d = [
    "mean",
    "median",
    "std",
    "min",
    "max",
    "unique"
]

scipy_stats_1d = [
    "iqr",
    "skew",
    "kurtosis"
]

numpy_functions = {func: getattr(np, func) for func in numpy_stats_1d}
scipy_functions = {func: getattr(stats, func) for func in scipy_stats_1d}



numerical_stats_2d = [
    "pearsonr",
    "spearmanr"
]

categorical_stats_2d = [
    "chisquare"
]

numerical_categorical_stats_2d = [
    "f_oneway"
]



numerical_functions_2d = {func: getattr(stats, func) for func in numerical_stats_2d}
categorical_functions_2d = {func: getattr(stats, func) for func in categorical_stats_2d}
numerical_categorical_functions_2d = {func: getattr(stats, func) for func in numerical_categorical_stats_2d}

