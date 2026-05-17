import dayjs from "dayjs";
import "dayjs/locale/es";

/**
 * Formats a date based on how long ago it was using dayjs.js library.
 *
 * - If it's today and within the last 24 hours, shows the time in "HH:mm" format.
 * - If it was yesterday, returns "Ayer".
 * - If it was within the last 7 days, returns the weekday name (e.g., "Lunes").
 * - If it was more than 7 days ago, returns "DD/MM/YYYY".
 *
 * @param {string|Date|dayjs.Dayjs} date - The date to format.
 * @param {boolean} [withTime=false] - Display with time.
 * @returns {string} A human-readable date string.
 */
export default function formatCustomDate(date, withTime = false) {
    dayjs.locale("es");

    const now = dayjs();
    const inputDate = dayjs(date);

    if (now.isSame(inputDate, 'day')) {
        return inputDate.format("HH:mm");
    } else if (now.clone().subtract(1, 'day').isSame(inputDate, 'day')) {
        return `Ayer ${withTime ? inputDate.format("HH:mm") : ""}`;
    } else if (now.diff(inputDate, 'days') < 7) {
        return withTime ? inputDate.format("dddd HH:mm") : inputDate.format("dddd");
    } else {
        return withTime ? inputDate.format("DD/MM/YYYY HH:mm") : inputDate.format("DD/MM/YYYY");
    }
}
