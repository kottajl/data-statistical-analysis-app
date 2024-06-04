import io

import matplotlib
import pandas as pd

matplotlib.use('Agg')
import matplotlib.pyplot as plt
import distinctipy
import seaborn as sns


def draw_plot_2d(df: pd.DataFrame, plot_type: str, ID_variable: str = None):
    match plot_type:
        case "scatter":
            return plot_scatter(df, ID_variable)
        case "linear":
            return plot_linear(df, ID_variable)
        case "heatmap":
            return plot_heatmap(df)
        case "bar":
            return plot_bar(df, ID_variable)
        case "boxplot":
            return plot_boxplot(df, ID_variable)
        case "2Y_axis":
            return plot_2Y_axis(df, ID_variable)
        case _:
            raise ValueError(f"Unrecognized plot type: {plot_type}")


def plot_scatter(df: pd.DataFrame, ID_variable: str):
    if ID_variable not in df.columns:
        raise ValueError("ID_variable not sent.")
    plot = plt.figure(figsize=(12, 8))
    plt.subplots_adjust(right=0.75)
    for column in df.columns:
        if column == ID_variable:
            continue
        sns.scatterplot(data=df, x=df[ID_variable], y=df[column], label=column)
    plt.title("Scatter Plot 2d")
    plt.xlabel(ID_variable)
    plt.ylabel("Values")
    plt.legend(loc='center left', bbox_to_anchor=(1, 0.75))
    plt.grid(True)
    plt.tight_layout(pad=7.0)
    return get_plot_file(plot)


def plot_linear(df: pd.DataFrame, ID_variable: str):
    if ID_variable not in df.columns:
        raise ValueError("ID_variable not sent.")
    plot = plt.figure(figsize=(12, 8))
    plt.subplots_adjust(right=0.75)
    for column in df.columns:
        if column == ID_variable:
            continue
        sns.lineplot(data=df, x=ID_variable, y=column, label=column)
    plt.title("Linear Plot 2d")
    plt.xlabel(ID_variable)
    plt.ylabel("Values")
    plt.legend(loc='center left', bbox_to_anchor=(1, 0.75))
    plt.grid(True)
    plt.tight_layout(pad=7.0)
    return get_plot_file(plot)


def plot_heatmap(df: pd.DataFrame):
    plt.figure(figsize=(10, 9))
    plt.title("Heatmap")
    plot = sns.heatmap(df.corr(), cmap="YlGnBu", annot=True).get_figure()
    plot.tight_layout(pad=15.0)
    return get_plot_file(plot)


def plot_bar(df: pd.DataFrame, ID_variable: str):
    if ID_variable not in df.columns:
        raise ValueError("ID_variable not sent.")
    columns_number = len(df.columns) - 1
    fig, axs = plt.subplots(columns_number, figsize=(10, 6 * columns_number))
    plt.subplots_adjust(right=0.75)
    for i, column in enumerate([value for value in df.columns if value != ID_variable]):
        if columns_number == 1:
            ax = axs
        else:
            ax = axs[i]
        sns.barplot(data=df, x=ID_variable, y=column, label=column, ax=ax)
        ax.legend(loc='center left', bbox_to_anchor=(1, 0.75))
        ax.set_xlabel("Categories")
        ax.set_ylabel("Values")
        ax.grid(axis="y")
    fig.tight_layout(pad=7.0)
    return get_plot_file(fig)


def plot_boxplot(df: pd.DataFrame, ID_variable: str):
    if ID_variable not in df.columns:
        raise ValueError("ID_variable not sent.")
    columns_number = len(df.columns) - 1
    fig, axs = plt.subplots(columns_number, figsize=(10, 6 * columns_number))
    plt.subplots_adjust(right=0.75)
    for i, column in enumerate([value for value in df.columns if value != ID_variable]):
        if columns_number == 1:
            ax = axs
        else:
            ax = axs[i]
        sns.boxplot(data=df, x=ID_variable, y=column, ax=ax, label=column)
        ax.grid(axis="x")
        ax.legend(loc='center left', bbox_to_anchor=(1, 0.75))
    fig.tight_layout(pad=7.0)
    return get_plot_file(fig)


def plot_2Y_axis(df: pd.DataFrame, ID_variable: str):
    if ID_variable not in df.columns:
        raise ValueError("ID_variable not sent.")
    fig, ax1 = plt.subplots(figsize=(14, 11))
    plt.subplots_adjust(right=0.75)
    column1, column2 = [value for value in df.columns if value != ID_variable][:2]
    color1, color2 = distinctipy.get_colors(2)
    sns.lineplot(data=df, x=ID_variable, y=column1, ax=ax1, color=color1, label=column1)
    ax2 = ax1.twinx()
    sns.lineplot(data=df, x=ID_variable, y=column2, ax=ax2, color=color2, label=column2)
    fig.tight_layout(pad=15.0)
    ax1.legend(loc='center left', bbox_to_anchor=(1, 0.75))
    ax2.legend(loc='center left', bbox_to_anchor=(1, 0.70))

    return get_plot_file(fig)


def get_plot_file(plot):
    buffer = io.BytesIO()
    plot.savefig(buffer, format='png')
    buffer.seek(0)
    return buffer
