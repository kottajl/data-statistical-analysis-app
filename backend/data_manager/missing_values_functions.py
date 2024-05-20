import numpy as np
import pandas as pd


def fill_nan(df: pd.DataFrame, col: str, value):
    df.loc[:, col] = df.loc[:, col].fillna(value)


def complete_missing_values(df: pd.DataFrame, variable: str, method: str, constant: str = None):

    match method:
        case "mean":
            fill_nan(df, variable, df[variable].mean())
        case "median":
            fill_nan(df, variable, df[variable].median())
        case "constant":
            fill_nan(df, variable, constant)
        case "random":
            fill_nan(df, variable, np.random.choice(df[variable][~df[variable].isnull()].to_numpy()))
        case "before_nan":
            df[variable] = df[variable].ffill()
        case "after_nan":
            df[variable] = df[variable].bfill()
        case _:
            raise ValueError(f"Unrecognized method: {method}")


def replace_outliers_to_nan(df: pd.DataFrame, variable: str):
    if variable not in df.columns:
        raise ValueError(f'Variable {variable} not found in dataframe')

    data = df[variable]
    Q1 = data.quantile(0.25)
    Q3 = data.quantile(0.75)
    IQR = Q3 - Q1
    lower_bound = Q1 - 1.5 * IQR
    upper_bound = Q3 + 1.5 * IQR
    outliers_indices = np.where((data <= lower_bound) | (data >= upper_bound))[0]
    df.loc[outliers_indices, variable] = np.nan























