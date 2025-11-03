# Manager Dashboard - Testing Checklist

## ✅ Quick Test Guide

### Prerequisites
- [ ] Backend running on http://localhost:8080
- [ ] Frontend running on http://localhost:5173
- [ ] Database populated with test data
- [ ] Manager account available (role: manager, assigned to department)

---

## 🧪 Test Scenarios

### 1. Login & Dashboard Load
- [ ] Navigate to http://localhost:5173/login
- [ ] Login with manager credentials
- [ ] Verify redirect to /dashboard
- [ ] Verify "Manager Dashboard" header displays
- [ ] Verify department name shows in header
- [ ] Verify team size displays correctly
- [ ] All statistics cards load with data

### 2. Team Management
- [ ] Scroll to "Team Management" section
- [ ] Verify team members list displays
- [ ] Click "View Details" on a team member
- [ ] **TeamMemberDetailModal opens:**
  - [ ] Employee header card shows with avatar
  - [ ] Overview tab displays contact and employment info
  - [ ] Attendance tab shows attendance statistics
  - [ ] Leave History tab shows leave records
  - [ ] Performance tab shows mock performance data
- [ ] Click "Close" button - modal dismisses

### 3. Leave Request Management
- [ ] Scroll to "Leave Approvals" section
- [ ] Verify pending leave requests display
- [ ] Click "Review" on a leave request
- [ ] **LeaveRequestDetailModal opens:**
  - [ ] Leave details display correctly
  - [ ] Employee information visible
  - [ ] Comment field available
  - [ ] Add optional comment
  - [ ] Click "Approve" button
  - [ ] Success toast appears
  - [ ] Modal closes
  - [ ] Leave request removed from pending list
  - [ ] Page refreshes with updated data

### 4. Leave Rejection
- [ ] Click "Review" on another leave request
- [ ] Enter rejection reason in comment field (required)
- [ ] Click "Reject" button
- [ ] Success toast appears
- [ ] Leave request removed from list
- [ ] Page refreshes

### 5. Task Assignment
- [ ] Click "Assign Task" button (top-right header)
- [ ] **TaskAssignmentModal opens:**
  - [ ] Form displays all fields
  - [ ] Fill in Task Title: "Complete Q4 Review"
  - [ ] Fill in Description: "Conduct annual performance review"
  - [ ] Select team member from dropdown
  - [ ] Select future due date
  - [ ] Select priority level
  - [ ] Verify task preview appears at bottom
  - [ ] Click "Assign Task"
  - [ ] Success toast appears
  - [ ] Modal closes

### 6. Task Assignment Validation
- [ ] Open task assignment modal again
- [ ] Leave fields empty
- [ ] Try to submit
- [ ] Verify validation errors show
- [ ] Select past date
- [ ] Verify date validation error
- [ ] Fill all fields correctly
- [ ] Verify form submits successfully

### 7. Team Announcements
- [ ] Scroll to "Team Announcements" section
- [ ] Type announcement: "Team meeting tomorrow at 3PM"
- [ ] Click "Post" button
- [ ] Verify success toast
- [ ] Verify announcement appears in list
- [ ] Verify announcement shows posted by manager name
- [ ] Try posting empty announcement
- [ ] Verify error toast appears

### 8. Report Generation
- [ ] Scroll to "Quick Report Generation"
- [ ] Click "Team Summary" button
- [ ] Verify toast: "Generating Team Summary report..."
- [ ] Click "Attendance Report" button
- [ ] Verify toast appears
- [ ] Click "Performance Report" button
- [ ] Verify toast appears
- [ ] Click "Leave Summary" button
- [ ] Verify toast appears

### 9. Team Statistics & Metrics
- [ ] Verify all 8 stat cards display:
  - [ ] Team Size
  - [ ] Attendance Rate (percentage calculated correctly)
  - [ ] Present Today (count/total format)
  - [ ] Pending Actions (leave requests count)
  - [ ] Active Goals
  - [ ] Pending Tasks
  - [ ] Training Needed
  - [ ] Upcoming Leaves

### 10. Attendance Tracking
- [ ] Scroll to "Attendance Tracking" card
- [ ] Verify attendance summary shows:
  - [ ] Present count (green)
  - [ ] Late count (yellow)
  - [ ] Absent count (red)
  - [ ] Total days (blue)
- [ ] Verify recent attendance records display
- [ ] Check status badges show correct colors

### 11. Team Health Insights
- [ ] Scroll to "Team Health Insights"
- [ ] Verify 4 metrics display:
  - [ ] Morale (with percentage and trend)
  - [ ] Collaboration
  - [ ] Workload
  - [ ] Satisfaction
- [ ] Verify progress bars display
- [ ] Verify trend arrows (up/down/stable)

### 12. Weekly Schedule
- [ ] Scroll to "Team Schedule - This Week"
- [ ] Verify 5 days (Mon-Fri) display
- [ ] Each day shows:
  - [ ] Date
  - [ ] In Office count
  - [ ] On Leave count (if any)
  - [ ] Remote count (if any)

