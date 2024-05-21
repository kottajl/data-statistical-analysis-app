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
    plot = plt.figure(figsize=(12, 8))
    plt.subplots_adjust(right=0.75)
    columns = [col for col in df.columns if col != 'ID']
    plt.hist([df[column] for column in columns], 30, label=columns)
    plt.title("Histogram")
    plt.xlabel("Wartości")
    plt.ylabel("Częstości")
    plt.legend(loc='center left', bbox_to_anchor=(1, 0.75))
    plt.grid(True)
    return get_plot_file(plot)


def plot_bar(df: pd.DataFrame):
    if "ID" not in df.columns:
        raise ValueError("ID not sent.")
    plot = plt.figure(figsize=(14, 8))
    plt.subplots_adjust(right=0.75)
    n_bars = len(df.columns) - 1
    bar_width = 0.8 / n_bars
    single_width = 1
    colors = distinctipy.get_colors(n_bars)

    X_values = df["ID"] if df["ID"].dtypes != "object" else np.arange(len(df["ID"]))
    for i, column in enumerate([value for value in df.columns if value != "ID"]):
        x_offset = (i - n_bars / 2) * bar_width + bar_width / 2

        j = 0
        for x, y in zip(X_values, df[column]):
            if j == 0:
                plt.bar(x + x_offset, y, width=bar_width * single_width, color=colors[i % len(colors)], label=column)
            else:
                plt.bar(x + x_offset, y, width=bar_width * single_width, color=colors[i % len(colors)])
            j += 1

    if df["ID"].dtypes == "object":
        plt.xticks(X_values, df["ID"])
    plt.title("Wykres kolumnowy")
    plt.xlabel("ID")
    plt.ylabel("Wartości")
    plt.legend(loc='center left', bbox_to_anchor=(1, 0.75))
    plt.grid(axis="y")
    return get_plot_file(plot)


def plot_pie_chart(df: pd.DataFrame):
    column_len = len(df.columns) - 1
    fig, axs = plt.subplots(len(df.columns) - 1, figsize=(12, 5 * column_len))
    plt.subplots_adjust(right=0.75)
    for i, column in enumerate([value for value in df.columns if value != "ID"]):
        ax = axs[i]
        value_count = df[column].value_counts()
        ax.pie(value_count, labels=value_count.index, colors=distinctipy.get_colors(len(value_count)),
               autopct='%1.1f%%', startangle=90)
        ax.set_title(f"Wykres kołowy dla {column}")
        ax.axis("equal")
        ax.legend(loc='center left', bbox_to_anchor=(1, 0.5))
        ax.grid(True)
    return get_plot_file(fig)


def plot_boxplot(df: pd.DataFrame):
    plot = plt.figure(figsize=(12, 8))
    plt.subplots_adjust(right=0.75)
    columns = [col for col in df.columns if col != 'ID']
    plt.boxplot([df[column] for column in columns], labels=columns)
    plt.title("Wykres pudełkowy")
    plt.ylabel("Wartości")
    plt.grid(True)
    return get_plot_file(plot)


def get_plot_file(plot):
    buffer = io.BytesIO()
    plot.savefig(buffer, format='png')
    buffer.seek(0)
    return buffer
