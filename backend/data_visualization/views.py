import os
import uuid
import numpy as np
import pandas as pd
from django.http import FileResponse
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from data_manager.stats_1d_functions import convert_data
from data_visualization.plots_functions import draw_plot_1d


@api_view(["POST"])
def create_plot(request):
    if request.method == "POST":
        try:
            if "data[]" in request.data and "data_types[]" in request.data and "variable_names[]" in request.data and "plot_type" in request.data:
                string_data, ID = request.data.getlist("data[]"), request.data.getlist("ID[]")
                for i in range(len(string_data)):
                    string_data[i] = string_data[i].split(",")
                data_types, variable_names = request.data.getlist("data_types[]"), request.data.getlist("variable_names[]")
                print(data_types)
                plot_type, ID_type = request.data["plot_type"], request.data.get("ID_type")
                plot_data = [[convert_data(value) for value in data_series] if type == "numerical" else data_series for
                             type, data_series in zip(data_types, string_data)]
                df = pd.DataFrame(data=np.transpose(plot_data), columns=variable_names)
                if len(ID) > 0 and ID_type is not None:
                    df["ID"] = [convert_data(value) for value in ID] if ID_type == "numerical" else ID
                buffer = draw_plot_1d(df, plot_type)
                return FileResponse(buffer, as_attachment=True, filename="plot-" + str(uuid.uuid4()) + ".png",
                                    status=status.HTTP_200_OK)
            raise Exception("Invalid data")
        except Exception as e:
            return Response(data=dict(detail=str(e)), status=status.HTTP_400_BAD_REQUEST)



