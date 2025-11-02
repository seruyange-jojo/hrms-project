import React, { useState, useEffect } from 'react';
import { X, DollarSign, Calendar, Download, TrendingUp, AlertCircle, CheckCircle, FileText, Building } from 'lucide-react';
import Button from './Button';
import LoadingSpinner from './LoadingSpinner';
import { payrollAPI } from '../services/api';
import { formatCurrency, formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';

const PayrollDetailModal = ({ isOpen, onClose, payrollId, employeeData }) => {
  const [payrollData, setPayrollData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('summary');

  useEffect(() => {
    if (isOpen && payrollId) {
      fetchPayrollDetails();
    }
  }, [isOpen, payrollId]);

  const fetchPayrollDetails = async () => {
    setLoading(true);
    try {
      // Fetch specific payroll record
      const response = await payrollAPI.getPayrollById(payrollId);
      setPayrollData(response.data);
    } catch (error) {
      console.error('Error fetching payroll details:', error);
      toast.error('Failed to load payroll details');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPayStub = () => {
    // Simulate PDF download
    toast.success('Pay stub download will be available soon!');
    // In production, this would trigger a PDF generation/download
    // window.open(`/api/payroll/${payrollId}/download`, '_blank');
  };

  const calculateTotalDeductions = () => {
    if (!payrollData) return 0;
    const tax = payrollData.tax || 0;
    const insurance = payrollData.insurance || 0;
    const providentFund = payrollData.providentFund || 0;
    const otherDeductions = payrollData.otherDeductions || 0;
    return tax + insurance + providentFund + otherDeductions;
  };

  const calculateNetPay = () => {
    if (!payrollData) return 0;
    const basicSalary = payrollData.basicSalary || payrollData.salary || 0;
    const bonus = payrollData.bonus || 0;
    const allowances = payrollData.allowances || 0;
    const totalDeductions = calculateTotalDeductions();
    return basicSalary + bonus + allowances - totalDeductions;
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-4xl">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold flex items-center">
              <DollarSign className="w-6 h-6 mr-2 text-primary" />
              Payroll Details
            </h3>
            <p className="text-sm opacity-60 mt-1">
              View your salary breakdown and payment information
            </p>
          </div>
          <button
            onClick={onClose}
            className="btn btn-sm btn-circle btn-ghost"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : payrollData ? (
          <>
            {/* Employee Info Card */}
            <div className="card bg-base-200 border border-base-300 mb-6">
              <div className="card-body p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="opacity-60 text-xs mb-1">Employee Name</p>
                    <p className="font-medium">{employeeData?.name || payrollData.employeeName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="opacity-60 text-xs mb-1">Employee ID</p>
                    <p className="font-medium">{employeeData?.employeeId || payrollData.employeeId || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="opacity-60 text-xs mb-1">Department</p>
                    <p className="font-medium">{employeeData?.departmentName || payrollData.department || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="tabs tabs-boxed mb-6">
              <button
                className={`tab ${activeTab === 'summary' ? 'tab-active' : ''}`}
                onClick={() => setActiveTab('summary')}
              >
                <FileText className="w-4 h-4 mr-2" />
                Summary
              </button>
              <button
                className={`tab ${activeTab === 'breakdown' ? 'tab-active' : ''}`}
                onClick={() => setActiveTab('breakdown')}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Breakdown
              </button>
              <button
                className={`tab ${activeTab === 'details' ? 'tab-active' : ''}`}
                onClick={() => setActiveTab('details')}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Details
              </button>
            </div>

            {/* Tab Content */}
            <div className="space-y-6">
              {activeTab === 'summary' && (
                <>
                  {/* Net Pay Card */}
                  <div className="card bg-gradient-to-br from-primary to-secondary text-primary-content">
                    <div className="card-body">
                      <h5 className="text-lg opacity-90">Net Pay</h5>
                      <p className="text-4xl font-bold">{formatCurrency(calculateNetPay())}</p>
                      <p className="text-sm opacity-80">
                        Pay Period: {payrollData.payPeriod || formatDate(payrollData.month) || 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="card bg-base-200">
                      <div className="card-body p-4">
                        <p className="text-xs opacity-60 mb-1">Gross Salary</p>
                        <p className="text-2xl font-bold">
                          {formatCurrency((payrollData.basicSalary || payrollData.salary || 0) + 
                            (payrollData.bonus || 0) + 
                            (payrollData.allowances || 0))}
                        </p>
                      </div>
                    </div>

                    <div className="card bg-base-200">
                      <div className="card-body p-4">
                        <p className="text-xs opacity-60 mb-1">Total Deductions</p>
                        <p className="text-2xl font-bold text-error">
                          -{formatCurrency(calculateTotalDeductions())}
                        </p>
                      </div>
                    </div>

                    <div className="card bg-base-200">
                      <div className="card-body p-4">
                        <p className="text-xs opacity-60 mb-1">Status</p>
                        <span className={`badge ${
                          payrollData.status === 'paid' || payrollData.status === 'Paid' 
                            ? 'badge-success' 
                            : payrollData.status === 'pending' 
                            ? 'badge-warning' 
                            : 'badge-info'
                        } badge-lg`}>
                          {payrollData.status || 'Processed'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Info */}
                  <div className="card bg-base-200 border border-base-300">
                    <div className="card-body p-4">
                      <h5 className="font-semibold mb-3 flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2 text-success" />
                        Payment Information
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="opacity-60 mb-1">Payment Method</p>
                          <p className="font-medium">{payrollData.paymentMethod || 'Bank Transfer'}</p>
                        </div>
                        <div>
                          <p className="opacity-60 mb-1">Payment Date</p>
                          <p className="font-medium">
                            {payrollData.paymentDate ? formatDate(payrollData.paymentDate) : 'End of month'}
                          </p>
                        </div>
                        <div>
                          <p className="opacity-60 mb-1">Bank Account</p>
                          <p className="font-medium">{payrollData.bankAccount || '****1234'}</p>
                        </div>
                        <div>
                          <p className="opacity-60 mb-1">Currency</p>
                          <p className="font-medium">{payrollData.currency || 'USD'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'breakdown' && (
                <>
                  {/* Earnings Breakdown */}
                  <div className="card bg-base-200 border border-base-300">
                    <div className="card-body p-4">
                      <h5 className="font-semibold mb-3 flex items-center text-success">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Earnings
                      </h5>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Basic Salary</span>
                          <span className="font-semibold">{formatCurrency(payrollData.basicSalary || payrollData.salary || 0)}</span>
                        </div>
                        {payrollData.bonus > 0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Bonus</span>
                            <span className="font-semibold text-success">{formatCurrency(payrollData.bonus)}</span>
                          </div>
                        )}
                        {payrollData.allowances > 0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Allowances</span>
                            <span className="font-semibold text-success">{formatCurrency(payrollData.allowances)}</span>
                          </div>
                        )}
                        <div className="divider my-2"></div>
                        <div className="flex justify-between items-center font-bold">
                          <span>Total Earnings</span>
                          <span className="text-success">
                            {formatCurrency((payrollData.basicSalary || payrollData.salary || 0) + 
                              (payrollData.bonus || 0) + 
                              (payrollData.allowances || 0))}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Deductions Breakdown */}
                  <div className="card bg-base-200 border border-base-300">
                    <div className="card-body p-4">
                      <h5 className="font-semibold mb-3 flex items-center text-error">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        Deductions
                      </h5>
                      <div className="space-y-3">
                        {payrollData.tax > 0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Income Tax</span>
                            <span className="font-semibold text-error">-{formatCurrency(payrollData.tax)}</span>
                          </div>
                        )}
                        {payrollData.insurance > 0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Health Insurance</span>
                            <span className="font-semibold text-error">-{formatCurrency(payrollData.insurance)}</span>
                          </div>
                        )}
                        {payrollData.providentFund > 0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Provident Fund</span>
                            <span className="font-semibold text-error">-{formatCurrency(payrollData.providentFund)}</span>
                          </div>
                        )}
                        {payrollData.otherDeductions > 0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Other Deductions</span>
                            <span className="font-semibold text-error">-{formatCurrency(payrollData.otherDeductions)}</span>
                          </div>
                        )}
                        <div className="divider my-2"></div>
                        <div className="flex justify-between items-center font-bold">
                          <span>Total Deductions</span>
                          <span className="text-error">-{formatCurrency(calculateTotalDeductions())}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Net Pay Summary */}
                  <div className="card bg-primary text-primary-content">
                    <div className="card-body p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold">Net Pay</span>
                        <span className="text-3xl font-bold">{formatCurrency(calculateNetPay())}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'details' && (
                <>
                  {/* Additional Details */}
                  <div className="card bg-base-200 border border-base-300">
                    <div className="card-body p-4">
                      <h5 className="font-semibold mb-3 flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        Payroll Details
                      </h5>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="opacity-70">Pay Period</span>
                          <span className="font-medium">{payrollData.payPeriod || formatDate(payrollData.month) || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="opacity-70">Payment Date</span>
                          <span className="font-medium">
                            {payrollData.paymentDate ? formatDate(payrollData.paymentDate) : 'End of month'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="opacity-70">Working Days</span>
                          <span className="font-medium">{payrollData.workingDays || '22'} days</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="opacity-70">Days Present</span>
                          <span className="font-medium">{payrollData.daysPresent || payrollData.workingDays || '22'} days</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="opacity-70">Days Absent</span>
                          <span className="font-medium text-error">{payrollData.daysAbsent || '0'} days</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="opacity-70">Leave Taken</span>
                          <span className="font-medium">{payrollData.leaveTaken || '0'} days</span>
                        </div>
                        <div className="divider my-2"></div>
                        <div className="flex justify-between">
                          <span className="opacity-70">Processed By</span>
                          <span className="font-medium">{payrollData.processedBy || 'HR Department'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="opacity-70">Processed Date</span>
                          <span className="font-medium">
                            {payrollData.processedDate ? formatDate(payrollData.processedDate) : formatDate(payrollData.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {payrollData.notes && (
                    <div className="alert alert-info">
                      <AlertCircle className="w-5 h-5" />
                      <div>
                        <p className="font-semibold">Notes</p>
                        <p className="text-sm">{payrollData.notes}</p>
                      </div>
                    </div>
                  )}

                  {/* Tax Information */}
                  <div className="card bg-base-200 border border-base-300">
                    <div className="card-body p-4">
                      <h5 className="font-semibold mb-3 flex items-center">
                        <FileText className="w-4 h-4 mr-2" />
                        Tax Information
                      </h5>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="opacity-70">Tax Rate</span>
                          <span className="font-medium">{payrollData.taxRate || '15'}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="opacity-70">Taxable Income</span>
                          <span className="font-medium">{formatCurrency(payrollData.taxableIncome || payrollData.basicSalary || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="opacity-70">Tax Deducted</span>
                          <span className="font-medium">{formatCurrency(payrollData.tax || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="opacity-70">YTD Tax Paid</span>
                          <span className="font-medium">{formatCurrency(payrollData.ytdTax || payrollData.tax || 0)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Actions */}
            <div className="modal-action">
              <Button 
                variant="outline" 
                onClick={handleDownloadPayStub}
              >
                <Download className="w-4 h-4 mr-2" />
                Download Pay Stub
              </Button>
              <Button 
                variant="primary" 
                onClick={onClose}
              >
                Close
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 mx-auto opacity-50 mb-4" />
            <p className="opacity-70">No payroll data available</p>
          </div>
        )}
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
};

export default PayrollDetailModal;
