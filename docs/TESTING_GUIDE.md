# 🧪 Admin Dashboard Testing Guide

## Prerequisites
- Backend running on `http://localhost:8080` (via Docker)
- Frontend running on `http://localhost:5173`
- Admin account credentials

## Quick Test Checklist

### 1. ✅ Login & Dashboard Access
- [ ] Navigate to `http://localhost:5173`
- [ ] Login with admin credentials
- [ ] Verify redirect to admin dashboard
- [ ] Confirm all stat cards display correct numbers
- [ ] Check that recent employees and leave requests are visible

### 2. ✅ Employee Management - Add
- [ ] Click "Add Employee" button in header
- [ ] Modal opens successfully
- [ ] Fill all required fields:
  - Employee Code: `EMP999`
  - First Name: `Test`
  - Last Name: `Employee`
  - Email: `test.emp@company.com`
  - Position: `Test Engineer`
  - Department: Select any
  - Salary: `50000`
  - Hire Date: Today's date
- [ ] Click "Add Employee"
- [ ] Toast notification shows success
- [ ] Modal closes
- [ ] New employee appears in recent employees list
- [ ] Navigate to Employees page
- [ ] Verify new employee appears in table

### 3. ✅ Employee Management - Edit
- [ ] From Admin Dashboard or Employees page
- [ ] Click "Edit" icon on any employee
- [ ] Modal opens with pre-filled data
- [ ] Modify the position or salary
- [ ] Click "Update Employee"
- [ ] Toast notification shows success
- [ ] Verify changes are reflected immediately

### 4. ✅ Employee Management - Delete
- [ ] Click "Delete" icon on test employee
- [ ] Confirmation dialog appears
- [ ] Dialog shows employee name
- [ ] Click "Delete" button
- [ ] Toast notification shows success
- [ ] Employee removed from list

### 5. ✅ Employee Management - Search & Filter
- [ ] Navigate to Employees page (`/employees`)
- [ ] Test search:
  - [ ] Search by name
  - [ ] Search by email
  - [ ] Search by position
- [ ] Test filters:
  - [ ] Filter by status (Active/Inactive)
  - [ ] Filter by department
  - [ ] Combine search + filters
- [ ] Click "Clear Filters"
- [ ] Verify all employees reappear

### 6. ✅ Department Management - Add
- [ ] Click "Add Department" button
- [ ] Modal opens
- [ ] Fill fields:
  - Name: `Test Department`
  - Description: `Test description`
  - Manager: Select any employee
- [ ] Click "Add Department"
- [ ] Toast notification shows success
- [ ] Navigate to Departments page
- [ ] Verify new department appears

### 7. ✅ Department Management - Edit
- [ ] From Admin Dashboard or Departments page
- [ ] Click "Edit" button on any department
- [ ] Modal opens with pre-filled data
- [ ] Modify description or manager
- [ ] Click "Update Department"
- [ ] Toast notification shows success
- [ ] Changes reflected immediately

### 8. ✅ Department Management - Delete
- [ ] Click "Delete" button on test department
- [ ] Confirmation dialog appears
- [ ] Click "Delete"
- [ ] Toast notification shows success
- [ ] Department removed from list

### 9. ✅ Department Management - View
- [ ] Navigate to Departments page (`/departments`)
- [ ] Verify card grid layout
- [ ] Check each card shows:
  - [ ] Department name
  - [ ] Employee count
  - [ ] Department head name
  - [ ] Description preview
- [ ] Test search functionality

### 10. ✅ Leave Request Management
- [ ] From Admin Dashboard
- [ ] Find pending leave requests section
- [ ] Click "Approve" on a pending request
- [ ] Toast notification shows approval
- [ ] Request disappears from pending list
- [ ] Find another pending request
- [ ] Click "Reject"
- [ ] Toast notification shows rejection
- [ ] Request disappears from pending list

### 11. ✅ Navigation & Routing
- [ ] Click Employees in sidebar
- [ ] Verify navigation to `/employees`
- [ ] Click Departments in sidebar
- [ ] Verify navigation to `/departments`
- [ ] Click Dashboard in sidebar
- [ ] Verify return to `/dashboard`
- [ ] Test browser back/forward buttons
- [ ] Verify proper route protection (admin only)

