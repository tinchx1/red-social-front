import WordIcon from "./word.svg";
import ExcelIcon from "./excel.svg";
import PdfIcon from "./pdf.svg";
import PngIcon from "./png.svg";
import JpgIcon from "./jpg.svg";
import GifIcon from "./gif.svg";

const FileIcons = ({ fileExtension }) => {
    const ext = fileExtension.toLowerCase();

    const wordExtensions = ["doc", "docx", "odt"];
    const excelExtensions = ["xls", "xlsx", "csv", "ods"];
    const pdfExtensions = ["pdf"];
    const pngExtensions = ["png"];
    const jpgExtensions = ["jpg", "jpeg"];
    const gifExtensions = ["gif"];

    if (wordExtensions.includes(ext)) return <WordIcon />;
    if (excelExtensions.includes(ext)) return <ExcelIcon />;
    if (pdfExtensions.includes(ext)) return <PdfIcon />;
    if (pngExtensions.includes(ext)) return <PngIcon />;
    if (jpgExtensions.includes(ext)) return <JpgIcon />;
    if (gifExtensions.includes(ext)) return <GifIcon />;

    return null;
}

export default FileIcons;