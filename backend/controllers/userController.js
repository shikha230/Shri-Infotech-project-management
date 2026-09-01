const bcrypt = require("bcryptjs");
const User = require("../models/User");

// ========================================
// CREATE EMPLOYEE
// ADMIN ONLY
// ========================================
const createEmployee = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // ========================================
    // VALIDATION
    // ========================================

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Employee name is required",
      });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({
        message: "Employee email is required",
      });
    }

    if (!password) {
      return res.status(400).json({
        message: "Employee password is required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    // ========================================
    // CHECK EXISTING EMAIL
    // ========================================

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(400).json({
        message: "An account with this email already exists",
      });
    }

    // ========================================
    // HASH PASSWORD
    // ========================================

    const hashedPassword = await bcrypt.hash(password, 10);

    // ========================================
    // CREATE EMPLOYEE
    // ========================================

    const employee = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "employee",
    });

    // ========================================
    // SUCCESS RESPONSE
    // Never return password
    // ========================================

    res.status(201).json({
      message: "Employee created successfully",
      employee: {
        _id: employee._id,
        name: employee.name,
        email: employee.email,
        role: employee.role,
        createdAt: employee.createdAt,
      },
    });
  } catch (error) {
    console.error("Create employee error:", error);

    res.status(500).json({
      message: "Server error while creating employee",
      error: error.message,
    });
  }
};

// ========================================
// GET ALL USERS
// ========================================
const getUsers = async (req, res) => {
  try {
    const users = await User.find({
      role: { $ne: "admin" },
    }).select("_id name email role createdAt");

    res.json({
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Get users error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ========================================
// GET ALL EMPLOYEES
// ========================================
const getEmployees = async (req, res) => {
  try {
    const employees = await User.find({
      role: "employee",
    }).select("_id name email role createdAt");

    res.json({
      count: employees.length,
      employees,
    });
  } catch (error) {
    console.error("Get employees error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  createEmployee,
  getUsers,
  getEmployees,
};