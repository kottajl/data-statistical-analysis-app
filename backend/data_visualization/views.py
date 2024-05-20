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
            if "data[]" in request.data and "plot_type" in request.data and "data_type" in request.data:
                string_data, ID = request.data.getlist("data[]"), request.data.getlist("ID[]")
                plot_type, data_type, ID_type = request.data["plot_type"], request.data["data_type"], request.data.get(
                    "ID_type")
                plot_data = [convert_data(value) for value in string_data] if data_type == "numerical" else string_data
                plot_ID = None
                if len(ID) > 0 and ID_type is not None:
                    plot_ID = [convert_data(value) for value in ID] if ID_type == "numerical" else ID
                series = pd.Series(plot_data, index=plot_ID)
                buffer = draw_plot_1d(series, plot_type, len(ID) > 0)
                return FileResponse(buffer, as_attachment=True, filename="plot-" + str(uuid.uuid4()) + ".png",
                                    status=status.HTTP_200_OK)
            raise Exception("Invalid data")
        except Exception as e:
            return Response(data=dict(detail=str(e)), status=status.HTTP_400_BAD_REQUEST)
