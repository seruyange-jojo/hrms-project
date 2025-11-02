# Employee Dashboard - Testing Checklist

## Testing Environment Setup

### Prerequisites
- [ ] Backend running on Docker (port 8080)
- [ ] PostgreSQL database populated with test data
- [ ] Frontend running on port 5173
- [ ] Test employee account created with email/password
- [ ] Employee record exists in database linked to test user

### Test User Credentials
```
Email: employee@test.com
Password: employee123
Role: employee
```

---

## Test Scenarios

### **Test 1: Dashboard Initial Load**
**Objective**: Verify dashboard loads with correct employee data

**Steps**:
1. Log in as employee user
2. Wait for dashboard to load
3. Verify all sections render

**Expected Results**:
- [ ] Loading overlay appears during data fetch
- [ ] Dashboard title shows "Employee Dashboard"
- [ ] Welcome message shows employee name and position
- [ ] 6 statistics cards display with correct values
- [ ] Recent attendance section shows last 5 records
- [ ] Recent leave requests section shows last 5 requests
- [ ] Recent payslips section shows last 3 records
- [ ] Leave balance progress bars render correctly
- [ ] Attendance summary shows this week's hours
- [ ] Profile summary displays employee info
- [ ] No console errors

**Verification**:
```sql
SELECT * FROM employees WHERE email = 'employee@test.com';
SELECT COUNT(*) FROM attendance WHERE employee_id = <employee_id>;
SELECT COUNT(*) FROM leaves WHERE employee_id = <employee_id>;
SELECT COUNT(*) FROM payroll WHERE employee_id = <employee_id>;
```

---

### **Test 2: Open Leave Request Modal**
**Objective**: Verify leave request modal opens correctly

**Steps**:
1. Click "Request Leave" button (top right header OR Quick Actions)
2. Observe modal opens

**Expected Results**:
- [ ] Modal opens with overlay
- [ ] Modal title shows "Request Leave"
- [ ] Form has all fields: Leave Type, Start Date, End Date, Reason
- [ ] Leave type dropdown has 7 options
- [ ] Date fields have today as minimum date
- [ ] Reason textarea is empty
- [ ] "Submit Request" button is enabled
- [ ] Modal can be closed with X button or clicking backdrop

---

### **Test 3: Leave Request Form Validation**
**Objective**: Test all validation rules

**Steps**:
1. Open leave request modal
2. Try to submit empty form
3. Fill only some fields and try submitting
4. Enter invalid data (past dates, short reason)
5. Fill form correctly and submit

**Test Cases**:
- [ ] **Empty form**: Shows "Please fix the form errors" toast
- [ ] **Start date in past**: Shows "Start date cannot be in the past" error
- [ ] **End date before start**: Shows "End date must be after start date" error
- [ ] **Empty reason**: Shows "Reason for leave is required" error
- [ ] **Short reason (< 10 chars)**: Shows "Please provide more details" error
- [ ] **Valid form**: No errors, submits successfully

---

### **Test 4: Submit Leave Request**
**Objective**: Verify end-to-end leave request submission

**Steps**:
1. Open leave request modal
2. Select "Annual Leave"
3. Set start date to tomorrow
4. Set end date to 3 days from start date
5. Enter reason: "Taking a short vacation with family"
6. Review summary card
7. Click "Submit Request"

**Expected Results**:
- [ ] Days automatically calculated as 4 days
- [ ] Summary card shows all details correctly
- [ ] Submit button shows loading spinner
- [ ] Form inputs become disabled during submission
- [ ] Success toast appears: "Leave request submitted successfully!"
- [ ] Modal closes automatically
- [ ] Page reloads
- [ ] New leave request appears in "My Leave Requests" section
- [ ] Status badge shows "Pending"

**Backend Verification**:
```sql
SELECT * FROM leaves 
WHERE employee_id = <employee_id> 
ORDER BY created_at DESC 
LIMIT 1;

-- Should show:
-- leave_type: "Annual Leave"
-- start_date: <tomorrow>
-- end_date: <3 days later>
-- reason: "Taking a short vacation with family"
-- days: 4
-- status: "pending"
```

---

### **Test 5: Open Check-In Modal**
**Objective**: Verify check-in modal functionality

**Steps**:
1. If already checked in today, test on new day OR use backend to delete today's check-in
2. Click "Check In" button (top right header OR Quick Actions)
3. Observe modal

