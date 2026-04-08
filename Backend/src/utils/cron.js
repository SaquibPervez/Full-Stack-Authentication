import cron from 'node-cron';
import attendanceService from '../modules/attendance/attendance.service.js';

/**
 * Initializes all background cron jobs for ProFlow HRMS.
 */
const initCronJobs = () => {
  // Daily Absentee Marker: Runs at 23:55 (11:55 PM) every day
  // Marks all employees without a punch-in record as 'absent'
  cron.schedule('55 23 * * *', async () => {
    console.log('⏰ [CRON] Starting daily absentee-marker...');
    try {
      const absenteeCount = await attendanceService.markDailyAbsentees();
      console.log(`✅ [CRON] Completed: Marked ${absenteeCount} employees as absent.`);
    } catch (err) {
      console.error('❌ [CRON] Failed to mark absentees:', err.message);
    }
  });

  console.log('📅 [CRON] Background jobs scheduled for 23:55 Daily.');
};

export default initCronJobs;
