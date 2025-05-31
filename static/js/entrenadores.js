document.addEventListener("DOMContentLoaded", function () {
  // Mostrar fecha actual
  mostrarFechaActual();

  // Variables globales
  let entrenadorEditando = null;

  // Event listeners para modales
  configurarModales();

  // Gestión de entrenadores
  document
    .getElementById("btn-nuevo-entrenador")
    .addEventListener("click", nuevoEntrenador);
  document
    .getElementById("form-entrenador")
    .addEventListener("submit", guardarEntrenador);
  document
    .getElementById("btn-cancelar-entrenador")
    .addEventListener("click", cancelarEdicionEntrenador);

  // Delegación de eventos para botones en la tabla de entrenadores
  document
    .getElementById("entrenadores-table")
    .addEventListener("click", manejarEventosTablaEntrenadores);

  // Gestión de asignaciones
  document
    .getElementById("btn-asignar-cliente")
    .addEventListener("click", mostrarModalAsignar);
  document
    .getElementById("btn-ver-asignados")
    .addEventListener("click", mostrarModalAsignaciones);
  document
    .getElementById("form-asignacion")
    .addEventListener("submit", asignarCliente);
  document
    .getElementById("filtro-entrenador")
    .addEventListener("change", filtrarAsignaciones);

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

// Funciones para entrenadores
function nuevoEntrenador() {
  entrenadorEditando = null;
  document.getElementById("entrenador-id").value = "";
  document.getElementById("form-entrenador").reset();
  document.getElementById("titulo-panel-entrenador").textContent =
    "Nuevo Entrenador";
  document.getElementById("panel-entrenador").classList.remove("hidden");
  document.getElementById("btn-guardar-entrenador").textContent =
    "Registrar Entrenador";
}

async function guardarEntrenador(e) {
  e.preventDefault();

  const form = document.getElementById("form-entrenador");
  const entrenadorId = document.getElementById("entrenador-id").value;
  const url = entrenadorId
    ? `/api/entrenadores/${entrenadorId}`
    : "/api/entrenadores";
  const method = entrenadorId ? "PUT" : "POST";

  const entrenadorData = {
    nombre: document.getElementById("nombre-entrenador").value,
    especialidad: document.getElementById("especialidad").value,
    telefono: document.getElementById("telefono-entrenador").value,
    correo: document.getElementById("correo-entrenador").value,
  };

  try {
    const response = await fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entrenadorData),
    });

    if (!response.ok) throw new Error("Error al guardar el entrenador");

    const result = await response.json();
    alert(
      entrenadorId
        ? "Entrenador actualizado exitosamente"
        : "Entrenador registrado exitosamente"
    );
    form.reset();
    window.location.reload();
  } catch (error) {
    console.error("Error:", error);
    alert("Error al guardar el entrenador: " + error.message);
  }
}

function cancelarEdicionEntrenador() {
  entrenadorEditando = null;
  document.getElementById("panel-entrenador").classList.add("hidden");
  document.getElementById("form-entrenador").reset();
}

function manejarEventosTablaEntrenadores(e) {
  const row = e.target.closest("tr");
  if (!row) return;

  const id = row.dataset.id;

  if (e.target.classList.contains("btn-editar-entrenador")) {
    editarEntrenador(id);
  } else if (e.target.classList.contains("btn-eliminar-entrenador")) {
    eliminarEntrenador(id);
  }
}

async function editarEntrenador(id) {
  try {
    const response = await fetch(`/api/entrenadores/${id}`);
    if (!response.ok) throw new Error("Error al obtener datos del entrenador");

    const entrenador = await response.json();

    document.getElementById("nombre-entrenador").value = entrenador.nombre;
    document.getElementById("especialidad").value = entrenador.especialidad;
    document.getElementById("telefono-entrenador").value = entrenador.telefono;
    document.getElementById("correo-entrenador").value = entrenador.correo;
    document.getElementById("entrenador-id").value = entrenador.id_entrenador;

    document.getElementById("titulo-panel-entrenador").textContent =
      "Editar Entrenador";
    document.getElementById("panel-entrenador").classList.remove("hidden");
    document.getElementById("btn-guardar-entrenador").textContent =
      "Actualizar Entrenador";
  } catch (error) {
    console.error("Error:", error);
    alert("Error al cargar datos del entrenador: " + error.message);
  }
}

async function eliminarEntrenador(id) {
  if (
    !confirm(
      "¿Está seguro que desea eliminar este entrenador y reasignar sus clientes?"
    )
  )
    return;

  try {
    const response = await fetch(`/api/entrenadores/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error al eliminar el entrenador");
    }

    alert("Entrenador eliminado exitosamente");
    window.location.reload();
  } catch (error) {
    console.error("Error:", error);
    alert("Error al eliminar el entrenador: " + error.message);
  }
}

// Funciones para asignaciones
function mostrarModalAsignar() {
  document.getElementById("modal-asignar").classList.remove("hidden");
}

function mostrarModalAsignaciones() {
  document.getElementById("modal-asignaciones").classList.remove("hidden");
}

async function asignarCliente(e) {
  e.preventDefault();

  const clienteId = document.getElementById("modal-cliente").value;
  const rutinaId = document.getElementById("modal-rutina").value;
  const entrenadorId = document.getElementById("modal-entrenador").value;

  if (!clienteId || !rutinaId || !entrenadorId) {
    alert("Por favor complete todos los campos");
    return;
  }

  const asignacionData = {
    id_cliente: clienteId,
    id_rutina: rutinaId,
    id_entrenador: entrenadorId,
  };

  try {
    const response = await fetch("/api/asignaciones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(asignacionData),
    });

    if (!response.ok) throw new Error("Error al crear la asignación");

    const result = await response.json();
    alert("Asignación creada exitosamente");
    document.getElementById("modal-asignar").classList.add("hidden");
    document.getElementById("form-asignacion").reset();
    window.location.reload();
  } catch (error) {
    console.error("Error:", error);
    alert("Error al crear la asignación: " + error.message);
  }
}

async function filtrarAsignaciones() {
  const entrenadorId = document.getElementById("filtro-entrenador").value;

  try {
    const response = await fetch("/api/asignaciones");
    const asignaciones = await response.json();

    const filtered = asignaciones.filter(
      (a) => !entrenadorId || a.id_entrenador.toString() === entrenadorId
    );

    let html = `
      <table>
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Rutina</th>
            <th>Entrenador</th>
            <th>Fecha</th>
          </tr>
        </thead>
        <tbody>
    `;

    filtered.forEach((asignacion) => {
      html += `
        <tr>
          <td>${asignacion.cliente_nombre}</td>
          <td>${asignacion.rutina_nombre}</td>
          <td>${asignacion.entrenador_nombre}</td>
          <td>${asignacion.fecha_asignacion}</td>
        </tr>
      `;
    });

    html += "</tbody></table>";
    document.getElementById("lista-asignaciones").innerHTML = html;
  } catch (error) {
    console.error("Error:", error);
    alert("Error al filtrar asignaciones");
  }
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
