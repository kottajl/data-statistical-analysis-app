import os
from backend.settings import FILES_URL


def get_file_url(destination: str) -> str:
    directory_path = str(os.path.join(FILES_URL, destination))
    if os.path.exists(directory_path) and len(os.listdir(directory_path)) == 1:
        return str(os.path.join(directory_path, os.listdir(directory_path)[0]))
    return ""



