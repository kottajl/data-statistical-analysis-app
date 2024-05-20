import os

import numpy as np
import uuid

import pandas as pd
from django.http import FileResponse
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from scipy.stats import stats

from backend.settings import FILES_URL
from data_manager.functions import get_file_url, calculate_stats, load_to_dataframe, save_from_dataframe

from data_manager.missing_values_functions import complete_missing_values,replace_outliers_to_nan
import uuid
from data_manager.functions import get_file_url, calculate_stats, convert_data


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
            if "data[]" in request.data and request.data and "method" in request.data and "outliers" in request.data:
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
        all_data = np.array([convert_data(value) for value in string_data])
        num_data = all_data[np.logical_not(np.isnan(all_data))]
        results = dict()
        for function in functions:
            if function == "mode":
                # return only one value
                results[function] = stats.mode(num_data).mode
            elif function == "precentile":
                quartiles = np.percentile(num_data, [25, 50, 75])
                results["quartile25"] = quartiles[0]
                results["quartile50"] = quartiles[1]
                results["quartile75"] = quartiles[2]
            elif function == "missing":
                results["missing"] = np.isnan(all_data).sum()
            else:
                results[function] = calculate_stats(function, num_data)
        return Response(data=results, status=status.HTTP_200_OK)
