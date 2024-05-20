from django.urls import path
import data_visualization.views as views


urlpatterns = [
    path('1d/', views.create_plot),
]
