from django.urls import path
import data_manager.views as views


urlpatterns = [
    path('import/', views.data_import),
    path('export/', views.data_export),
]
