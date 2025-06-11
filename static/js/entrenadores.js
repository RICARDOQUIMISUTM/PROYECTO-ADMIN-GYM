document.addEventListener("DOMContentLoaded", function () {
  // Mostrar fecha actual
  mostrarFechaActual();

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
    document.getElementById("form-entrenador").reset();
    window.location.reload();
  } catch (error) {
    console.error("Error:", error);
    alert("Error al guardar el entrenador: " + error.message);
  }
}

function cancelarEdicionEntrenador() {
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
    console.error("error:", error);
    alert("Error al filtrar asignaciones");
  }
}
document.getElementById("menu-toggle").addEventListener("click", function () {
  document.getElementById("menu").classList.toggle("active");
});
