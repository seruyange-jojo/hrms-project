package seeds

import (
	"fmt"
	"hrms-backend/models"
	"math/rand"
	"time"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

func SeedDatabase(db *gorm.DB) error {
	// Create departments
	departments := []models.Department{
		{Name: "Human Resources", Description: "Manages employee relations and company policies"},
		{Name: "Engineering", Description: "Software development and technical operations"},
		{Name: "Sales", Description: "Customer acquisition and revenue generation"},
		{Name: "Marketing", Description: "Brand promotion and customer engagement"},
		{Name: "Finance", Description: "Financial planning and accounting"},
		{Name: "Operations", Description: "Business operations and logistics"},
		{Name: "Customer Support", Description: "Customer service and technical support"},
	}

	for _, dept := range departments {
		var existingDept models.Department
		if err := db.Where("name = ?", dept.Name).First(&existingDept).Error; err == gorm.ErrRecordNotFound {
			db.Create(&dept)
		}
	}

	// Reload departments with IDs
	var createdDepts []models.Department
	db.Find(&createdDepts)

	// Employee data arrays for realistic names
	firstNames := []string{"John", "Jane", "Michael", "Sarah", "David", "Emily", "Robert", "Lisa", "William", "Jennifer", "James", "Mary", "Daniel", "Patricia", "Christopher", "Linda", "Matthew", "Barbara", "Andrew", "Susan", "Joshua", "Jessica", "Ryan", "Karen", "Brian", "Nancy", "Kevin", "Betty", "Thomas", "Helen", "Mark", "Dorothy", "Donald", "Sandra", "Steven", "Ashley", "Paul", "Kimberly", "George", "Donna", "Kenneth", "Carol", "Charles", "Michelle", "Jason", "Amanda", "Jeffrey", "Melissa", "Eric", "Deborah"}
	lastNames := []string{"Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores", "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell", "Carter"}
	positions := map[string][]string{
		"Human Resources":  {"HR Manager", "HR Coordinator", "Recruiter", "HR Assistant", "Talent Acquisition Specialist"},
		"Engineering":      {"Engineering Manager", "Senior Software Engineer", "Software Engineer", "Junior Developer", "DevOps Engineer", "QA Engineer", "Tech Lead"},
		"Sales":            {"Sales Manager", "Account Executive", "Sales Representative", "Business Development Manager", "Sales Coordinator"},
		"Marketing":        {"Marketing Manager", "Content Strategist", "Digital Marketing Specialist", "Marketing Coordinator", "Brand Manager"},
		"Finance":          {"Finance Manager", "Financial Analyst", "Accountant", "Payroll Specialist", "Budget Analyst"},
		"Operations":       {"Operations Manager", "Operations Coordinator", "Logistics Specialist", "Process Analyst"},
		"Customer Support": {"Support Manager", "Customer Success Manager", "Support Agent", "Technical Support Specialist"},
	}

	// Create comprehensive employee list
	employees := []models.Employee{}
	empCode := 1

	// First, create the test user employees
	testEmployees := []models.Employee{
		{
			EmployeeCode: fmt.Sprintf("EMP%03d", empCode),
			FirstName:    "John",
			LastName:     "Doe",
			Email:        "admin@hrms.com",
			Phone:        "+1234567890",
			Address:      "123 Main St, New York, NY 10001",
			HireDate:     time.Now().AddDate(-2, 0, 0),
			Salary:       120000,
			Position:     "Chief Technology Officer",
			Status:       "active",
			DepartmentID: createdDepts[0].Model.ID, // HR
		},
		{
			EmployeeCode: fmt.Sprintf("EMP%03d", empCode+1),
			FirstName:    "Jane",
			LastName:     "Smith",
			Email:        "manager@hrms.com",
			Phone:        "+1234567891",
			Address:      "456 Oak Ave, San Francisco, CA 94102",
			HireDate:     time.Now().AddDate(-1, -6, 0),
			Salary:       95000,
			Position:     "Engineering Manager",
			Status:       "active",
			DepartmentID: createdDepts[1].Model.ID, // Engineering
		},
		{
			EmployeeCode: fmt.Sprintf("EMP%03d", empCode+2),
			FirstName:    "Bob",
			LastName:     "Johnson",
			Email:        "employee@hrms.com",
			Phone:        "+1234567892",
			Address:      "789 Pine St, Seattle, WA 98101",
			HireDate:     time.Now().AddDate(0, -8, 0),
			Salary:       75000,
			Position:     "Senior Software Engineer",
			Status:       "active",
			DepartmentID: createdDepts[1].Model.ID, // Engineering
		},
	}
	employees = append(employees, testEmployees...)
	empCode += 3

	// Generate 47 more employees to reach 50 total
	rand.Seed(time.Now().UnixNano())
	cities := []string{"New York, NY", "Los Angeles, CA", "Chicago, IL", "Houston, TX", "Phoenix, AZ", "Philadelphia, PA", "San Antonio, TX", "San Diego, CA", "Dallas, TX", "San Jose, CA"}

	for i := 0; i < 47; i++ {
		deptIdx := rand.Intn(len(createdDepts))
		dept := createdDepts[deptIdx]
		positionList := positions[dept.Name]
		position := positionList[rand.Intn(len(positionList))]

		// Salary ranges based on position seniority
		baseSalary := 50000.0
		if position == "Manager" || position == "Engineering Manager" || position == "Sales Manager" || position == "Finance Manager" || position == "Operations Manager" || position == "Marketing Manager" || position == "Support Manager" {
			baseSalary = 85000.0
		} else if position == "Tech Lead" || position == "Senior Software Engineer" || position == "Business Development Manager" {
			baseSalary = 80000.0
		} else if position == "Account Executive" || position == "DevOps Engineer" || position == "QA Engineer" {
			baseSalary = 70000.0
		} else if position == "Software Engineer" || position == "Financial Analyst" || position == "Content Strategist" {
			baseSalary = 65000.0
		} else if position == "Junior Developer" || position == "Support Agent" || position == "Sales Representative" {
			baseSalary = 55000.0
		}

		salary := baseSalary + float64(rand.Intn(15000))

		emp := models.Employee{
			EmployeeCode: fmt.Sprintf("EMP%03d", empCode),
			FirstName:    firstNames[rand.Intn(len(firstNames))],
			LastName:     lastNames[rand.Intn(len(lastNames))],
			Email:        fmt.Sprintf("employee%d@hrms.com", empCode),
			Phone:        fmt.Sprintf("+1%d", 2000000000+rand.Intn(899999999)),
			Address:      fmt.Sprintf("%d %s St, %s", 100+rand.Intn(900), []string{"Main", "Oak", "Pine", "Elm", "Maple", "Cedar"}[rand.Intn(6)], cities[rand.Intn(len(cities))]),
			HireDate:     time.Now().AddDate(0, -rand.Intn(36), -rand.Intn(28)), // Random hire date within last 3 years
			Salary:       salary,
			Position:     position,
			Status:       "active",
			DepartmentID: dept.Model.ID,
		}
		employees = append(employees, emp)
		empCode++
	}

	// Create employees in database
	for _, emp := range employees {
		var existingEmp models.Employee
		if err := db.Where("email = ?", emp.Email).First(&existingEmp).Error; err == gorm.ErrRecordNotFound {
			db.Create(&emp)
		}
	}

	// Reload employees with IDs
	var createdEmps []models.Employee
	db.Find(&createdEmps)

	// Update department managers (assign first employee of each dept as manager)
	deptManagers := make(map[uint]uint) // deptID -> employeeID
	for _, dept := range createdDepts {
		for _, emp := range createdEmps {
			if emp.DepartmentID == dept.Model.ID {
				deptManagers[dept.Model.ID] = emp.Model.ID
				db.Model(&models.Department{}).Where("id = ?", dept.Model.ID).Update("manager_id", emp.Model.ID)
				break
			}
		}
	}

	// Create users (matching the frontend demo users)
	users := []models.User{
		{
			Email:      "admin@hrms.com",
			Password:   "admin123",
			FirstName:  "John",
			LastName:   "Doe",
			Role:       "admin",
			IsActive:   true,
			EmployeeID: &createdEmps[0].Model.ID,
		},
		{
			Email:      "manager@hrms.com",
			Password:   "manager123",
			FirstName:  "Jane",
			LastName:   "Smith",
			Role:       "manager",
			IsActive:   true,
			EmployeeID: &createdEmps[1].Model.ID,
		},
		{
			Email:      "employee@hrms.com",
			Password:   "employee123",
			FirstName:  "Bob",
			LastName:   "Johnson",
			Role:       "employee",
			IsActive:   true,
			EmployeeID: &createdEmps[2].Model.ID,
		},
	}

	for _, user := range users {
		var existingUser models.User
		if err := db.Where("email = ?", user.Email).First(&existingUser).Error; err == gorm.ErrRecordNotFound {
			// Hash password
			hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
			if err != nil {
				return err
			}
			user.Password = string(hashedPassword)
			db.Create(&user)
		}
	}

	// Create attendance records for last 90 days
	now := time.Now()
	for _, emp := range createdEmps {
		for i := 0; i < 90; i++ {
			date := now.AddDate(0, 0, -i)

			// Skip weekends
			if date.Weekday() == time.Saturday || date.Weekday() == time.Sunday {
				continue
			}

			// 90% attendance rate (10% absent/late)
			randNum := rand.Intn(100)
			var status string
			var checkIn, checkOut *time.Time
			var workingHours float64

			if randNum < 85 { // 85% present
				status = "present"
				checkInTime := date.Add(time.Hour*8 + time.Minute*time.Duration(rand.Intn(30)))   // 8:00-8:30 AM
				checkOutTime := date.Add(time.Hour*17 + time.Minute*time.Duration(rand.Intn(60))) // 5:00-6:00 PM
				checkIn = &checkInTime
				checkOut = &checkOutTime
				workingHours = checkOutTime.Sub(checkInTime).Hours()
			} else if randNum < 90 { // 5% late
				status = "late"
				checkInTime := date.Add(time.Hour*9 + time.Minute*time.Duration(rand.Intn(60))) // 9:00-10:00 AM
				checkOutTime := date.Add(time.Hour*17 + time.Minute*time.Duration(rand.Intn(60)))
				checkIn = &checkInTime
				checkOut = &checkOutTime
				workingHours = checkOutTime.Sub(checkInTime).Hours()
			} else if randNum < 95 { // 5% half-day
				status = "half-day"
				checkInTime := date.Add(time.Hour*8 + time.Minute*time.Duration(rand.Intn(30)))
				checkOutTime := date.Add(time.Hour*12 + time.Minute*time.Duration(rand.Intn(60))) // Leave at noon
				checkIn = &checkInTime
				checkOut = &checkOutTime
				workingHours = checkOutTime.Sub(checkInTime).Hours()
			} else { // 5% absent
				status = "absent"
				checkIn = nil
				checkOut = nil
				workingHours = 0
			}

			attendance := models.Attendance{
				EmployeeID:   emp.Model.ID,
				Date:         date,
				CheckIn:      checkIn,
				CheckOut:     checkOut,
				Status:       status,
				WorkingHours: workingHours,
			}

			var existingAtt models.Attendance
			if err := db.Where("employee_id = ? AND date = ?", emp.Model.ID, date.Format("2006-01-02")).First(&existingAtt).Error; err == gorm.ErrRecordNotFound {
				db.Create(&attendance)
			}
		}
	}

	// Create leave requests
	leaveTypes := []string{"annual", "sick", "emergency", "personal", "unpaid"}
	statuses := []string{"approved", "pending", "rejected"}

	for _, emp := range createdEmps {
		// Each employee has 2-5 leave requests in the past year
		numLeaves := 2 + rand.Intn(4)
		for i := 0; i < numLeaves; i++ {
			startDate := now.AddDate(0, 0, -rand.Intn(365))
			days := 1 + rand.Intn(7) // 1-7 days leave
			endDate := startDate.AddDate(0, 0, days-1)
			leaveType := leaveTypes[rand.Intn(len(leaveTypes))]
			status := statuses[rand.Intn(len(statuses))]

			leave := models.LeaveRequest{
				EmployeeID: emp.Model.ID,
				LeaveType:  leaveType,
				StartDate:  startDate,
				EndDate:    endDate,
				Days:       days,
				Reason:     fmt.Sprintf("Personal %s leave request", leaveType),
				Status:     status,
			}

			// If approved or rejected, set approver and timestamp
			if status == "approved" || status == "rejected" {
				// Find manager of employee's department
				if managerID, ok := deptManagers[emp.DepartmentID]; ok {
					leave.ApprovedBy = &managerID
					approvedTime := startDate.AddDate(0, 0, -rand.Intn(7)) // Approved 0-7 days before start
					leave.ApprovedAt = &approvedTime
					if status == "approved" {
						leave.Comments = "Approved"
					} else {
						leave.Comments = "Unable to approve due to staffing requirements"
					}
				}
			}

			db.Create(&leave)
		}
	}

	// Create payroll records for last 3 months
	for monthOffset := 0; monthOffset < 3; monthOffset++ {
		payPeriodEnd := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, time.UTC).AddDate(0, -monthOffset, -1) // Last day of previous month
		payPeriodStart := time.Date(payPeriodEnd.Year(), payPeriodEnd.Month(), 1, 0, 0, 0, 0, time.UTC)

		for _, emp := range createdEmps {
			basicSalary := emp.Salary / 12         // Monthly salary
			allowances := basicSalary * 0.15       // 15% allowances
			overtime := float64(rand.Intn(5)) * 50 // 0-4 hours of overtime at $50/hr
			grossPay := basicSalary + allowances + overtime
			tax := grossPay * 0.25        // 25% tax
			deductions := grossPay * 0.05 // 5% other deductions (insurance, etc.)
			netPay := grossPay - tax - deductions

			processedTime := payPeriodEnd.AddDate(0, 0, 5) // Processed 5 days after period end
			paidTime := processedTime.AddDate(0, 0, 2)     // Paid 2 days after processing

			payroll := models.PayrollRecord{
				EmployeeID:     emp.Model.ID,
				PayPeriodStart: payPeriodStart,
				PayPeriodEnd:   payPeriodEnd,
				BasicSalary:    basicSalary,
				Allowances:     allowances,
				Deductions:     deductions,
				Overtime:       overtime,
				GrossPay:       grossPay,
				Tax:            tax,
				NetPay:         netPay,
				Status:         "paid",
				ProcessedAt:    &processedTime,
				PaidAt:         &paidTime,
			}

			var existingPayroll models.PayrollRecord
			if err := db.Where("employee_id = ? AND pay_period_start = ?", emp.Model.ID, payPeriodStart).First(&existingPayroll).Error; err == gorm.ErrRecordNotFound {
				db.Create(&payroll)
			}
		}
	}

	fmt.Println("✅ Database seeded successfully!")
	fmt.Printf("   - %d Departments\n", len(createdDepts))
	fmt.Printf("   - %d Employees\n", len(createdEmps))
	fmt.Printf("   - ~%d Attendance Records (90 days per employee)\n", len(createdEmps)*60) // Approximate (excluding weekends)
	fmt.Printf("   - ~%d Leave Requests\n", len(createdEmps)*3)                             // Average 3 per employee
	fmt.Printf("   - %d Payroll Records (3 months)\n", len(createdEmps)*3)

	return nil
}
