// ══════════════════════════════════════════════════
// Constants — Shared Enums & Config Values
// Used across services, controllers, and validation.
// ══════════════════════════════════════════════════

export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  EMPLOYEE: 'employee',
};

export const TASK_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
};

export const TASK_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
};

export const PAYROLL_STATUS = {
  PAID: 'paid',
  PENDING: 'pending',
};

export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
};

// ─── Valid Status Transitions ───
// Defines which status can transition to which
export const VALID_STATUS_TRANSITIONS = {
  [TASK_STATUS.PENDING]: [TASK_STATUS.IN_PROGRESS],
  [TASK_STATUS.IN_PROGRESS]: [TASK_STATUS.COMPLETED, TASK_STATUS.PENDING],
  [TASK_STATUS.COMPLETED]: [TASK_STATUS.PENDING], // Re-open
};
