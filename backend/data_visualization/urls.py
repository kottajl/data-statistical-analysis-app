from django.urls import path
import data_visualization.views as views


urlpatterns = [
    path('1d/', views.create_plot_2d),
    path('2d/', views.create_plot_2d),
]
