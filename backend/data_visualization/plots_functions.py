import io

import pandas as pd
import matplotlib

matplotlib.use('Agg')
import matplotlib.pyplot as plt


def draw_plot_1d(series: pd.Series, plot_type: str, ID_exists: bool):
    match plot_type:
        case "scatter":
            return plot_scatter(series, ID_exists)
        case "linear":
            return plot_linear(series, ID_exists)
        case "hist":
            return plot_histogram(series)
        case "bar":
            return plot_bar(series, ID_exists)
        case "pie_chart":
            return plot_pie_chart(series, ID_exists)
        case "boxplot":
            return plot_boxplot(series)
        case _:
            raise ValueError(f"Unrecognized plot type: {plot_type}")


def plot_scatter(series: pd.Series, ID_exists: bool):
    if not ID_exists:
        raise ValueError("ID not sent.")
    plot = plt.figure(figsize=(10, 8))
    plt.scatter(series.index, series.values, label='Punkty')
    plt.title("Wykres punktowy")
    plt.xlabel("ID")
    plt.ylabel("Wartości")
    plt.legend()
    plt.grid(True)
    return get_plot_file(plot)


def plot_linear(series: pd.Series, ID_exists: bool):
    if not ID_exists:
        raise ValueError("ID not sent.")
    plot = plt.figure(figsize=(10, 8))
    plt.plot(series.index, series.values, label='Wykres')
    plt.title("Wykres liniowy")
    plt.xlabel("ID")
    plt.ylabel("Wartości")
    plt.legend()
    plt.grid(True)
    return get_plot_file(plot)


def plot_histogram(series: pd.Series):
    plot = plt.figure(figsize=(10, 8))
    plt.hist(series.values, bins=25, edgecolor='black')
    plt.title("Histogram")
    plt.xlabel("Wartość")
    plt.ylabel("Częstość")
    plt.grid(True)
    return get_plot_file(plot)


def plot_bar(series: pd.Series, ID_exists: bool):
    if not ID_exists:
        raise ValueError("ID not sent.")
    plot = plt.figure(figsize=(10, 8))
    plt.bar(series.index, series.values, color='skyblue')
    plt.title("Wykres kolumnowy")
    plt.xlabel("ID")
    plt.ylabel("Wartości")
    plt.grid(axis="y")
    return get_plot_file(plot)


def plot_pie_chart(series: pd.Series, ID_exists: bool):
    if not ID_exists:
        raise ValueError("ID not sent.")
    plot = plt.figure(figsize=(10, 8))
    plt.pie(series.values, labels=series.index, autopct='%1.1f%%', startangle=90)
    plt.title("Wykres kołowy")
    plt.axis("equal")
    plt.legend()
    return get_plot_file(plot)


def plot_boxplot(series: pd.Series):
    plot = plt.figure(figsize=(10, 8))
    plt.boxplot(series.values)
    plt.title("Wykres pudełkowy")
    plt.ylabel("Wartość")
    plt.grid(True)
    return get_plot_file(plot)


def get_plot_file(plot):
    buffer = io.BytesIO()
    plot.savefig(buffer, format='png')
    buffer.seek(0)
    return buffer
