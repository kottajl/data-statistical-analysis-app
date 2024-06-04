import io

import numpy as np
import pandas as pd
import matplotlib

matplotlib.use('Agg')
import matplotlib.pyplot as plt
import distinctipy


def draw_plot_1d(df: pd.DataFrame, plot_type: str):
    match plot_type:
        case "scatter":
            return plot_scatter(df)
        case "linear":
            return plot_linear(df)
        case "hist":
            return plot_histogram(df)
        case "bar":
            return plot_bar(df)
        case "pie_chart":
            return plot_pie_chart(df)
        case "boxplot":
            return plot_boxplot(df)
        case _:
            raise ValueError(f"Unrecognized plot type: {plot_type}")


def plot_scatter(df: pd.DataFrame):
    if "ID" not in df.columns:
        raise ValueError("ID not sent.")
    plot = plt.figure(figsize=(12, 8))
    plt.subplots_adjust(right=0.75)
    for column in df.columns:
        if column == "ID":
            continue
        plt.scatter(df["ID"], df[column], label=column)
    plt.title("Wykres punktowy")
    plt.xlabel("ID")
    plt.ylabel("Wartości")
    plt.legend(loc='center left', bbox_to_anchor=(1, 0.75))
    plt.grid(True)
    return get_plot_file(plot)


def plot_linear(df: pd.DataFrame):
    if "ID" not in df.columns:
        raise ValueError("ID not sent.")
    plot = plt.figure(figsize=(12, 8))
    plt.subplots_adjust(right=0.75)
    for column in df.columns:
        if column == "ID":
            continue
        plt.plot(df["ID"], df[column], label=column)
    plt.title("Wykres liniowy")
    plt.xlabel("ID")
    plt.ylabel("Wartości")
    plt.legend(loc='center left', bbox_to_anchor=(1, 0.75))
    plt.grid(True)
    return get_plot_file(plot)


def plot_histogram(df: pd.DataFrame):
    columns_number = len(df.columns) if "ID" not in df.columns else len(df.columns) - 1
    fig, axs = plt.subplots(columns_number, figsize=(10, 5 * columns_number))
    plt.subplots_adjust(right=0.75)
    for i, column in enumerate([value for value in df.columns if value != "ID"]):
        if columns_number == 1:
            ax = axs
        else:
            ax = axs[i]
        ax.hist(df[column], 30, label=column, edgecolor='black')
        ax.set_xlabel("Values")
        ax.set_ylabel("Frequencies")
        ax.set_title(f"{column}")
        ax.legend(loc='center left', bbox_to_anchor=(1, 0.75))
        ax.grid(axis="y")
    fig.tight_layout(pad=7.0)
    return get_plot_file(fig)


def plot_bar(df: pd.DataFrame):
    columns_number = len(df.columns) if "ID" not in df.columns else len(df.columns) - 1
    fig, axs = plt.subplots(columns_number, figsize=(10, 6 * columns_number))
    plt.subplots_adjust(right=0.75)
    for i, column in enumerate([value for value in df.columns if value != "ID"]):
        if columns_number == 1:
            ax = axs
        else:
            ax = axs[i]
        value_count = df[column].value_counts()
        ax.bar(value_count.index, value_count, color=distinctipy.get_colors(len(value_count)), label=value_count.index)
        ax.set_title(f"{column}", pad=20)
        ax.legend(loc='center left', bbox_to_anchor=(1, 0.5))
        ax.set_xlabel("Categories")
        ax.set_ylabel("Values")
        ax.grid(axis="y")
    fig.tight_layout(pad=7.0)
    return get_plot_file(fig)


def plot_pie_chart(df: pd.DataFrame):
    columns_number = len(df.columns) if "ID" not in df.columns else len(df.columns) - 1
    fig, axs = plt.subplots(columns_number, figsize=(12, 6 * columns_number))
    plt.subplots_adjust(right=0.75)
    for i, column in enumerate([value for value in df.columns if value != "ID"]):
        if columns_number == 1:
            ax = axs
        else:
            ax = axs[i]
        value_count = df[column].value_counts()
        ax.pie(value_count, labels=value_count.index, colors=distinctipy.get_colors(len(value_count)),
               autopct='%1.1f%%', startangle=90)
        ax.set_title(f"{column}", pad=20)
        ax.axis("equal")
        ax.legend(loc='center left', bbox_to_anchor=(1, 0.5))
        ax.grid(True)
    return get_plot_file(fig)


def plot_boxplot(df: pd.DataFrame):
    columns_number = len(df.columns) if "ID" not in df.columns else len(df.columns) - 1
    fig, axs = plt.subplots(columns_number, figsize=(8, 5 * columns_number))
    for i, column in enumerate([value for value in df.columns if value != "ID"]):
        if columns_number == 1:
            ax = axs
        else:
            ax = axs[i]
        ax.boxplot(df[column], vert=0)
        ax.set_title(f"{column}", pad=20)
        ax.grid(axis="x")
    fig.tight_layout(pad=7.0)
    return get_plot_file(fig)


def get_plot_file(plot):
    buffer = io.BytesIO()
    plot.savefig(buffer, format='png')
    buffer.seek(0)
    return buffer
