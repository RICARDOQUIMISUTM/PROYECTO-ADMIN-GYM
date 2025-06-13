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
    .getElementById("btn-generar-rutinas")
    .addEventListener("click", () => generarInforme("rutinas"));
  // Event listeners para informes de pagos
  document
    .getElementById("btn-generar-informe")
    .addEventListener("click", generarInformePagos);

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

async function generarInformePagos() {
  const estado = document.getElementById("filtro-estado").value;
  const fechaInicio = document.getElementById("fecha-inicio").value;
  const fechaFin = document.getElementById("fecha-fin").value;

  try {
    let url = "/api/informes/pagos?";
    const params = new URLSearchParams();

    if (estado && estado !== "todos") {
      params.append("estado", estado);
    }
    if (fechaInicio) {
      params.append("fecha_inicio", fechaInicio);
    }
    if (fechaFin) {
      params.append("fecha_fin", fechaFin);
    }

    const response = await fetch(url + params.toString());
    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    if (!data || data.length === 0) {
      throw new Error("No se encontraron pagos con los filtros seleccionados");
    }

    generarPDFPagos(data, obtenerTituloInforme(estado, fechaInicio, fechaFin));
  } catch (error) {
    console.error("Error al generar el informe:", error);
    alert("Error al generar el informe: " + error.message);
  }
}

function obtenerTituloInforme(estado, fechaInicio, fechaFin) {
  let titulo = "Informe de Pagos";

  if (estado && estado !== "todos") {
    titulo += ` (${capitalizeFirstLetter(estado)})`;
  }

  if (fechaInicio || fechaFin) {
    titulo += " - Filtrado por fecha";
    if (fechaInicio && fechaFin) {
      titulo += `: ${fechaInicio} al ${fechaFin}`;
    } else if (fechaInicio) {
      titulo += ` desde ${fechaInicio}`;
    } else {
      titulo += ` hasta ${fechaFin}`;
    }
  }

  return titulo;
}

function generarPDFPagos(data, titulo) {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();

  // Título del informe
  pdf.setFontSize(20);
  pdf.text(titulo, 14, 20);

  // Fecha del informe
  pdf.setFontSize(10);
  pdf.text(`Generado el: ${new Date().toLocaleDateString()}`, 14, 30);

  // Preparar datos para la tabla
  const headers = ["ID Pago", "Cliente", "Fecha", "Monto", "Tipo", "Estado"];

  const rows = data.map((pago) => [
    pago.id_pago,
    pago.cliente_nombre,
    pago.fecha_pago,
    `$${pago.monto.toFixed(2)}`,
    capitalizeFirstLetter(pago.tipo),
    capitalizeFirstLetter(pago.estado),
  ]);

  // Generar la tabla
  pdf.autoTable({
    head: [headers],
    body: rows,
    startY: 35,
    styles: {
      cellPadding: 5,
      fontSize: 9,
      valign: "middle",
    },
    columnStyles: {
      0: { cellWidth: 15 }, // ID
      2: { cellWidth: 20 }, // Fecha
      3: { cellWidth: 20 }, // Monto
      4: { cellWidth: 25 }, // Tipo
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

  // Calcular totales
  const totalPagado = data
    .filter((p) => p.estado === "pagado")
    .reduce((sum, pago) => sum + pago.monto, 0);

  const totalPendiente = data
    .filter((p) => p.estado === "pendiente")
    .reduce((sum, pago) => sum + pago.monto, 0);

  // Agregar totales al PDF
  let yPos = pdf.lastAutoTable.finalY + 10;

  pdf.setFontSize(10);
  pdf.setTextColor(0, 100, 0);
  pdf.text(`Total Pagado: $${totalPagado.toFixed(2)}`, 14, yPos);

  pdf.setTextColor(150, 0, 0);
  pdf.text(`Total Pendiente: $${totalPendiente.toFixed(2)}`, 14, yPos + 5);

  pdf.setTextColor(0, 0, 0);
  pdf.text(`Total Registros: ${data.length}`, 14, yPos + 10);

  // Guardar y mostrar el PDF
  const pdfBlob = pdf.output("blob");
  const pdfUrl = URL.createObjectURL(pdfBlob);

  document.getElementById("pdf-frame").src = pdfUrl;
  document.getElementById("pdf-preview").classList.remove("hidden");
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
  a.download = "informe_pagos.pdf";
  a.click();
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
document.getElementById("menu-toggle").addEventListener("click", function () {
  document.getElementById("menu").classList.toggle("active");
});