**Expected Results**:
- [ ] Modal opens with title "Check In"
- [ ] Large clock display showing current time updates every second
- [ ] Current date displayed correctly
- [ ] Location dropdown defaults to "Office"
- [ ] Notes textarea is empty
- [ ] Summary card shows all details
- [ ] "Confirm Check In" button is enabled
- [ ] If already checked in, shows warning alert

---

### **Test 6: Submit Check-In**
**Objective**: Test attendance check-in submission

**Steps**:
1. Open check-in modal
2. Select location "Remote / Work from Home"
3. Enter notes: "Working from home today on important project"
4. Review summary
5. Click "Confirm Check In"

**Expected Results**:
- [ ] Submit button shows loading spinner
- [ ] Success toast: "Checked in successfully!"
- [ ] Modal closes
- [ ] Page reloads
- [ ] "Check In" button becomes disabled with text "Already Checked In"
- [ ] "Check Out" button becomes enabled
- [ ] Today's attendance record shows in "My Recent Attendance"

**Backend Verification**:
```sql
SELECT * FROM attendance 
WHERE employee_id = <employee_id> 
AND date = CURRENT_DATE;

-- Should show:
-- check_in_time: <current timestamp>
-- check_out_time: NULL
-- location: "Remote / Work from Home"
-- notes: "Working from home today on important project"
```

---

### **Test 7: Prevent Duplicate Check-In**
**Objective**: Verify cannot check in twice in one day

**Steps**:
1. After checking in, try to click "Check In" button again
2. Observe button state

**Expected Results**:
- [ ] "Check In" button is disabled
- [ ] Button text shows "Already Checked In"
- [ ] Clicking does nothing
- [ ] If trying to open modal directly, shows warning alert

---

### **Test 8: Submit Check-Out**
**Objective**: Test attendance check-out submission

**Steps**:
1. After checking in (minimum 1 hour for meaningful test)
2. Click "Check Out" button
3. Observe modal
4. Select location "Office"
5. Enter notes: "Completed all tasks for today"
6. Verify working hours displayed in summary
7. Click "Confirm Check Out"

**Expected Results**:
- [ ] Modal shows check-in time
- [ ] Working hours calculated and displayed (e.g., "2h 30m")
- [ ] Info alert shows check-in details
- [ ] Success toast: "Checked out successfully!"
- [ ] Modal closes
- [ ] Page reloads
- [ ] Both "Check In" and "Check Out" buttons update accordingly
- [ ] Attendance record shows check-out time

**Backend Verification**:
```sql
SELECT * FROM attendance 
WHERE employee_id = <employee_id> 
AND date = CURRENT_DATE;

-- Should show:
-- check_in_time: <earlier timestamp>
-- check_out_time: <current timestamp>
-- working_hours: <calculated hours>
-- location: "Office"
```

---

### **Test 9: Open Profile Edit Modal**
**Objective**: Verify profile edit modal functionality

**Steps**:
1. Click "Update Profile" button (Quick Actions)
2. Observe modal

**Expected Results**:
- [ ] Modal opens with title "Edit Profile"
- [ ] Read-only employment info card shows name, email, department, position, hire date, employee ID
- [ ] Phone field pre-filled with current value
- [ ] Address field pre-filled with current value
- [ ] Emergency contact fields pre-filled if data exists
- [ ] All read-only fields are not editable
- [ ] Info alert explains HR-managed fields

---

### **Test 10: Update Profile**
**Objective**: Test profile update submission

**Steps**:
1. Open profile edit modal
2. Update phone to "+1 (555) 123-4567"
3. Update address to "123 Main St, Apt 4B, New York, NY 10001"
4. Set emergency contact name to "Jane Doe"
5. Set emergency contact phone to "+1 (555) 987-6543"
6. Select relationship "Spouse"
7. Click "Save Changes"

**Expected Results**:
- [ ] No validation errors
- [ ] Submit button shows loading spinner
- [ ] Success toast: "Profile updated successfully!"
- [ ] Modal closes
- [ ] Page reloads
- [ ] Profile summary shows updated info

**Backend Verification**:
```sql
SELECT phone, address, emergency_contact_name, emergency_contact_phone, emergency_contact_relation 
FROM employees 
WHERE id = <employee_id>;

-- Should show updated values
```

---

### **Test 11: Profile Edit Validation**
**Objective**: Test profile form validation

