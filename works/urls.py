from django.urls import path
from . import views

urlpatterns = [
    path('', views.HomeView.as_view(), name='home'),
    path('about/', views.AboutView.as_view(), name='about'),
    path('services/', views.ServiceListView.as_view(), name='service_list'),
    path('services/category/<int:category_id>/', views.CategoryDetailView.as_view(), name='category_detail'),
    path('services/<int:pk>/', views.ServiceDetailView.as_view(), name='service_detail'),
]