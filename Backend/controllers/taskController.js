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
        const { title, description, priority, due_date, assigned_to } = req.body;
        const updatedTask = await pool.query(
            "UPDATE tasks SET title = $1, description = $2, priority = $3, due_date = $4, assigned_to = $5 WHERE id = $6 RETURNING *",
            [title, description, priority, due_date, assigned_to, id]
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