import { useState, useEffect } from 'react';
import { api } from '../api';

export default function Attendance() {
  const [employees, setEmployees] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showMarkForm, setShowMarkForm] = useState(false);
  const [markForm, setMarkForm] = useState({
    employee: '',
    date: new Date().toISOString().slice(0, 10),
    status: 'present',
  });
  const [submitError, setSubmitError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [filterEmployeeId, setFilterEmployeeId] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  const loadEmployees = () => {
    api.listEmployees()
      .then((res) => { if (res.success && res.data) setEmployees(res.data); })
      .catch(() => {});
  };

  const loadRecords = () => {
    setLoading(true);
    setError(null);
    const params = {};
    if (filterEmployeeId) params.employee_id = filterEmployeeId;
    if (filterDateFrom) params.date_from = filterDateFrom;
    if (filterDateTo) params.date_to = filterDateTo;
    api.listAttendance(params)
      .then((res) => {
        if (res.success && res.data) setRecords(res.data);
      })
      .catch((err) => {
        // When filtering by employee_id, backend returns 404 if not found; show empty list instead of error
        if (err.status === 404 || (err.message && err.message.includes('Employee not found'))) {
          setRecords([]);
          return;
        }
        setError(err.message || 'Failed to load attendance');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    loadRecords();
  }, [filterEmployeeId, filterDateFrom, filterDateTo]);

  const handleMarkSubmit = (e) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitting(true);
    const payload = {
      employee: Number(markForm.employee),
      date: markForm.date,
      status: markForm.status,
    };
    api.createAttendance(payload)
      .then((res) => {
        if (res.success) {
          setSuccess('Attendance marked.');
          setMarkForm((f) => ({ ...f, date: new Date().toISOString().slice(0, 10), status: 'present' }));
          setShowMarkForm(false);
          loadRecords();
        }
      })
      .catch((err) => {
        const msg = err.body?.error;
        if (typeof msg === 'object') {
          const parts = Object.entries(msg).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`);
          setSubmitError(parts.join(' '));
        } else {
          setSubmitError(err.message || 'Failed to mark attendance');
        }
      })
      .finally(() => setSubmitting(false));
  };

  return (
    <>
      <div className="flex justify-between align-center mb-4">
        <h1 className="page-title" style={{ margin: 0 }}>Attendance</h1>
        <button type="button" className="btn-primary" onClick={() => { setShowMarkForm(true); setSubmitError(null); setSuccess(null); }}>
          Mark Attendance
        </button>
      </div>

      {success && <div className="alert alert-success">{success}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {showMarkForm && (
        <div className="card mb-4" style={{ padding: 24 }}>
          <h2 style={{ margin: '0 0 16px', fontSize: 18 }}>Mark Attendance</h2>
          <form onSubmit={handleMarkSubmit}>
            <div className="form-group">
              <label htmlFor="mark_employee">Employee *</label>
              <select
                id="mark_employee"
                value={markForm.employee}
                onChange={(e) => setMarkForm((f) => ({ ...f, employee: e.target.value }))}
                required
              >
                <option value="">Select employee</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>{emp.employee_id} - {emp.full_name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="mark_date">Date *</label>
              <input
                id="mark_date"
                type="date"
                value={markForm.date}
                onChange={(e) => setMarkForm((f) => ({ ...f, date: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="mark_status">Status *</label>
              <select
                id="mark_status"
                value={markForm.status}
                onChange={(e) => setMarkForm((f) => ({ ...f, status: e.target.value }))}
              >
                <option value="present">Present</option>
                <option value="absent">Absent</option>
              </select>
            </div>
            {submitError && <div className="alert alert-error mb-3">{submitError}</div>}
            <div className="flex gap-2">
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? 'Saving...' : 'Save'}
              </button>
              <button type="button" className="btn-secondary" onClick={() => { setShowMarkForm(false); setSubmitError(null); }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card mb-4" style={{ padding: 16 }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 15 }}>Filter</h3>
        <div className="flex gap-4 align-center" style={{ flexWrap: 'wrap' }}>
          <div className="form-group" style={{ marginBottom: 0, minWidth: 160 }}>
            <label htmlFor="filter_employee">Employee ID</label>
            <input
              id="filter_employee"
              value={filterEmployeeId}
              onChange={(e) => setFilterEmployeeId(e.target.value)}
              placeholder="e.g. E001"
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0, minWidth: 140 }}>
            <label htmlFor="filter_from">From date</label>
            <input
              id="filter_from"
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0, minWidth: 140 }}>
            <label htmlFor="filter_to">To date</label>
            <input
              id="filter_to"
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="empty-state">Loading...</div>
        ) : records.length === 0 ? (
          <div className="empty-state">
            <p>No attendance records</p>
            <small>Mark attendance using the button above or adjust filters.</small>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Name</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id}>
                    <td>{r.employee_id_display}</td>
                    <td>{r.employee_name}</td>
                    <td>{r.date}</td>
                    <td>
                      <span className={`badge badge-${r.status}`}>{r.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