**Test Cases**:
- [ ] **Invalid phone format**: Enter "abc123", shows error
- [ ] **Short phone number**: Enter "123", shows "Phone number must be at least 10 digits"
- [ ] **Emergency contact name without phone**: Shows "Emergency contact phone is required"
- [ ] **Emergency contact name without relation**: Shows "Emergency contact relation is required"
- [ ] **Valid data**: No errors, submits successfully

---

### **Test 12: Open Payroll Detail Modal - From List**
**Objective**: Verify payroll modal opens from payslip list

**Steps**:
1. Locate "My Payslips" section
2. Click "View" button on first payslip record
3. Observe modal

**Expected Results**:
- [ ] Modal opens with title "Payroll Details"
- [ ] Loading spinner appears briefly
- [ ] Employee info card shows name, ID, department
- [ ] Three tabs visible: Summary, Breakdown, Details
- [ ] Summary tab is active by default
- [ ] Net pay displayed prominently in gradient card
- [ ] Quick stats show Gross Salary, Total Deductions, Status
- [ ] Payment information card shows method, date, account, currency

---

### **Test 13: Open Payroll Detail Modal - From Quick Action**
**Objective**: Verify payroll modal opens from Quick Actions

**Steps**:
1. Click "View Pay Stub" button in Quick Actions section
2. Observe result

**Expected Results**:
- [ ] If payroll records exist: Modal opens with most recent payroll
- [ ] If no payroll records: Toast shows "No payroll records available yet"

---

### **Test 14: Payroll Modal - Summary Tab**
**Objective**: Test payroll summary tab display

**Steps**:
1. Open payroll modal for any record
2. Verify Summary tab content

**Expected Results**:
- [ ] Net pay card shows correct amount
- [ ] Pay period displayed
- [ ] Gross Salary stat correct
- [ ] Total Deductions stat correct (should be negative or formatted with -)
- [ ] Status badge shows correct status (Paid/Pending)
- [ ] Payment information complete (method, date, account, currency)

**Calculation Verification**:
```
Net Pay = Basic Salary + Bonus + Allowances - (Tax + Insurance + Provident Fund + Other Deductions)
Verify: Manual calculation matches displayed net pay
```

---

### **Test 15: Payroll Modal - Breakdown Tab**
**Objective**: Test payroll breakdown tab display

**Steps**:
1. Open payroll modal
2. Click "Breakdown" tab
3. Review earnings and deductions

**Expected Results**:
- [ ] Earnings section shows:
  - Basic Salary
  - Bonus (if > 0)
  - Allowances (if > 0)
  - Total Earnings (sum of above)
- [ ] Deductions section shows:
  - Income Tax (if > 0)
  - Health Insurance (if > 0)
  - Provident Fund (if > 0)
  - Other Deductions (if > 0)
  - Total Deductions (sum of above, displayed as negative)
- [ ] Net pay card at bottom matches summary tab
- [ ] All amounts formatted as currency

---

### **Test 16: Payroll Modal - Details Tab**
**Objective**: Test payroll details tab display

**Steps**:
1. Open payroll modal
2. Click "Details" tab
3. Review payroll details and tax information

**Expected Results**:
- [ ] Payroll Details section shows:
  - Pay Period
  - Payment Date
  - Working Days
  - Days Present
  - Days Absent
  - Leave Taken
  - Processed By
  - Processed Date
- [ ] Tax Information section shows:
  - Tax Rate
  - Taxable Income
  - Tax Deducted
  - YTD Tax Paid
- [ ] All dates formatted correctly
- [ ] All amounts formatted as currency

---

### **Test 17: Payroll Modal - Download Pay Stub**
**Objective**: Test pay stub download button

**Steps**:
1. Open payroll modal (any tab)
2. Click "Download Pay Stub" button

**Expected Results**:
- [ ] Toast appears: "Pay stub download will be available soon!"
- [ ] Modal remains open
- [ ] (Note: In production, this would trigger PDF download)

---

### **Test 18: Statistics Accuracy**
**Objective**: Verify dashboard statistics are correct

**Steps**:
1. Log in as employee
2. Note all statistics values
3. Verify against backend data