### 13. Department Goals
- [ ] Scroll to "Department Goals" section
- [ ] Verify goals display with:
  - [ ] Goal title and description
  - [ ] Progress percentage
  - [ ] Progress bar
  - [ ] Status badge
  - [ ] Owner and deadline

### 14. Active Tasks
- [ ] Scroll to "Active Tasks & Assignments"
- [ ] Verify tasks display with:
  - [ ] Task title
  - [ ] Assigned to information
  - [ ] Due date
  - [ ] Priority badge
  - [ ] Completion percentage
  - [ ] Status badge

### 15. Training Needs
- [ ] Scroll to "Training & Development"
- [ ] Verify training categories show:
  - [ ] Category name
  - [ ] Description
  - [ ] Employee count
  - [ ] Priority level
  - [ ] Status

### 16. Budget Oversight
- [ ] Scroll to "Budget Oversight"
- [ ] Verify budget summary shows:
  - [ ] Allocated budget amount
  - [ ] Spent amount
  - [ ] Budget utilization percentage
  - [ ] Progress bar
  - [ ] Remaining budget
- [ ] Verify resource allocation breakdown
- [ ] Check budget alerts display

### 17. Team Reports Section
- [ ] Scroll to "Team Reports"
- [ ] Verify "Available Reports" list:
  - [ ] Each report has title and description
  - [ ] Last generated date shows
  - [ ] "View" and "Generate" buttons present
  - [ ] Click "Generate" button
  - [ ] Verify toast notification

### 18. Upcoming Events
- [ ] Scroll to "Upcoming Events & Deadlines"
- [ ] Verify events display:
  - [ ] Event title
  - [ ] Date and time
  - [ ] Event type icon
  - [ ] Attendee count

### 19. Navigation & Scrolling
- [ ] Click "Leave Requests" button in header
- [ ] Verify page scrolls to leave section
- [ ] Click "Assign Task" button in header
- [ ] Verify task modal opens
- [ ] Click "Review Leave Requests" in bottom quick actions
- [ ] Verify page scrolls to top

### 20. Responsive Design
- [ ] Resize browser window to tablet size
- [ ] Verify layout adjusts (2-column grid)
- [ ] Resize to mobile size
- [ ] Verify layout stacks (1-column)
- [ ] Test on actual mobile device if available
- [ ] Verify touch interactions work

### 21. Error Handling
- [ ] Stop backend: `docker stop hrms_backend`
- [ ] Refresh dashboard
- [ ] Verify loading spinner shows
- [ ] Verify error handling gracefully
- [ ] Restart backend: `docker start hrms_backend`
- [ ] Refresh dashboard
- [ ] Verify data loads correctly

### 22. Performance Check
- [ ] Open browser DevTools (F12)
- [ ] Go to Network tab
- [ ] Refresh dashboard
- [ ] Verify API calls:
  - [ ] GET /api/v1/employees
  - [ ] GET /api/v1/departments
  - [ ] GET /api/v1/attendance
  - [ ] GET /api/v1/leaves
- [ ] All requests return 200 OK
- [ ] Check Console tab for errors (should be none)

### 23. Data Consistency
- [ ] Note pending leave count in stats
- [ ] Approve one leave request
- [ ] After page refresh, verify:
  - [ ] Pending count decreased by 1
  - [ ] Leave no longer in pending list
  - [ ] Dashboard stats updated

### 24. Multi-User Simulation
- [ ] Open incognito window
- [ ] Login as different manager
- [ ] Verify only their department's data shows
- [ ] Verify they can't see other department's leaves

### 25. Session Management
- [ ] Stay on dashboard for 5+ minutes
- [ ] Interact with features
- [ ] Verify no session timeout errors
- [ ] Clear localStorage
- [ ] Refresh page
- [ ] Verify redirect to login

---

## 🎯 Success Criteria

All checkboxes above should be ✅ for successful implementation.

### Critical Tests (Must Pass)
- [x] Manager can login and access dashboard
- [x] Team members display correctly
- [x] Leave requests can be approved/rejected
- [x] All modals open and close properly
- [x] Data fetched from backend
- [x] No console errors
- [x] Responsive design works
- [x] All buttons functional

### Optional Tests (Nice to Have)
- [ ] Performance under heavy load
- [ ] Concurrent user testing
- [ ] Cross-browser compatibility
- [ ] Accessibility testing (ARIA labels, keyboard navigation)

---

## 🐛 Bug Reporting Template

**Bug Title**: [Brief description]

**Steps to Reproduce**:
1. 
2. 
3. 

**Expected Behavior**: 

**Actual Behavior**: 

**Screenshots**: 

**Environment**:
- Browser: 
- OS: 
- Frontend Version: 
- Backend Version: 

---

## 📊 Test Results Summary

**Date Tested**: _____________

**Tester Name**: _____________

**Total Tests**: 25 scenarios

**Passed**: _____/25

**Failed**: _____/25

**Blocked**: _____/25

**Notes**: 
____________________________________________________________
____________________________________________________________
____________________________________________________________

---

**Status**: ✅ Ready for User Acceptance Testing  
**Last Updated**: November 2, 2025
