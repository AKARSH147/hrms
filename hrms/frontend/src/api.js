/**
 * API client for HRMS Lite backend.
 * Uses relative /api so Vite proxy forwards to backend.
 */

const BASE = '/api';

async function request(path, options = {}) {
  const url = path.startsWith('http') ? path : `${BASE}${path}`;
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });
  let body = null;
  try {
    body = res.status !== 204 ? await res.json() : null;
  } catch (_) {
    body = {};
  }
  if (!res.ok) {
    const err = new Error(
      (body && typeof body.error === 'string')
        ? body.error
        : (body && body.error && typeof body.error === 'object')
          ? JSON.stringify(body.error)
          : res.statusText
    );
    err.status = res.status;
    err.body = body;
    throw err;
  }
  return body;
}

export const api = {
  // Employees
  listEmployees: () => request('/employees/'),
  getEmployee: (id) => request(`/employees/${id}/`),
  createEmployee: (data) => request('/employees/', { method: 'POST', body: JSON.stringify(data) }),
  deleteEmployee: (id) => request(`/employees/${id}/`, { method: 'DELETE' }),

  // Attendance
  listAttendance: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/attendance/${q ? '?' + q : ''}`);
  },
  getAttendance: (id) => request(`/attendance/${id}/`),
  createAttendance: (data) => request('/attendance/', { method: 'POST', body: JSON.stringify(data) }),
  updateAttendance: (id, data) => request(`/attendance/${id}/`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAttendance: (id) => request(`/attendance/${id}/`, { method: 'DELETE' }),

  // Employee attendance (per employee)
  getEmployeeAttendance: (employeeId, params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/employees/${employeeId}/attendance/${q ? '?' + q : ''}`);
  },

  // Dashboard
  getDashboard: () => request('/dashboard/'),
};
