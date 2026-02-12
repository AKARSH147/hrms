import { useState, useEffect } from 'react';
import { api } from '../api';

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [form, setForm] = useState({
    employee_id: '',
    full_name: '',
    email: '',
    department: '',
  });
  const [submitError, setSubmitError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    setError(null);
    api.listEmployees()
      .then((res) => {
        if (res.success && res.data) setEmployees(res.data);
      })
      .catch((err) => setError(err.message || 'Failed to load employees'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitting(true);
    api.createEmployee(form)
      .then((res) => {
        if (res.success) {
          setSuccess('Employee added successfully.');
          setForm({ employee_id: '', full_name: '', email: '', department: '' });
          setShowForm(false);
          load();
        }
      })
      .catch((err) => {
        const msg = err.body?.error;
        if (typeof msg === 'object') {
          const parts = Object.entries(msg).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`);
          setSubmitError(parts.join(' '));
        } else {
          setSubmitError(err.message || 'Failed to add employee');
        }
      })
      .finally(() => setSubmitting(false));
  };

  const handleDelete = (emp) => {
    setDeleteConfirm(emp);
  };

  const confirmDelete = () => {
    if (!deleteConfirm) return;
    const id = deleteConfirm.id;
    setDeleteConfirm(null);
    api.deleteEmployee(id)
      .then(() => {
        setSuccess('Employee deleted.');
        load();
      })
      .catch((err) => setError(err.message || 'Failed to delete employee'));
  };

  return (
    <>
      <div className="flex justify-between align-center mb-4">
        <h1 className="page-title" style={{ margin: 0 }}>Employees</h1>
        <button type="button" className="btn-primary" onClick={() => { setShowForm(true); setSubmitError(null); setSuccess(null); }}>
          Add Employee
        </button>
      </div>

      {success && <div className="alert alert-success">{success}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {showForm && (
        <div className="card mb-4" style={{ padding: 24 }}>
          <h2 style={{ margin: '0 0 16px', fontSize: 18 }}>New Employee</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="employee_id">Employee ID *</label>
              <input
                id="employee_id"
                value={form.employee_id}
                onChange={(e) => setForm((f) => ({ ...f, employee_id: e.target.value }))}
                required
                placeholder="e.g. E001"
              />
            </div>
            <div className="form-group">
              <label htmlFor="full_name">Full Name *</label>
              <input
                id="full_name"
                value={form.full_name}
                onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                required
                placeholder="John Doe"
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                required
                placeholder="john@example.com"
              />
            </div>
            <div className="form-group">
              <label htmlFor="department">Department *</label>
              <input
                id="department"
                value={form.department}
                onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
                required
                placeholder="Engineering"
              />
            </div>
            {submitError && <div className="alert alert-error mb-3">{submitError}</div>}
            <div className="flex gap-2">
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? 'Adding...' : 'Add Employee'}
              </button>
              <button type="button" className="btn-secondary" onClick={() => { setShowForm(false); setSubmitError(null); }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        {loading ? (
          <div className="empty-state">Loading...</div>
        ) : employees.length === 0 ? (
          <div className="empty-state">
            <p>No employees yet</p>
            <small>Add an employee using the button above.</small>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th style={{ width: 100 }}></th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp.id}>
                    <td>{emp.employee_id}</td>
                    <td>{emp.full_name}</td>
                    <td>{emp.email}</td>
                    <td>{emp.department}</td>
                    <td>
                      <button type="button" className="btn-danger btn-sm" onClick={() => handleDelete(emp)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Delete employee?</h3>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>
              {deleteConfirm.full_name} ({deleteConfirm.employee_id}) will be removed. This cannot be undone.
            </p>
            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button type="button" className="btn-danger" onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
