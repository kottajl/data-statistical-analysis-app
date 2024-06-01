import os
import uuid
import numpy as np
import pandas as pd
from django.http import FileResponse
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from data_manager.missing_values_functions import complete_missing_values, replace_outliers_to_nan
from data_manager.stats_1d_functions import convert_data, calculate_numerical_stats, get_numerical_stats, \
    get_categorical_stats

from data_manager.stats_2d_functions import get_stats
from data_manager.functions import normal_test, statistical_significance_test


@api_view(["POST"])
def fill_missing_values(request):
    if request.method == "POST":
        try:
            if "data[]" in request.data and "method" in request.data:
                string_data, method = request.data.getlist("data[]"), request.data["method"]
                if method == "constant" and "constant" not in request.data:
                    raise Exception("Invalid data")
                variable = "Variable"
                df = pd.DataFrame([convert_data(value) for value in string_data], columns=[variable])
                complete_missing_values(df, variable, method, request.data.get("constant"))
                return Response(data=dict(data=df[variable].to_list()), status=status.HTTP_200_OK)
            raise Exception("Invalid data")
        except Exception as e:
            return Response(data=dict(detail=str(e)), status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
def replace_outliers(request):
    if request.method == "POST":
        try:
            if "data[]" in request.data:
                string_data = request.data.getlist("data[]")
                variable = "Variable"
                df = pd.DataFrame([convert_data(value) for value in string_data], columns=[variable])
                replace_outliers_to_nan(df, variable)

                return Response(data=dict(data=[str(value) for value in df[variable].to_list()]),
                                status=status.HTTP_200_OK)
            raise Exception("Invalid data")
        except Exception as e:
            return Response(data=dict(detail=str(e)), status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
def stats_1d(request):
    if request.method == "POST":
        if "functions[]" not in request.data or "data[]" not in request.data:
            return Response(data=dict(detail="Cannot find functions or data"), status=status.HTTP_400_BAD_REQUEST)
        functions = request.data.getlist("functions[]")
        string_data = request.data.getlist("data[]")
        if len(functions) == 0:
            return Response(data=dict(detail="Must choose at least one function"), status=status.HTTP_400_BAD_REQUEST)
        if len(string_data) == 0:
            return Response(data=dict(detail="Must give at least one data"), status=status.HTTP_400_BAD_REQUEST)

        if not request.data.__contains__("type") or request.data["type"] == "numerical":
            all_data = np.array([convert_data(value) for value in string_data])
            if all(np.isnan(element) for element in all_data):
                return Response(data=dict(detail="Must give at least one data"), status=status.HTTP_400_BAD_REQUEST)

            results = get_numerical_stats(functions, all_data)
        elif request.data["type"] == 'categorical':
            all_data = [data if data != "null" else None for data in string_data]
            if all([element is None for element in all_data]):
                return Response(data=dict(detail="Must give at least one data"), status=status.HTTP_400_BAD_REQUEST)

            results = get_categorical_stats(functions, all_data)
        else:
            return Response(data=dict(detail="Wrong type (must be numerical or categorical)"),
                            status=status.HTTP_400_BAD_REQUEST)
        return Response(data=results, status=status.HTTP_200_OK)


@api_view(["POST"])
def check_normal_test(request):
    if request.method == "POST":
        try:
            if "data[]" in request.data:
                string_data = request.data.getlist("data[]")
                list_data = [convert_data(value) for value in string_data]

                return Response(data=dict(data=normal_test(list_data)), status=status.HTTP_200_OK)
            raise Exception("Invalid data")
        except Exception as e:
            return Response(data=dict(detail=str(e)), status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
def check_statistical_significance_test(request):
    if request.method == "POST":
        try:
            if "data[]" in request.data:
                string_data = request.data.getlist("data[]")
                for i in range(len(string_data)):
                    string_data[i] = string_data[i].split(",")
                if len(string_data) != 2:
                    raise Exception("Invalid data")
                data1, data2 = [[convert_data(value) for value in data] for data in string_data]

                return Response(data=dict(data=statistical_significance_test(data1, data2)), status=status.HTTP_200_OK)
            raise Exception("Invalid data")
        except Exception as e:
            return Response(data=dict(detail=str(e)), status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
def stats_2d(request):
    if request.method == "POST":
        if "functions[]" not in request.data or "data[]" not in request.data or "data_types[]" not in request.data:
            return Response(data=dict(detail="Cannot find functions or data or data_types"), status=status.HTTP_400_BAD_REQUEST)

        functions = request.data.getlist("functions[]")
        string_data = request.data.getlist("data[]")
        for i in range(len(string_data)):
            string_data[i] = string_data[i].split(",")
        data_types = request.data.getlist("data_types[]")

        if len(functions) == 0:
            return Response(data=dict(detail="Must choose at least one function"), status=status.HTTP_400_BAD_REQUEST)
        if len(string_data) != 2 or len(data_types) != 2:
            return Response(data=dict(detail="Arrays of data and data types must have a length of 2"), status=status.HTTP_400_BAD_REQUEST)

        all_data = [[convert_data(value) for value in data_series] if type == "numerical" else data_series for
                         type, data_series in zip(data_types, string_data)]

        results = get_stats(functions, all_data, data_types)

        return Response(data=results, status=status.HTTP_200_OK)



