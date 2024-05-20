import os
import uuid
import numpy as np
import pandas as pd
from django.http import FileResponse
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from backend.settings import FILES_URL
from data_manager.missing_values_functions import complete_missing_values,replace_outliers_to_nan
from data_manager.functions import get_file_url
from data_manager.stats_1d_functions import convert_data, calculate_numerical_stats, get_numerical_stats, \
    get_categorical_stats


@api_view(["POST"])
def data_import(request):
    if request.method == "POST":
        if "file" in request.FILES:
            file = request.FILES.get('file')
            if not file.name.endswith('.csv'):
                return Response(data=dict(detail="Invalid file format"), status=status.HTTP_400_BAD_REQUEST)
            files_identifiers = set(os.listdir(FILES_URL))
            identifier = str(uuid.uuid4())
            while identifier in files_identifiers:
                identifier = str(uuid.uuid4())

            file_directory = os.path.join(FILES_URL, identifier)
            os.mkdir(file_directory)
            with open(os.path.join(file_directory, file.name), 'wb+') as destination:
                for chunk in file.chunks():
                    destination.write(chunk)

            return Response(data=dict(destination=identifier), status=status.HTTP_200_OK)
        return Response(data=dict(detail="File not send"), status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
def data_export(request):
    if request.method == "POST":
        try:
            if "destination" in request.data and isinstance(request.data["destination"], str):
                file_url = get_file_url(request.data["destination"])
                return FileResponse(open(file_url, 'rb'), content_type="text/csv",
                                    as_attachment=True)
            raise Exception("Invalid data")
        except Exception as e:
            return Response(data=dict(detail=str(e)), status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
def fill_missing_values(request):
    if request.method == "POST":
        try:
            if "data[]" in request.data and "method" in request.data and "outliers" in request.data:
                string_data, method, outliers = request.data.getlist("data[]"), request.data["method"], request.data["outliers"]
                if method == "constant" and "constant" not in request.data:
                    raise Exception("Invalid data")
                variable = "Variable"
                df = pd.DataFrame([convert_data(value) for value in string_data], columns=[variable])
                if outliers:
                    replace_outliers_to_nan(df, variable)
                complete_missing_values(df, variable, method, request.data.get("constant"))

                return Response(data=dict(data=df[variable].to_list()), status=status.HTTP_200_OK)
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
            return Response(data=dict(detail="Wrong type (must be numerical or categorical)"), status=status.HTTP_400_BAD_REQUEST)
        return Response(data=results, status=status.HTTP_200_OK)