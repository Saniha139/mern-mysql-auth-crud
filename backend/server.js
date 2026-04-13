const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

//  MySQL Connection
const db = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "", 
  database: "mern_auth_db"
});

db.connect((err) => {
  if (err) {
    console.log("DB Error:", err);
  } else {
    console.log("MySQL Connected");
  }
});


app.get("/", (req, res) => {
  res.send("API Running");
});


const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) return res.status(403).json("No token");

  jwt.verify(token, "secretkey", (err, decoded) => {
    if (err) return res.status(401).json("Invalid token");
    req.userId = decoded.id;
    next();
  });
};


app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql =
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";

    db.query(sql, [name, email, hashedPassword], (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "User registered successfully" });
    });
  } catch (error) {
    res.status(500).json(error);
  }
});


app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT * FROM users WHERE email = ?";

  db.query(sql, [email], async (err, result) => {
    if (err) return res.status(500).json(err);

    if (result.length === 0) {
      return res.json({ message: "User not found" });
    }

    const user = result[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.json({ message: "Wrong password" });
    }

    const token = jwt.sign({ id: user.id }, "secretkey", {
      expiresIn: "1d"
    });

    res.json({ message: "Login success", token });
  });
});

app.get("/me", verifyToken, (req, res) => {
  const sql = "SELECT id, name, email FROM users WHERE id = ?";

  db.query(sql, [req.userId], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result[0]);
  });
});


app.get("/items", verifyToken, (req, res) => {
  const sql = "SELECT * FROM items WHERE user_id = ?";

  db.query(sql, [req.userId], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});


app.post("/items", verifyToken, (req, res) => {
  const { title, description } = req.body;

  const sql =
    "INSERT INTO items (user_id, title, description) VALUES (?, ?, ?)";

  db.query(sql, [req.userId, title, description], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Item added successfully" });
  });
});


app.put("/items/:id", verifyToken, (req, res) => {
  const { title, description } = req.body;

  const sql =
    "UPDATE items SET title = ?, description = ? WHERE id = ?";

  db.query(sql, [title, description, req.params.id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Item updated" });
  });
});


app.delete("/items/:id", verifyToken, (req, res) => {
  const sql = "DELETE FROM items WHERE id = ?";

  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Item deleted" });
  });
});


app.get("/stats", verifyToken, (req, res) => {
  const sql = "SELECT COUNT(*) as total FROM items WHERE user_id = ?";

  db.query(sql, [req.userId], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result[0]);
  });
});


app.listen(5000, () => {
  console.log("Server running on port 5000");
});