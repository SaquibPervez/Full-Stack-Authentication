import pool from '../config/db.js';
import { createnewTask } from '../Models/userModel.js';

export const createTask = async (req, res) => {
    try {
        const { title, description, priority, due_date, assigned_to } = req.body;
        
        // 1. Kisne banaya? (Token se nikala)
        const created_by = req.user.id; 

        // 2. Validation
        if (!title) {
            return res.json({ message: "Task Title is required" });
        }

        // 3. Database mein Insert karo
        const newTask = await createnewTask(title, description, priority, due_date, assigned_to, created_by);

        res.json({ 
            message: "Task Created Successfully", 
            task: newTask 
        });

    } catch (error) {
        console.error(error);
        res.json({ message: "Server Error" });
    }
};


export const editTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, priority, due_date, assigned_to, status } = req.body;
        const updatedTask = await pool.query(
            "UPDATE tasks SET title = $1, description = $2, priority = $3, due_date = $4, assigned_to = $5, status = $6 WHERE id = $7 RETURNING *",
            [title, description, priority, due_date, assigned_to, status, id]
        );
        res.json({ message: "Task Updated Successfully", task: updatedTask.rows[0] });
    } catch (error) {
        console.error(error);
        res.json({ message: "Server Error" });
    }
};

export const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query("DELETE FROM tasks WHERE id = $1", [id]);
        res.json({ message: "Task Deleted Successfully" });
    } catch (error) {
        console.error(error);
        res.json({ message: "Server Error" });
    }
};

export const getFullTaskDetails = async (req, res) => {
    try {
        const query = `
            SELECT 
                t.id, 
                t.title, 
                t.description,
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