**Verification**:
```sql
-- Attendance This Month
SELECT COUNT(*) FROM attendance 
WHERE employee_id = <employee_id> 
AND EXTRACT(MONTH FROM date) = EXTRACT(MONTH FROM CURRENT_DATE)
AND EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM CURRENT_DATE);

-- Annual Leave Balance
SELECT annual_leave_balance FROM employees WHERE id = <employee_id>;

-- Sick Leave Balance
SELECT sick_leave_balance FROM employees WHERE id = <employee_id>;

-- Pending Leave Requests
SELECT COUNT(*) FROM leaves 
WHERE employee_id = <employee_id> 
AND status = 'pending';

-- Current Month Salary
SELECT SUM(net_pay) FROM payroll 
WHERE employee_id = <employee_id> 
AND EXTRACT(MONTH FROM pay_period_start) = EXTRACT(MONTH FROM CURRENT_DATE);
```

**Expected Results**:
- [ ] All statistics match database values
- [ ] Next payday shows end of current month
- [ ] Leave balances match employee record

---

### **Test 19: Recent Data Accuracy**
**Objective**: Verify recent data sections show correct records

**Steps**:
1. Review "My Recent Attendance" section
2. Review "My Leave Requests" section
3. Review "My Payslips" section

**Expected Results**:
- [ ] Recent attendance shows last 5 records only
- [ ] Each record shows date, check-in time, check-out time (if exists)
- [ ] Recent leaves shows last 5 requests only
- [ ] Each leave shows type, dates, days, status badge
- [ ] Recent payslips shows last 3 records only
- [ ] Each payslip shows pay period, net pay, "View" button

---

### **Test 20: Leave Balance Progress Bars**
**Objective**: Verify leave balance visualization

**Steps**:
1. Locate "Leave Balance & Accrual" section
2. Check progress bars

**Calculation**:
```
Annual Leave Used = 25 - stats.leaveBalance.annual
Annual Percentage = (Annual Leave Used / 25) * 100

Sick Leave Used = 10 - stats.leaveBalance.sick
Sick Percentage = (Sick Leave Used / 10) * 100
```

**Expected Results**:
- [ ] Annual leave progress bar percentage matches calculation
- [ ] Sick leave progress bar percentage matches calculation
- [ ] Text shows "X / 25 days" for annual
- [ ] Text shows "X / 10 days" for sick
- [ ] Progress bars colored correctly (primary for annual, warning for sick)

---

### **Test 21: Attendance Summary**
**Objective**: Test attendance summary section

**Steps**:
1. Locate "Attendance Summary" section
2. Verify data

**Expected Results**:
- [ ] "This Week Hours" shows correct total
- [ ] Progress bar shows percentage of 40 hours target
- [ ] "Present Streak" shows consecutive days count
- [ ] All values reasonable and formatted correctly

---

### **Test 22: Empty States**
**Objective**: Test UI when no data available

**Test Cases**:
1. **No attendance records**:
   - [ ] Shows clock icon with "No recent attendance records"

2. **No leave requests**:
   - [ ] Shows calendar icon with "No leave requests"

3. **No payslips**:
   - [ ] Shows dollar sign icon with "No payslips available"

4. **No announcements**:
   - [ ] Shows document icon with "No announcements"

---

### **Test 23: Responsive Design - Mobile**
**Objective**: Test dashboard on mobile devices

**Steps**:
1. Open Chrome DevTools
2. Switch to mobile view (iPhone SE, Pixel 5, etc.)
3. Navigate through dashboard

**Expected Results**:
- [ ] Stats cards stack in single column
- [ ] Cards stack vertically
- [ ] Modals are full-width on mobile
- [ ] Buttons are touch-friendly (minimum 44x44px)
- [ ] Text remains readable
- [ ] No horizontal scrolling
- [ ] Navigation accessible
- [ ] All interactions work with touch

---

### **Test 24: Responsive Design - Tablet**
**Objective**: Test dashboard on tablet devices

**Steps**:
1. Switch to tablet view (iPad, iPad Pro, etc.)
2. Navigate through dashboard

**Expected Results**:
- [ ] Stats cards in 2-column grid
- [ ] Cards in 2-column grid
- [ ] Modals sized appropriately
- [ ] All content visible without scrolling excessively
- [ ] Touch interactions work

---

### **Test 25: Error Handling - Network Failure**
**Objective**: Test behavior when network fails

**Steps**:
1. Open Chrome DevTools → Network tab
2. Set throttling to "Offline"
3. Try to submit leave request
4. Try to check in
5. Try to update profile

