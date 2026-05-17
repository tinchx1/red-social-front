/**
 * Converts plain text URLs into clickable anchor tags with proper attributes.
 *
 * Detects URLs starting with "http://", "https://", or "www." and wraps them in
 * <a> tags with target="_blank" and rel="noopener noreferrer" for security.
 *
 * @param {string} text - The input string that may contain URLs.
 * @returns {string} The modified string with URLs converted to clickable links.
 *
 * @example
 * const input = "Visit https://example.com or www.google.com";
 * const output = linkify(input);
 * // output: 'Visit <a href="https://example.com" target="_blank" rel="noopener noreferrer">https://example.com</a> or <a href="https://www.google.com" target="_blank" rel="noopener noreferrer">www.google.com</a>'
 */
export default function linkify(text) {
    const urlRegex = /((https?:\/\/|www\.)[^\s]+)/g;

    return text.replace(urlRegex, (url) => {
        const fullUrl = url.startsWith("http") ? url : `https://${url}`;
        const isSolicitud = fullUrl.includes("/panel/solicitudes?requestId=");
        const visibleText = isSolicitud ? "Ver solicitud" : url;

        return `<a href="${fullUrl}" target="_blank" rel="noopener noreferrer">${visibleText}</a>`;
    });
}