### 12. ✅ Responsive Design
- [ ] Resize browser window
- [ ] Test mobile view (< 640px)
- [ ] Test tablet view (640px - 1024px)
- [ ] Test desktop view (> 1024px)
- [ ] Verify modals are responsive
- [ ] Verify tables are scrollable on mobile

### 13. ✅ Error Handling
- [ ] Try adding employee with missing required fields
- [ ] Verify validation messages appear
- [ ] Try adding employee with invalid email
- [ ] Verify email validation works
- [ ] Try editing non-existent record (if possible)
- [ ] Verify error toast appears
- [ ] Test with slow/no internet connection
- [ ] Verify loading states and error messages

### 14. ✅ Loading States
- [ ] Refresh dashboard
- [ ] Observe loading spinner
- [ ] Open employee modal
- [ ] Verify department dropdown loads
- [ ] Submit form
- [ ] Verify "Saving..." state on button
- [ ] Delete record
- [ ] Verify "Processing..." state

### 15. ✅ Data Consistency
- [ ] Add employee in one browser tab
- [ ] Refresh another tab
- [ ] Verify new employee appears
- [ ] Edit employee
- [ ] Check changes persist after page refresh
- [ ] Delete employee
- [ ] Verify deletion persists

## Expected Results Summary

### ✅ All Buttons Should Work
- ✅ Add Employee - Opens modal → Creates record
- ✅ Edit Employee - Opens modal → Updates record
- ✅ Delete Employee - Shows confirmation → Deletes record
- ✅ Add Department - Opens modal → Creates record
- ✅ Edit Department - Opens modal → Updates record
- ✅ Delete Department - Shows confirmation → Deletes record
- ✅ Approve Leave - Approves request → Updates status
- ✅ Reject Leave - Rejects request → Updates status

### ✅ All Data Should Flow Correctly
- ✅ Frontend → Backend (API calls work)
- ✅ Backend → Database (Data persists)
- ✅ Database → Backend → Frontend (Data displays)
- ✅ Real-time updates after CRUD operations

### ✅ All Pages Should Be Accessible
- ✅ `/dashboard` - Admin Dashboard
- ✅ `/employees` - Employee Management
- ✅ `/departments` - Department Management

## Common Issues & Solutions

### Issue: "Failed to fetch data"
- **Solution**: Check if backend is running on port 8080
- **Command**: `docker ps` to verify hrms_backend container

### Issue: "401 Unauthorized"
- **Solution**: Token expired, re-login
- **Action**: Logout and login again

### Issue: "Failed to create/update"
- **Solution**: Check backend logs for validation errors
- **Command**: `docker logs hrms_backend`

### Issue: Modal doesn't open
- **Solution**: Check browser console for errors
- **Action**: Clear browser cache and refresh

### Issue: Departments don't load in dropdown
- **Solution**: Backend might have no departments
- **Action**: Create a department first

## Performance Checks

- [ ] Dashboard loads within 2 seconds
- [ ] Modal opens instantly
- [ ] Form submission takes < 1 second
- [ ] Table renders quickly (< 1 second)
- [ ] Search/filter is instant
- [ ] No console errors or warnings

## Security Checks

- [ ] Non-admin users can't access admin pages
- [ ] JWT token is sent with all API requests
- [ ] Sensitive data (passwords) not visible in network tab
- [ ] CRUD operations require authentication
- [ ] Role-based access control enforced

## Browser Compatibility

Test in multiple browsers:
- [ ] Chrome/Brave
- [ ] Firefox
- [ ] Safari
- [ ] Edge

## Final Verification

- [ ] All 7 implementation todos completed ✅
- [ ] All CRUD operations functional ✅
- [ ] All buttons work ✅
- [ ] Backend integration complete ✅
- [ ] Error handling implemented ✅
- [ ] Loading states present ✅
- [ ] Responsive design working ✅
- [ ] Ready for production use ✅

## 🎉 Success Criteria

If all checklist items pass, the Admin Dashboard is:
- ✅ **Fully Functional**
- ✅ **Well Connected** to backend
- ✅ **Fetching Real Data** from database
- ✅ **All Buttons Working**
- ✅ **Production Ready**

## Next Steps

After successful testing:
1. Commit changes to Git
2. Create pull request
3. Deploy to staging environment
4. Perform UAT (User Acceptance Testing)
5. Deploy to production

---

**Testing Status**: Ready to Test ✅
**Backend Status**: Running (Docker) ✅
**Frontend Status**: Running (Vite) ✅
**All Features**: Implemented ✅
