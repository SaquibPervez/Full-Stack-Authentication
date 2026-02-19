export const autorizeRoles = (...allowedRoles) => (req, res, next) => {
    const userRole = req.user?.role;
    if (!userRole) {
        return res.status(403).json({ error: 'Access Denied: No Role Found' });
    }
    if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({ error: 'Access Denied: Insufficient Permissions' });
    }
    next();
};