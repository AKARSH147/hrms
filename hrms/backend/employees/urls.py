"""
URL configuration for employees app.
"""
from django.urls import path
from . import views

app_name = "employees"

urlpatterns = [
    path("employees/", views.EmployeeListCreateView.as_view(), name="employee-list-create"),
    path("employees/<int:pk>/", views.EmployeeDetailView.as_view(), name="employee-detail"),
    path("employees/<int:pk>/attendance/", views.EmployeeAttendanceListView.as_view(), name="employee-attendance-list"),
    path("attendance/", views.AttendanceListCreateView.as_view(), name="attendance-list-create"),
    path("attendance/<int:pk>/", views.AttendanceDetailView.as_view(), name="attendance-detail"),
    path("dashboard/", views.DashboardSummaryView.as_view(), name="dashboard-summary"),
]
