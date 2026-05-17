/**
 * Formats a file size from megabytes (MB) into a human-readable string.
 *
 * - Converts to kilobytes (KB) if the size is less than 1 MB.
 * - Converts to gigabytes (GB) if the size is greater than 1024 MB (1 GB).
 * - Otherwise, keeps the size in MB.
 *
 * @param {number} fileWeightMb - The file size in megabytes (MB).
 * @returns {string} A formatted string representing the file size in KB, MB, or GB.
 *
 * @example
 * fileWeightFormat(0.5); // "512KB"
 * fileWeightFormat(50);  // "50MB"
 * fileWeightFormat(2048); // "2GB"
 */
const fileWeightFormat = (fileWeightMb) => {
    if (fileWeightMb < 1) {
        const kbFormat = fileWeightMb * 1024;
        return `${kbFormat}KB`;
    }

    if (fileWeightMb > 1024) {
        const gbFormat = fileWeightMb / 1024;
        return `${gbFormat}GB`;
    }

    return `${fileWeightMb}MB`;
}

export default fileWeightFormat;