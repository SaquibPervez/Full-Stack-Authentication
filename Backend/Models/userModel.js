import pool from "../config/db.js";

export const findUserByEmail = async (email) => {
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
  return result.rows[0];
};

export const createUser = async (username, email, hashedPassword, role, designation) => {
    const result = await pool.query(
        "INSERT INTO users (username, email, password, role, designation) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [username, email, hashedPassword, role, designation]
    );
    return result.rows[0];
}

export const createnewTask = async (title, description, priority, due_date, assigned_to, created_by) => {
    const result = await pool.query(
        "INSERT INTO tasks (title, description, priority, due_date, assigned_to, created_by) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",  
        [title, description, priority, due_date, assigned_to, created_by]
    );
    return result.rows[0];
}