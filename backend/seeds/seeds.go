package seeds

import (
	"hrms-backend/models"
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

	// Create employees
	employees := []models.Employee{
		{
			EmployeeCode: "EMP001",
			FirstName:    "John",
			LastName:     "Doe",
			Email:        "admin@hrms.com",
			Phone:        "+1234567890",
			Address:      "123 Main St, City, State",
			HireDate:     time.Now().AddDate(-2, 0, 0),
			Salary:       90000,
			Position:     "System Administrator",
			Status:       "active",
			DepartmentID: createdDepts[0].Model.ID, // HR
		},
		{
			EmployeeCode: "EMP002",
			FirstName:    "Jane",
			LastName:     "Smith",
			Email:        "manager@hrms.com",
			Phone:        "+1234567891",
			Address:      "456 Oak Ave, City, State",
			HireDate:     time.Now().AddDate(-1, -6, 0),
			Salary:       75000,
			Position:     "Engineering Manager",
			Status:       "active",
			DepartmentID: createdDepts[1].Model.ID, // Engineering
		},
		{
			EmployeeCode: "EMP003",
			FirstName:    "Bob",
			LastName:     "Johnson",
			Email:        "employee@hrms.com",
			Phone:        "+1234567892",
			Address:      "789 Pine St, City, State",
			HireDate:     time.Now().AddDate(0, -3, 0),
			Salary:       60000,
			Position:     "Software Developer",
			Status:       "active",
			DepartmentID: createdDepts[1].Model.ID, // Engineering
		},
	}

	for _, emp := range employees {
		var existingEmp models.Employee
		if err := db.Where("email = ?", emp.Email).First(&existingEmp).Error; err == gorm.ErrRecordNotFound {
			db.Create(&emp)
		}
	}

	// Reload employees with IDs
	var createdEmps []models.Employee
	db.Find(&createdEmps)

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

	return nil
}
