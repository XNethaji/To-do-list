const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");

const app = express();
const PORT = 5000;
const SECRET_KEY = "your_secret_key"; // 🔴 Change this to a more secure key!

// ✅ Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// ✅ Connect to MySQL Database
const db = mysql.createConnection({
    host: "localhost",
    user: "root", // Change if needed
    password: "root", // Your MySQL password
    database: "todo_app", // ✅ Ensure correct database name
});

db.connect((err) => {
    if (err) {
        console.error("❌ Database connection failed:", err);
        return;
    }
    console.log("✅ Connected to MySQL database");
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) return res.status(401).json({ message: "Access denied. No token provided." });
    
    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ message: "Invalid or expired token." });
        req.user = user;
        next();
    });
};

// ✅ SIGNUP - Register a New User
app.post("/signup", async (req, res) => {
    try {
        const { name, email, phone_no, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required." });
        }

        // ✅ Check if email already exists
        db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
            if (err) {
                console.error("❌ Database error:", err);
                return res.status(500).json({ message: "Database error" });
            }

            if (results.length > 0) {
                return res.status(400).json({ message: "Email already exists." });
            }

            try {
                // ✅ Hash the password before storing
                const hashedPassword = await bcrypt.hash(password, 10);

                // ✅ Insert user into the database (storing hashed password in `password` column)
                const sql = "INSERT INTO users (name, email, phone_no, password) VALUES (?, ?, ?, ?)";
                db.query(sql, [name, email, phone_no, hashedPassword], (err, result) => {
                    if (err) {
                        console.error("❌ Signup error:", err);
                        return res.status(500).json({ message: "Signup failed!" });
                    }
                    return res.status(201).json({ message: "✅ User registered successfully!" });
                });
            } catch (hashError) {
                console.error("❌ Password hashing error:", hashError);
                res.status(500).json({ message: "Password hashing failed" });
            }
        });
    } catch (error) {
        console.error("❌ Signup process failed:", error);
        res.status(500).json({ message: "Signup process failed" });
    }
});

// ✅ SIGN IN - Authenticate User
app.post("/signin", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required." });
    }

    const sql = "SELECT * FROM users WHERE email = ?";
    db.query(sql, [email], async (err, results) => {
        if (err) return res.status(500).json({ error: "Database error", details: err });

        if (results.length === 0) {
            return res.status(400).json({ message: "User not found." });
        }

        const user = results[0];

        try {
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (!passwordMatch) {
                return res.status(401).json({ message: "Invalid credentials." });
            }

            const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, {
                expiresIn: "1h",
            });

            res.json({ 
                message: "✅ Login successful!", 
                token, 
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone
                } 
            });
        } catch (compareError) {
            res.status(500).json({ error: "Password comparison failed", details: compareError });
        }
    });
});

// ✅ Get User Profile
app.get("/user", authenticateToken, (req, res) => {
    const userId = req.user.id;
    
    const sql = "SELECT id, name, email, phone FROM users WHERE id = ?";
    db.query(sql, [userId], (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });
        
        if (results.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        
        res.json(results[0]);
    });
});

// ✅ Get All Tasks for a User
app.get("/tasks", authenticateToken, (req, res) => {
    const userId = req.user.id;
    
    const sql = "SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC";
    db.query(sql, [userId], (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });
        
        res.json(results);
    });
});

// ✅ Create a New Task
app.post("/tasks", authenticateToken, (req, res) => {
    const userId = req.user.id;
    const { title, description, due_date, category } = req.body;
    
    if (!title) {
        return res.status(400).json({ message: "Task title is required" });
    }
    
    const sql = "INSERT INTO tasks (user_id, title, description, due_date, category) VALUES (?, ?, ?, ?, ?)";
    db.query(sql, [userId, title, description, due_date, category], (err, result) => {
        if (err) return res.status(500).json({ message: "Failed to create task" });
        
        // Get the newly created task
        const taskId = result.insertId;
        db.query("SELECT * FROM tasks WHERE id = ?", [taskId], (err, taskResult) => {
            if (err) return res.status(500).json({ message: "Task created but failed to retrieve" });
            
            res.status(201).json(taskResult[0]);
        });
    });
});

// ✅ Update a Task
app.put("/tasks/:id", authenticateToken, (req, res) => {
    const userId = req.user.id;
    const taskId = req.params.id;
    const { title, description, due_date, category, status } = req.body;
    
    // First check if the task belongs to the user
    db.query("SELECT * FROM tasks WHERE id = ? AND user_id = ?", [taskId, userId], (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });
        
        if (results.length === 0) {
            return res.status(404).json({ message: "Task not found or not authorized" });
        }
        
        // Update the task
        const sql = "UPDATE tasks SET title = ?, description = ?, due_date = ?, category = ?, status = ? WHERE id = ?";
        db.query(sql, [title, description, due_date, category, status, taskId], (err, result) => {
            if (err) return res.status(500).json({ message: "Failed to update task" });
            
            // Get the updated task
            db.query("SELECT * FROM tasks WHERE id = ?", [taskId], (err, taskResult) => {
                if (err) return res.status(500).json({ message: "Task updated but failed to retrieve" });
                
                res.json(taskResult[0]);
            });
        });
    });
});

// ✅ Delete a Task
app.delete("/tasks/:id", authenticateToken, (req, res) => {
    const userId = req.user.id;
    const taskId = req.params.id;
    
    // First check if the task belongs to the user
    db.query("SELECT * FROM tasks WHERE id = ? AND user_id = ?", [taskId, userId], (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });
        
        if (results.length === 0) {
            return res.status(404).json({ message: "Task not found or not authorized" });
        }
        
        // Delete the task
        db.query("DELETE FROM tasks WHERE id = ?", [taskId], (err, result) => {
            if (err) return res.status(500).json({ message: "Failed to delete task" });
            
            res.json({ message: "Task deleted successfully" });
        });
    });
});

// ✅ Default Route
app.get("/", (req, res) => {
    res.send("Welcome to the Todo App API!");
});

// ✅ Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
