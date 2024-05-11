import os

from django.http import FileResponse
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from backend.settings import FILES_URL
import uuid
from data_manager.functions import get_file_url


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
        if "destination" in request.data and isinstance(request.data["destination"], str) and get_file_url(
                request.data["destination"]) != "":
            return FileResponse(open(get_file_url(request.data["destination"]), 'rb'), content_type="text/csv",
                                as_attachment=True)
        return Response(data=dict(detail="File does not exist"), status=status.HTTP_400_BAD_REQUEST)
