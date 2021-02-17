from django.contrib import admin
from django.urls import path
from .views import TabletiChartView, TelefoniChartView

app_name = 'app'
urlpatterns = [
    path('tableti/', TabletiChartView.as_view(), name='tableti'),
    path('telefoni/', TelefoniChartView.as_view(), name='telefoni'),
]
