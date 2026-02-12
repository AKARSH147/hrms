"""
Serializers with validation for Employee and Attendance.
"""
import re
from rest_framework import serializers
from .models import Employee, Attendance, AttendanceStatus


class EmployeeSerializer(serializers.ModelSerializer):
    """Serializer for Employee with email and duplicate validation."""

    class Meta:
        model = Employee
        fields = ["id", "employee_id", "full_name", "email", "department", "created_at"]
        read_only_fields = ["id", "created_at"]

    def validate_email(self, value):
        value = (value or "").strip().lower()
        if not value:
            raise serializers.ValidationError("Email is required.")
        if not re.match(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$", value):
            raise serializers.ValidationError("Enter a valid email address.")
        return value

    def validate_employee_id(self, value):
        value = (value or "").strip()
        if not value:
            raise serializers.ValidationError("Employee ID is required.")
        return value

    def validate_full_name(self, value):
        value = (value or "").strip()
        if not value:
            raise serializers.ValidationError("Full name is required.")
        return value

    def validate_department(self, value):
        value = (value or "").strip()
        if not value:
            raise serializers.ValidationError("Department is required.")
        return value

    def create(self, validated_data):
        if Employee.objects.filter(employee_id=validated_data["employee_id"]).exists():
            raise serializers.ValidationError(
                {"employee_id": "An employee with this Employee ID already exists."}
            )
        if Employee.objects.filter(email__iexact=validated_data["email"]).exists():
            raise serializers.ValidationError(
                {"email": "An employee with this email already exists."}
            )
        return super().create(validated_data)

    def update(self, instance, validated_data):
        eid = validated_data.get("employee_id", instance.employee_id)
        if (
            Employee.objects.filter(employee_id=eid)
            .exclude(pk=instance.pk)
            .exists()
        ):
            raise serializers.ValidationError(
                {"employee_id": "An employee with this Employee ID already exists."}
            )
        email = validated_data.get("email", instance.email)
        if (
            Employee.objects.filter(email__iexact=email)
            .exclude(pk=instance.pk)
            .exists()
        ):
            raise serializers.ValidationError(
                {"email": "An employee with this email already exists."}
            )
        return super().update(instance, validated_data)


class AttendanceSerializer(serializers.ModelSerializer):
    """Serializer for Attendance with date and status validation."""

    employee_id_display = serializers.CharField(
        source="employee.employee_id", read_only=True
    )
    employee_name = serializers.CharField(source="employee.full_name", read_only=True)

    class Meta:
        model = Attendance
        fields = [
            "id",
            "employee",
            "employee_id_display",
            "employee_name",
            "date",
            "status",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]

    def validate_status(self, value):
        value = (value or "").strip().lower()
        if value not in (AttendanceStatus.PRESENT, AttendanceStatus.ABSENT):
            raise serializers.ValidationError(
                "Status must be 'present' or 'absent'."
            )
        return value

    def validate(self, attrs):
        employee = attrs.get("employee")
        date = attrs.get("date")
        instance = self.instance
        if employee and date:
            qs = Attendance.objects.filter(employee=employee, date=date)
            if instance:
                qs = qs.exclude(pk=instance.pk)
            if qs.exists():
                raise serializers.ValidationError(
                    {"date": "Attendance for this employee on this date already exists."}
                )
        return attrs


class AttendanceCreateSerializer(serializers.ModelSerializer):
    """Minimal serializer for creating/updating attendance (no nested display)."""

    class Meta:
        model = Attendance
        fields = ["id", "employee", "date", "status", "created_at"]
        read_only_fields = ["id", "created_at"]

    def validate_status(self, value):
        value = (value or "").strip().lower()
        if value not in (AttendanceStatus.PRESENT, AttendanceStatus.ABSENT):
            raise serializers.ValidationError(
                "Status must be 'present' or 'absent'."
            )
        return value

    def validate(self, attrs):
        employee = attrs.get("employee")
        date = attrs.get("date")
        instance = self.instance
        if employee and date:
            qs = Attendance.objects.filter(employee=employee, date=date)
            if instance:
                qs = qs.exclude(pk=instance.pk)
            if qs.exists():
                raise serializers.ValidationError(
                    {"date": "Attendance for this employee on this date already exists."}
                )
        return attrs
