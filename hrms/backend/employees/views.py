"""
REST API views for Employee and Attendance management.
"""
from typing import Optional

from django.db.models import Count, Q
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework.serializers import ValidationError

from .models import Employee, Attendance, AttendanceStatus
from .serializers import (
    EmployeeSerializer,
    AttendanceSerializer,
    AttendanceCreateSerializer,
)


class EmployeeListCreateView(APIView):
    """List all employees and create a new employee."""

    def get(self, request: Request) -> Response:
        employees = Employee.objects.all()
        serializer = EmployeeSerializer(employees, many=True)
        return Response({"success": True, "data": serializer.data})

    def post(self, request: Request) -> Response:
        serializer = EmployeeSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"success": False, "error": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            serializer.save()
        except ValidationError as e:
            return Response(
                {"success": False, "error": e.detail},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(
            {"success": True, "data": serializer.data},
            status=status.HTTP_201_CREATED,
        )


class EmployeeDetailView(APIView):
    """Retrieve or delete a single employee."""

    @staticmethod
    def _get_employee(pk) -> Optional[Employee]:
        try:
            return Employee.objects.get(pk=pk)
        except Employee.DoesNotExist:
            return None

    def get(self, request: Request, pk: int) -> Response:
        employee = self._get_employee(pk)
        if not employee:
            return Response(
                {"success": False, "error": "Employee not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = EmployeeSerializer(employee)
        return Response({"success": True, "data": serializer.data})

    def delete(self, request: Request, pk: int) -> Response:
        employee = self._get_employee(pk)
        if not employee:
            return Response(
                {"success": False, "error": "Employee not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        employee.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AttendanceListCreateView(APIView):
    """List attendance (optionally by employee and date) and create attendance."""

    def get(self, request: Request) -> Response:
        employee_id = request.query_params.get("employee_id")
        date_from = request.query_params.get("date_from")
        date_to = request.query_params.get("date_to")

        qs = Attendance.objects.select_related("employee").all()

        if employee_id:
            try:
                emp = Employee.objects.get(employee_id=employee_id)
                qs = qs.filter(employee=emp)
            except Employee.DoesNotExist:
                return Response(
                    {"success": False, "error": "Employee not found."},
                    status=status.HTTP_404_NOT_FOUND,
                )
        if date_from:
            qs = qs.filter(date__gte=date_from)
        if date_to:
            qs = qs.filter(date__lte=date_to)

        serializer = AttendanceSerializer(qs, many=True)
        return Response({"success": True, "data": serializer.data})

    def post(self, request: Request) -> Response:
        serializer = AttendanceCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"success": False, "error": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            serializer.save()
        except ValidationError as e:
            return Response(
                {"success": False, "error": e.detail},
                status=status.HTTP_400_BAD_REQUEST,
            )
        out = AttendanceSerializer(serializer.instance)
        return Response(
            {"success": True, "data": out.data},
            status=status.HTTP_201_CREATED,
        )


class EmployeeAttendanceListView(APIView):
    """List attendance for a specific employee (by pk)."""

    @staticmethod
    def _get_employee(pk) -> Optional[Employee]:
        try:
            return Employee.objects.get(pk=pk)
        except Employee.DoesNotExist:
            return None

    def get(self, request: Request, pk: int) -> Response:
        employee = self._get_employee(pk)
        if not employee:
            return Response(
                {"success": False, "error": "Employee not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        date_from = request.query_params.get("date_from")
        date_to = request.query_params.get("date_to")

        qs = Attendance.objects.filter(employee=employee)
        if date_from:
            qs = qs.filter(date__gte=date_from)
        if date_to:
            qs = qs.filter(date__lte=date_to)
        qs = qs.order_by("-date")

        serializer = AttendanceSerializer(qs, many=True)
        present_count = qs.filter(status=AttendanceStatus.PRESENT).count()
        return Response({
            "success": True,
            "data": serializer.data,
            "total_present_days": present_count,
        })


class AttendanceDetailView(APIView):
    """Update or delete a single attendance record."""

    @staticmethod
    def _get_attendance(pk) -> Optional[Attendance]:
        try:
            return Attendance.objects.select_related("employee").get(pk=pk)
        except Attendance.DoesNotExist:
            return None

    def get(self, request: Request, pk: int) -> Response:
        att = self._get_attendance(pk)
        if not att:
            return Response(
                {"success": False, "error": "Attendance record not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = AttendanceSerializer(att)
        return Response({"success": True, "data": serializer.data})

    def put(self, request: Request, pk: int) -> Response:
        att = self._get_attendance(pk)
        if not att:
            return Response(
                {"success": False, "error": "Attendance record not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = AttendanceCreateSerializer(att, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(
                {"success": False, "error": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )
        serializer.save()
        out = AttendanceSerializer(serializer.instance)
        return Response({"success": True, "data": out.data})

    def delete(self, request: Request, pk: int) -> Response:
        att = self._get_attendance(pk)
        if not att:
            return Response(
                {"success": False, "error": "Attendance record not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        att.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class DashboardSummaryView(APIView):
    """Bonus: Dashboard summary with counts and total present days per employee."""

    def get(self, request: Request) -> Response:
        total_employees = Employee.objects.count()
        total_attendance_records = Attendance.objects.count()
        present_total = Attendance.objects.filter(
            status=AttendanceStatus.PRESENT
        ).count()

        employees_with_present = (
            Employee.objects.annotate(
                present_days=Count(
                    "attendance_records",
                    filter=Q(attendance_records__status=AttendanceStatus.PRESENT),
                )
            )
            .values("id", "employee_id", "full_name", "department", "present_days")
            .order_by("-present_days")
        )

        return Response({
            "success": True,
            "data": {
                "total_employees": total_employees,
                "total_attendance_records": total_attendance_records,
                "total_present_days": present_total,
                "employees_present_summary": list(employees_with_present),
            },
        })
