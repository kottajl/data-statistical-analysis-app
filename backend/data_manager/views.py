import os

import numpy as np
import uuid
from django.http import FileResponse
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from backend.settings import FILES_URL
from data_manager.functions import get_file_url, calculate_stats, load_to_dataframe, save_from_dataframe

from data_manager.missing_values_functions import complete_missing_values,replace_outliers_to_nan


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
            if "destination" in request.data and isinstance(request.data["destination"],
                                                            str) and "variable" in request.data and "method" in request.data and "outliers" in request.data:
                destination = request.data["destination"]
                variable, method, outliers = request.data["variable"], request.data["method"], request.data["outliers"]
                df = load_to_dataframe(destination)
                if outliers:
                    replace_outliers_to_nan(df, variable)
                complete_missing_values(df, variable, method, request.data.get("constant"))
                save_from_dataframe(destination, df)

                return Response(data=dict(detail="Variable updated"), status=status.HTTP_200_OK)
            raise Exception("Invalid data")
        except Exception as e:
            return Response(data=dict(detail=str(e)), status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
def stats_1d(request):
    # parameters = dict()
    functions = request.GET.getlist("functions[]")
    string_data = request.GET.getlist("data[]")
    data = np.array(string_data, dtype=float)
    results = dict()
    for function in functions:
        results[function] = calculate_stats(function, data)
    return Response(data=results, status=status.HTTP_200_OK)
