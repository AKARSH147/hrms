import { useState, useEffect } from 'react';
import { api } from '../api';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api.getDashboard()
      .then((res) => {
        if (!cancelled && res.success) setData(res.data);
      })
      .catch((err) => { if (!cancelled) setError(err.message || 'Failed to load dashboard'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (loading) return <div className="page-title">Loading...</div>;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!data) return null;

  const { total_employees, total_attendance_records, total_present_days, employees_present_summary } = data;

  return (
    <>
      <h1 className="page-title">Dashboard</h1>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="value">{total_employees}</div>
          <div className="label">Total Employees</div>
        </div>
        <div className="stat-card">
          <div className="value">{total_attendance_records}</div>
          <div className="label">Attendance Records</div>
        </div>
        <div className="stat-card">
          <div className="value">{total_present_days}</div>
          <div className="label">Total Present Days</div>
        </div>
      </div>
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Name</th>
                <th>Department</th>
                <th>Present Days</th>
              </tr>
            </thead>
            <tbody>
              {employees_present_summary && employees_present_summary.length > 0 ? (
                employees_present_summary.map((emp) => (
                  <tr key={emp.id}>
                    <td>{emp.employee_id}</td>
                    <td>{emp.full_name}</td>
                    <td>{emp.department}</td>
                    <td>{emp.present_days}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="empty-state">
                    <p>No attendance data yet</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
