"""
URL configuration for HRMS Lite project.
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("employees.urls")),
]
