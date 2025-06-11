document.addEventListener("DOMContentLoaded", function () {
  // Mostrar fecha actual
  mostrarFechaActual();

  // Event listeners para modales
  configurarModales();

  // Gestión de rutinas
  document
    .getElementById("btn-crear-rutina")
    .addEventListener("click", crearRutina);
  document
    .getElementById("btn-lista-rutinas")
    .addEventListener("click", mostrarListaRutinas);
});

// Funciones auxiliares comunes
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

function configurarModales() {
  document.querySelectorAll(".close-modal, .modal").forEach((element) => {
    element.addEventListener("click", function (e) {
      if (
        e.target.classList.contains("close-modal") ||
        e.target.classList.contains("modal")
      ) {
        document.querySelectorAll(".modal").forEach((modal) => {
          modal.classList.add("hidden");
        });
      }
    });
  });

  document.querySelectorAll(".modal-content").forEach((content) => {
    content.addEventListener("click", function (e) {
      e.stopPropagation();
    });
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      document.querySelectorAll(".modal").forEach((modal) => {
        modal.classList.add("hidden");
      });
    }
  });
}

// Funciones para rutinas
async function crearRutina() {
  const rutinaData = {
    nombre: document.getElementById("nombre-rutina").value,
    descripcion: document.getElementById("descripcion-rutina").value,
    nivel: document.getElementById("nivel-rutina").value,
  };

  if (!rutinaData.nombre) {
    alert("Por favor ingrese un nombre para la rutina");
    return;
  }

  try {
    const response = await fetch("/api/rutinas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rutinaData),
    });

    if (!response.ok) throw new Error("Error al crear la rutina");

    const result = await response.json();
    alert("Rutina creada exitosamente");
    document.getElementById("nombre-rutina").value = "";
    document.getElementById("descripcion-rutina").value = "";
    window.location.reload();
  } catch (error) {
    console.error("Error:", error);
    alert("Error al crear la rutina: " + error.message);
  }
}

async function mostrarListaRutinas() {
  try {
    const response = await fetch("/api/rutinas");
    const rutinas = await response.json();

    let html = `
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Nivel</th>
            <th>Descripción</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
    `;

    rutinas.forEach((rutina) => {
      html += `
        <tr data-id="${rutina.id_rutina}">
          <td>${rutina.id_rutina}</td>
          <td>${rutina.nombre}</td>
          <td>${rutina.nivel}</td>
          <td>${rutina.descripcion || "Sin descripción"}</td>
          <td><button class="danger btn-eliminar-rutina">Eliminar</button></td>
        </tr>
      `;
    });

    html += "</tbody></table>";

    const modal = alertHtml("Lista de Rutinas", html);

    modal.querySelectorAll(".btn-eliminar-rutina").forEach((btn) => {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        const id = this.closest("tr").dataset.id;
        eliminarRutina(id);
      });
    });
  } catch (error) {
    console.error("Error:", error);
    alert("Error al cargar las rutinas");
  }
}

async function eliminarRutina(id) {
  if (!confirm("¿Está seguro que desea eliminar esta rutina?")) return;

  try {
    const response = await fetch(`/api/rutinas/${id}`, { method: "DELETE" });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error al eliminar la rutina");
    }

    alert("Rutina eliminada exitosamente");
    document
      .querySelectorAll(".custom-alert")
      .forEach((alert) => alert.remove());
    document.getElementById("btn-lista-rutinas").click();
  } catch (error) {
    console.error("Error:", error);
    alert("Error al eliminar la rutina: " + error.message);
  }
}

// Función auxiliar para mostrar alertas con HTML
function alertHtml(title, html) {
  const alertDiv = document.createElement("div");
  alertDiv.className = "custom-alert";
  alertDiv.style.position = "fixed";
  alertDiv.style.top = "50%";
  alertDiv.style.left = "50%";
  alertDiv.style.transform = "translate(-50%, -50%)";
  alertDiv.style.backgroundColor = "#000000";
  alertDiv.style.padding = "13px";
  alertDiv.style.borderRadius = "8px";
  alertDiv.style.boxShadow = "0 2px 10px rgba(0, 0, 0, 0.5)";
  alertDiv.style.zIndex = "1000";
  alertDiv.style.maxWidth = "80%";
  alertDiv.style.maxHeight = "80vh";
  alertDiv.style.overflow = "auto";

  alertDiv.innerHTML = `
    <h3 style="margin-top: 0;">${title}</h3>
    <div>${html}</div>
    <button id="btn-cerrar-modal" style="margin-top: 15px; padding: 8px 15px; background-color: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer;">
      Cerrar
    </button>
  `;

  document.body.appendChild(alertDiv);

  document
    .getElementById("btn-cerrar-modal")
    .addEventListener("click", function () {
      document.body.removeChild(alertDiv);
    });

  alertDiv.addEventListener("click", function (e) {
    if (e.target === alertDiv) {
      document.body.removeChild(alertDiv);
    }
  });

  return alertDiv;
}
document.getElementById("menu-toggle").addEventListener("click", function () {
  document.getElementById("menu").classList.toggle("active");
});
