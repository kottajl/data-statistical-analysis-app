from django.urls import path
import data_manager.views as views


urlpatterns = [
    path('missing_values/', views.fill_missing_values),
    path('replace_outliers/', views.replace_outliers),
    path('1d_stats/', views.stats_1d),
    path('2d_stats/', views.stats_2d),
    path('normal_test/', views.check_normal_test),
    path('statistical_significance_test/', views.check_statistical_significance_test),
]
