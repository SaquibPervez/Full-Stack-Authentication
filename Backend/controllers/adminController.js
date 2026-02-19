import bcrypt from 'bcryptjs';
import pool from '../config/db.js';
import { findUserByEmail } from '../Models/userModel.js';

export const createUser = async (req, res) => {
    try {
        const { username, email, password, role, designation } = req.body;

        const allowedRoles = ['manager', 'employee'];
        
        if (!allowedRoles.includes(role)) {
            return res.json({ 
                message: "Invalid Role. Admin can only create 'manager' or 'employee'." 
            });
        }

        const checkUser = await findUserByEmail(email);
        if (checkUser) {
            return res.json({ message: "Email already in use" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            "INSERT INTO users (username, email, password, role, designation) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [username, email, hashedPassword, role, designation]
        );
        const newUser = result.rows[0];
    
            res.json({ 
                message: `${role.charAt(0).toUpperCase() + role.slice(1)} created successfully!`, 
            user: newUser 
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

export const getFullTaskDetails = async (req, res) => {
    try {
        const query = `
            SELECT 
                t.id, 
                t.title, 
                t.status, 
                t.priority, 
                t.due_date,
                
                -- Creator Details (Jisne banaya)
                c.username AS created_by_name,
                c.email AS created_by_email,

                -- Assignee Details (Jisko mila)
                a.username AS assigned_to_name,
                a.designation AS assigned_to_designation,
                a.email AS assigned_to_email

            FROM tasks t
            LEFT JOIN users c ON t.created_by = c.id  -- Join for Creator
            LEFT JOIN users a ON t.assigned_to = a.id -- Join for Assignee
            ORDER BY t.created_at DESC; -- Latest task upar
        `;

        const result = await pool.query(query);
        res.json(result.rows);

    } catch (error) {
        console.error("Error fetching tasks:", error);
        res.status(500).json({ message: "Server Error fetching tasks" });
    }
};


export const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        await pool.query("DELETE FROM users WHERE id = $1", [userId]);
        res.json({ message: "User deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};