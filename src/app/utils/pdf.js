import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export const downloadPDF = async (element) => {
  if (!element) return;

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
  });

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF("p", "mm", "a4");

  const pdfWidth = 210;
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

  pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
  pdf.save("BMTA-Form.pdf");
};


  // const downloadPDF = async () => {
  //   setisPrint(true);

  //   // ⏳ wait for React to re-render
  //   setTimeout(async () => {
  //     const element = printRef.current;

  //     const canvas = await html2canvas(element, {
  //       scale: 2,
  //       useCORS: true,
  //     });

  //     const imgData = canvas.toDataURL("image/png");
  //     const pdf = new jsPDF("p", "mm", "a4");

  //     const pdfWidth = 210;
  //     const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

  //     pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
  //     pdf.save("BMTA-Form.pdf");

  //     setisPrint(false);
  //   }, 300); // 200–300ms is ideal
  // };