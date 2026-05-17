/**
 * Extracts the file name and extension from a given URL or path
 * @param {string} fileUrl - File URL or path
 * @returns {{ name: string, extension: string, fullFileName: string }} - Object containing the file name and extension
 */
const getFileUrlInfo = (fileUrl = "") => {
  if (!fileUrl) return { name: "", extension: "", fullFileName: "" };

  try {
    // Remove query params and anchors
    const cleanUrl = fileUrl.split("?")[0].split("#")[0];

    // Get only the last part after "/"
    const fullFileName = cleanUrl.substring(cleanUrl.lastIndexOf("/") + 1);

    // If there's no extension, return only the name
    if (!fullFileName.includes(".")) {
      return { name: fullFileName, extension: "" };
    }

    const lastDotIndex = fullFileName.lastIndexOf(".");
    const name = fullFileName.substring(0, lastDotIndex);
    const extension = fullFileName.substring(lastDotIndex + 1);

    return { name, extension, fullFileName };
  } catch (error) {
    console.error("Error extracting file info:", error);
    return { name: "", extension: "", fullFileName: "" };
  }
}

export default getFileUrlInfo;