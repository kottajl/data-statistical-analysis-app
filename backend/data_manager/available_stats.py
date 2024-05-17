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
