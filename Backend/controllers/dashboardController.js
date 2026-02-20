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


export const getManagerStats = async (req, res, next) => {
    try {
        const managerId = req.user.id;

        const [tasksRes, distRes, teamRes, workloadRes, recentTasksRes] = await Promise.all([
            pool.query("SELECT COUNT(*) FROM tasks WHERE created_by = $1", [managerId]),
            pool.query("SELECT status, COUNT(*) FROM tasks WHERE created_by = $1 GROUP BY status", [managerId]),
            pool.query(`
                SELECT DISTINCT u.id, u.username, u.email, u.designation, u.is_active 
                FROM users u
                JOIN tasks t ON u.id = t.assigned_to
                WHERE t.created_by = $1 AND u.role = 'employee'
            `, [managerId]),
            
            // 🔥 NEW 1: Workload per employee
            pool.query(`
                SELECT u.username, COUNT(t.id) as task_count 
                FROM users u 
                LEFT JOIN tasks t ON u.id = t.assigned_to AND t.status != 'completed'
                WHERE t.created_by = $1 
                GROUP BY u.username
                ORDER BY task_count DESC
            `, [managerId]),

            // 🔥 NEW 2: 3 Most Recent Tasks
            pool.query(`
                SELECT id, title, status, due_date 
                FROM tasks 
                WHERE created_by = $1 
                ORDER BY created_at DESC 
                LIMIT 3
            `, [managerId])
        ]);

        res.status(200).json({
            totalTasks: parseInt(tasksRes.rows[0].count, 10),
            taskDistribution: distRes.rows.map(row => ({
                status: row.status,
                count: parseInt(row.count, 10)
            })),
            teamMembers: teamRes.rows,
            teamSize: teamRes.rows.length,
            teamWorkload: workloadRes.rows, // Array [{username: 'Saquib', task_count: 2}, ...]
            recentTasks: recentTasksRes.rows  // Array of latest 3 tasks
        });

    } catch (error) {
        next(error);
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


