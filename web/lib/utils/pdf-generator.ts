import jsPDF from "jspdf";
import html2canvas from "html2canvas-pro";

export async function generatePDFFromElement(
  elementId: string,
  filename: string
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found`);
  }

  // Temporarily make element visible for capture
  const originalStyle = element.style.cssText;
  element.style.position = "absolute";
  element.style.left = "0";
  element.style.top = "0";
  element.style.zIndex = "9999";
  element.style.visibility = "visible";

  try {
    // Create canvas from HTML element
    // html2canvas-pro supports modern CSS color functions like oklch() and lab()
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      width: element.scrollWidth,
      height: element.scrollHeight,
      allowTaint: true,
    });

    // Calculate PDF dimensions
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const pdf = new jsPDF("p", "mm", "a4");

    // Handle multi-page PDF if content is taller than one page
    let heightLeft = imgHeight;
    let position = 0;

    // Add first page
    const imgData = canvas.toDataURL("image/png", 1.0);
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);

    // Add additional pages if needed
    heightLeft -= pageHeight;
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Save PDF
    pdf.save(filename);
  } finally {
    // Restore original style
    element.style.cssText = originalStyle;
  }
}
