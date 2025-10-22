from django.urls import path
from .views import ModelInspectView, ProcessCreateView, ProcessDataView, ProcessRetrieveView

urlpatterns = [
    path('processes/', ProcessCreateView.as_view(), name='process_create'),
    path('processes/<int:pk>/process_data/', ProcessDataView.as_view(), name='process_data'),
    path('processes/<int:pk>/', ProcessRetrieveView.as_view(), name='process_retrieve'),
    path('inspect-models/', ModelInspectView.as_view(), name='inspect_models'),
]