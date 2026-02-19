import pool from '../config/db.js';

// 👑 1. ADMIN DASHBOARD STATS
// Admin sab kuch dekh sakta hai (Total Users, Total Tasks, Cash Flow etc.)
export const getAdminStats = async (req, res) => {
    try {
        const [totalUsers, totalTasks, totalManagers, taskDistribution, allEmployees] = await Promise.all([
            pool.query("SELECT count(*) FROM users where role != 'admin'"), // 1. Total Log
            pool.query("SELECT count(*) FROM tasks"), // 2. Total Kaam
            pool.query("SELECT count(*) FROM users WHERE role = 'manager'"), // 3. Total Managers
            pool.query("SELECT status, count(*) FROM tasks GROUP BY status"), // 4. Graph Data
            
            pool.query(`
                SELECT id, username, email, designation, is_active, created_at 
                FROM users 
                WHERE role = 'employee' 
                ORDER BY created_at DESC
            `) 
        ]);

        res.json({
            users: totalUsers.rows[0].count,
            managers: totalManagers.rows[0].count,
            tasks: totalTasks.rows[0].count,
            taskDistribution: taskDistribution.rows,
            employees: allEmployees.rows // 👈 Ye rahi puri list array mein
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

// 👔 2. MANAGER DASHBOARD STATS
// Manager sirf WO data dekhega jo USNE create kiya hai or uski team ka hai.
export const getManagerStats = async (req, res) => {
    try {
        const managerId = req.user.id;

        const [myTasks, taskStatus] = await Promise.all([
            // Tasks created by THIS manager
            pool.query("SELECT count(*) FROM tasks WHERE created_by = $1", [managerId]),
            // Status breakdown of tasks created by THIS manager
            pool.query("SELECT status, count(*) FROM tasks WHERE created_by = $1 GROUP BY status", [managerId])
        ]);

        res.json({
            totalCreatedTasks: myTasks.rows[0].count,
            taskDistribution: taskStatus.rows
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

// 👷 3. EMPLOYEE DASHBOARD STATS
// Employee sirf APNE tasks dekhega (Assigned to ME).
export const getEmployeeStats = async (req, res) => {
    try {
        const employeeId = req.user.id;

        const [myPendingTasks, myCompletedTasks] = await Promise.all([
            // Pending/In Progress Tasks
            pool.query("SELECT count(*) FROM tasks WHERE assigned_to = $1 AND status != 'completed'", [employeeId]),
            // Completed Tasks
            pool.query("SELECT count(*) FROM tasks WHERE assigned_to = $1 AND status = 'completed'", [employeeId])
        ]);

        res.json({
            pendingTasks: myPendingTasks.rows[0].count,
            completedTasks: myCompletedTasks.rows[0].count
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};


