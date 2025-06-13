document.addEventListener("DOMContentLoaded", function () {
  // Mostrar fecha actual
  mostrarFechaActual();

  // Event listeners para generar informes
  document
    .getElementById("btn-generar-clientes")
    .addEventListener("click", () => generarInforme("clientes"));
  document
    .getElementById("btn-generar-entrenadores")
    .addEventListener("click", () => generarInforme("entrenadores"));
  document
    .getElementById("btn-generar-asignaciones")
    .addEventListener("click", () => generarInforme("asignaciones"));
  document
    .getElementById("btn-generar-pagos")
    .addEventListener("click", () => generarInforme("pagos"));

  // Event listener para descargar PDF
  document
    .getElementById("btn-descargar-pdf")
    .addEventListener("click", descargarPDF);
});

function mostrarFechaActual() {
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const fechaActual = new Date().toLocaleDateString("es-ES", options);
  document.getElementById("fecha-actual").textContent = fechaActual;
}

async function generarInforme(tipo) {
  try {
    const response = await fetch(`/api/${tipo}`);
    const data = await response.json();

    if (!data || data.length === 0) {
      throw new Error(`No hay datos disponibles para ${tipo}`);
    }

    // Usar jsPDF con el namespace correcto
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();

    // Título del informe
    pdf.setFontSize(20);
    pdf.text(`Informe de ${capitalizeFirstLetter(tipo)}`, 14, 20);

    // Fecha del informe
    pdf.setFontSize(10);
    pdf.text(`Generado el: ${new Date().toLocaleDateString()}`, 14, 30);

    // Preparar datos para la tabla
    const headers = Object.keys(data[0]).map((header) =>
      capitalizeFirstLetter(header.replace(/_/g, " "))
    );

    const rows = data.map((item) =>
      Object.values(item).map((value) =>
        typeof value === "object" ? JSON.stringify(value) : value
      )
    );

    // Generar la tabla
    pdf.autoTable({
      head: [headers],
      body: rows,
      startY: 35,
      styles: {
        cellPadding: 5,
        fontSize: 8,
        valign: "middle",
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
    });

    // Guardar y mostrar el PDF
    const pdfBlob = pdf.output("blob");
    const pdfUrl = URL.createObjectURL(pdfBlob);

    document.getElementById("pdf-frame").src = pdfUrl;
    document.getElementById("pdf-preview").classList.remove("hidden");
  } catch (error) {
    console.error("Error al generar el informe:", error);
    alert("Error al generar el informe: " + error.message);
  }
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function descargarPDF() {
  const pdfUrl = document.getElementById("pdf-frame").src;
  if (!pdfUrl) {
    alert("Primero genere un informe para descargar");
    return;
  }
  const a = document.createElement("a");
  a.href = pdfUrl;
  a.download = "informe.pdf";
  a.click();
}
