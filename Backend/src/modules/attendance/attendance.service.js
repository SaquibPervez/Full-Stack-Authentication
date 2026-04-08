// ══════════════════════════════════════════════════
// Attendance Service — Business Logic
// Migrated from: hrmsController.js (lines 85-242)
// ══════════════════════════════════════════════════

import attendanceRepository from './attendance.repository.js';
import { ApiError } from '../../shared/ApiError.js';

class AttendanceService {
  async togglePunch(userId) {
    const todayRecord = await attendanceRepository.findTodayByUser(userId);

    // CASE 1: No record → Punch In
    if (!todayRecord) {
      const record = await attendanceRepository.createPunchIn(userId);
      return { action: 'in', message: 'Punch-in successful', record };
    }

    // CASE 2: Already punched out
    if (todayRecord.punchOut) {
      throw ApiError.badRequest('You have already completed your shift today.');
    }

    // CASE 3: Punched in → Punch Out
    const record = await attendanceRepository.updatePunchOut(todayRecord.id, todayRecord.punchIn);
    return { action: 'out', message: 'Punch-out successful', record };
  }

  async getMyTimeSheet(userId) {
    const timesheet = await attendanceRepository.getWeeklyByUser(userId);

    const todayStr = new Date().toISOString().split('T')[0];
    const today = timesheet.find(
      (ts) => new Date(ts.date).toISOString().split('T')[0] === todayStr
    );

    let currentState = 'offline';
    if (today && today.punchIn && !today.punchOut) currentState = 'online';

    return { currentState, today: today || null, timesheet };
  }

  async getTeamAttendance() {
    const rawTeam = await attendanceRepository.getTeamToday();

    const team = rawTeam.map((emp) => {
      const att = emp.attendance?.[0];
      let liveStatus = 'offline';
      if (att?.punchIn && !att?.punchOut) liveStatus = 'online';
      else if (att?.punchIn && att?.punchOut) liveStatus = 'completed';

      return {
        id: emp.id,
        username: emp.username,
        email: emp.email,
        designation: emp.designation,
        punch_in: att?.punchIn || null,
        punch_out: att?.punchOut || null,
        total_hours: att?.totalHours ? Number(att.totalHours) : null,
        attendance_status: att?.status || null,
        live_status: liveStatus,
      };
    });

    // Sort: online first, then completed, then offline
    team.sort((a, b) => {
      const order = { online: 0, completed: 1, offline: 2 };
      return (order[a.live_status] || 2) - (order[b.live_status] || 2);
    });

    const summary = {
      total: team.length,
      online: team.filter((m) => m.live_status === 'online').length,
      completed: team.filter((m) => m.live_status === 'completed').length,
      offline: team.filter((m) => m.live_status === 'offline').length,
    };

    return { team, summary };
  }

  async markDailyAbsentees() {
    return attendanceRepository.markAbsentees();
  }
}

export default new AttendanceService();
