from django.shortcuts import render
from .models import Tablet, Telefon
from django.views.generic import TemplateView

class TabletiChartView(TemplateView):
    template_name = 'tableti/chart.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["qs"] = Tablet.objects.all()
        return context

class TelefoniChartView(TemplateView):
    template_name = 'telefoni/chart.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["qs"] = Telefon.objects.all()
        return context