const d = new Date('2026-08-16T19:00:00.000Z'); // Aug 17, 1:00 AM local
const timezoneOffset = -360;
const startHour = 9;
const startMinute = 0;

const localMs = d.getTime() - (timezoneOffset * 60000);
const localDate = new Date(localMs);
localDate.setUTCHours(startHour, startMinute, 0, 0);

const utcMs = localDate.getTime() + (timezoneOffset * 60000);
const newStart = new Date(utcMs);

console.log("Old UTC:", d.toISOString());
console.log("New UTC:", newStart.toISOString());