**Expected Results**:
- [ ] Each action shows error toast
- [ ] Toast message user-friendly (not raw error)
- [ ] Modal remains open (doesn't close on error)
- [ ] Form data preserved
- [ ] Loading state ends
- [ ] Buttons become enabled again
- [ ] User can retry

---

### **Test 26: Error Handling - Validation Errors**
**Objective**: Test backend validation error display

**Steps**:
1. Submit leave request with dates that exceed leave balance
2. Try to check in when already checked in (via API directly)
3. Update profile with invalid data

**Expected Results**:
- [ ] Error toast displays backend error message
- [ ] Form stays open for correction
- [ ] User can fix and resubmit

---

### **Test 27: Multiple Modal Interactions**
**Objective**: Test opening multiple modals in sequence

**Steps**:
1. Open leave request modal → Close
2. Open profile edit modal → Close
3. Open payroll modal → Close
4. Open check-in modal → Close
5. Open multiple in random order

**Expected Results**:
- [ ] Each modal opens correctly
- [ ] Previous modal state cleared
- [ ] No modal overlap
- [ ] No memory leaks (check browser memory)
- [ ] Backdrop clicks close modal
- [ ] Escape key closes modal

---

### **Test 28: Concurrent Actions**
**Objective**: Test submitting multiple actions quickly

**Steps**:
1. Submit leave request
2. Immediately try to submit another (double-click)
3. Try other actions during submission

**Expected Results**:
- [ ] Loading state prevents duplicate submissions
- [ ] Buttons disabled during loading
- [ ] Only one request sent to backend
- [ ] No race conditions

---

### **Test 29: Data Refresh After Actions**
**Objective**: Verify data updates after each action

**Steps**:
1. Note current leave request count
2. Submit new leave request
3. Wait for page reload
4. Verify new count

**Expected Results**:
- [ ] Page automatically reloads
- [ ] Leave request count increases by 1
- [ ] New request appears in recent list
- [ ] Statistics update correctly

---

### **Test 30: Browser Compatibility**
**Objective**: Test across different browsers

**Browsers to Test**:
- [ ] **Chrome** (latest version)
- [ ] **Firefox** (latest version)
- [ ] **Safari** (latest version)
- [ ] **Edge** (latest version)

**For Each Browser**:
- [ ] Dashboard loads correctly
- [ ] All modals work
- [ ] Forms submit successfully
- [ ] Styling appears correct
- [ ] No console errors

---

## Success Criteria

### Functional Requirements
- [ ] All 4 modals open and close correctly
- [ ] All forms validate properly
- [ ] All API calls succeed with valid data
- [ ] All database updates reflect in UI
- [ ] All buttons functional
- [ ] All statistics accurate

### Non-Functional Requirements
- [ ] Dashboard loads in < 2 seconds
- [ ] Modals open in < 100ms
- [ ] API calls complete in < 1 second
- [ ] No console errors or warnings
- [ ] No memory leaks
- [ ] Responsive on all screen sizes
- [ ] Accessible (keyboard navigation, screen readers)

### User Experience
- [ ] Intuitive navigation
- [ ] Clear error messages
- [ ] Helpful empty states
- [ ] Smooth animations
- [ ] Consistent styling
- [ ] Loading states for all async operations

---

## Bug Report Template

```markdown
### Bug Report

**Test Scenario**: [Test number and name]

**Steps to Reproduce**:
1. 
2. 
3. 

**Expected Behavior**:
[What should happen]

**Actual Behavior**:
[What actually happened]

**Screenshots**:
[Attach screenshots if applicable]

**Console Errors**:
```
[Paste any console errors]
```

**Backend Logs**:
```
[Paste any relevant backend logs]
```

**Environment**:
- Browser: [Chrome/Firefox/Safari/Edge]
- Version: [Browser version]
- OS: [Windows/Mac/Linux]
- Screen Size: [e.g., 1920x1080]

**Severity**:
- [ ] Critical (blocks all functionality)
- [ ] High (blocks major functionality)
- [ ] Medium (workaround available)
- [ ] Low (minor inconvenience)
```

---

## Testing Summary

After completing all test scenarios, summarize results:

**Total Tests**: 30  
**Passed**: ___  
**Failed**: ___  
**Blocked**: ___  

**Critical Issues**: ___  
**High Priority Issues**: ___  
**Medium Priority Issues**: ___  
**Low Priority Issues**: ___  

**Overall Status**: [✅ Ready for Production / ⚠️ Needs Fixes / ❌ Major Issues]

**Notes**:
[Any additional observations or recommendations]
