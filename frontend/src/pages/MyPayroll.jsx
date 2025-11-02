import React, { useEffect, useState } from 'react';
import { payrollAPI, employeeAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { formatCurrency, formatDate } from '../utils/helpers';
import { LoadingOverlay } from '../components/LoadingSpinner';

const MyPayroll = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);

  useEffect(() => {
    document.title = 'My Payslips - HRMS';
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [employeesRes, payrollRes] = await Promise.all([
          employeeAPI.getEmployees().catch(() => ({ data: [] })),
          payrollAPI.getPayrollRecords().catch(() => ({ data: [] }))
        ]);
        const employees = employeesRes?.data || [];
        const me = employees.find(e => e.email === user.email || e.userId === user.id);
        const employeeId = me?.id || me?.ID;
        const all = payrollRes?.data || [];
        const mine = all.filter(p => p.employeeId === employeeId || String(p.employeeId) === String(employeeId) || p.employee?.email === me?.email);
        setRecords(mine);
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) load();
  }, [user]);

  if (loading) return <LoadingOverlay message="Loading payslips..." />;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-focus bg-clip-text text-transparent">My Payslips</h1>
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          {records.length === 0 ? (
            <div className="text-center opacity-70">No payslips available</div>
          ) : (
            <div className="space-y-3">
              {records.map((r, idx) => (
                <div key={r.ID || idx} className="flex items-center justify-between p-3 rounded-lg hover:bg-base-200 transition-colors">
                  <div>
                    <div className="font-medium">{formatDate(r.payPeriodStart)} - {formatDate(r.payPeriodEnd || r.payDate || r.payPeriodStart)}</div>
                    <div className="text-xs opacity-60">Pay Date: {r.payDate ? formatDate(r.payDate) : '—'}</div>
                  </div>
                  <div className="font-semibold">{formatCurrency(r.netPay || 0)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyPayroll;
