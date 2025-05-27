document.addEventListener("DOMContentLoaded", function () {
  // Mostrar fecha actual
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const fechaActual = new Date().toLocaleDateString("es-ES", options);
  document.getElementById("fecha-actual").textContent = fechaActual;

  // Variables globales
  let clienteEditando = null;
  let entrenadorEditando = null;

  // Event listeners para modales
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

  // Prevenir que el clic dentro del modal lo cierre
  document.querySelectorAll(".modal-content").forEach((content) => {
    content.addEventListener("click", function (e) {
      e.stopPropagation();
    });
  });

  // Cerrar modales con tecla ESC
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      document.querySelectorAll(".modal").forEach((modal) => {
        modal.classList.add("hidden");
      });
    }
  });

  // Gestión de clientes
  document
    .getElementById("btn-nuevo-cliente")
    .addEventListener("click", function () {
      clienteEditando = null;
      document.getElementById("cliente-id").value = "";
      document.getElementById("form-cliente").reset();
      document.getElementById("btn-guardar-cliente").textContent =
        "Registrar Cliente";
    });

  document
    .getElementById("form-cliente")
    .addEventListener("submit", function (e) {
      e.preventDefault();
      guardarCliente();
    });

  document
    .getElementById("btn-cancelar")
    .addEventListener("click", function () {
      clienteEditando = null;
      document.getElementById("form-cliente").reset();
    });

  // Delegación de eventos para botones en la tabla de clientes
  document
    .getElementById("clientes-table")
    .addEventListener("click", function (e) {
      const row = e.target.closest("tr");
      if (!row) return;

      const id = row.dataset.id;

      if (e.target.classList.contains("btn-editar")) {
        editarCliente(id);
      } else if (e.target.classList.contains("btn-detalles")) {
        verDetallesCliente(id);
      } else if (e.target.classList.contains("btn-eliminar")) {
        eliminarCliente(id);
      }
    });

  // Gestión de entrenadores
  document
    .getElementById("btn-nuevo-entrenador")
    .addEventListener("click", function () {
      entrenadorEditando = null;
      document.getElementById("entrenador-id").value = "";
      document.getElementById("form-entrenador").reset();
      document.getElementById("titulo-panel-entrenador").textContent =
        "Nuevo Entrenador";
      document.getElementById("panel-entrenador").classList.remove("hidden");
      document.getElementById("btn-guardar-entrenador").textContent =
        "Registrar Entrenador";
    });

  document
    .getElementById("form-entrenador")
    .addEventListener("submit", function (e) {
      e.preventDefault();
      guardarEntrenador();
    });

  document
    .getElementById("btn-cancelar-entrenador")
    .addEventListener("click", function () {
      entrenadorEditando = null;
      document.getElementById("panel-entrenador").classList.add("hidden");
      document.getElementById("form-entrenador").reset();
    });

  // Delegación de eventos para botones en la tabla de entrenadores
  document
    .getElementById("entrenadores-table")
    .addEventListener("click", function (e) {
      const row = e.target.closest("tr");
      if (!row) return;

      const id = row.dataset.id;

      if (e.target.classList.contains("btn-editar-entrenador")) {
        editarEntrenador(id);
      } else if (e.target.classList.contains("btn-detalles-entrenador")) {
        verDetallesEntrenador(id);
      } else if (e.target.classList.contains("btn-eliminar-entrenador")) {
        eliminarEntrenador(id);
      }
    });

  // Botón para asignar cliente
  document
    .getElementById("btn-asignar-cliente")
    .addEventListener("click", function () {
      document.getElementById("modal-asignar").classList.remove("hidden");
    });

  // Botón para ver asignaciones
  document
    .getElementById("btn-ver-asignados")
    .addEventListener("click", function () {
      document.getElementById("modal-asignaciones").classList.remove("hidden");
    });

  // Botón para confirmar asignación
  document
    .getElementById("form-asignacion")
    .addEventListener("submit", function (e) {
      e.preventDefault();
      asignarCliente();
    });

  // Gestión de rutinas
  document
    .getElementById("btn-crear-rutina")
    .addEventListener("click", function () {
      crearRutina();
    });

  document
    .getElementById("btn-lista-rutinas")
    .addEventListener("click", function () {
      fetch("/api/rutinas")
        .then((response) => response.json())
        .then((rutinas) => {
          let html =
            "<table><thead><tr><th>Nombre</th><th>Nivel</th><th>Descripción</th><th>Acciones</th></tr></thead><tbody>";

          rutinas.forEach((rutina) => {
            html += `<tr data-id="${rutina.id_rutina}">
                    <td>${rutina.nombre}</td>
                    <td>${rutina.nivel}</td>
                    <td>${rutina.descripcion || "Sin descripción"}</td>
                    <td><button class="danger btn-eliminar-rutina">Eliminar</button></td>
                </tr>`;
          });

          html += "</tbody></table>";

          const modal = alertHtml("Lista de Rutinas", html);

          // Agregar event listener para los botones de eliminar
          modal.querySelectorAll(".btn-eliminar-rutina").forEach((btn) => {
            btn.addEventListener("click", function (e) {
              e.stopPropagation(); // Prevenir que el clic se propague al modal
              const id = this.closest("tr").dataset.id;
              eliminarRutina(id);
            });
          });
        })
        .catch((error) => {
          console.error("Error:", error);
          alert("Error al cargar las rutinas");
        });
    });
  async function eliminarRutina(id) {
    if (!confirm("¿Está seguro que desea eliminar esta rutina?")) return;

    try {
      const response = await fetch(`/api/rutinas/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al eliminar la rutina");
      }

      alert("Rutina eliminada exitosamente");

      // Cerrar todos los modales abiertos
      document.querySelectorAll(".custom-alert").forEach((alert) => {
        alert.remove();
      });

      // Volver a mostrar la lista actualizada
      document.getElementById("btn-lista-rutinas").click();
    } catch (error) {
      console.error("Error:", error);
      alert("Error al eliminar la rutina: " + error.message);
    }
  }

  // Gestión de pagos
  document.getElementById("form-pago").addEventListener("submit", function (e) {
    e.preventDefault();
    registrarPago();
  });

  document
    .getElementById("btn-historial-pagos")
    .addEventListener("click", function () {
      document.getElementById("modal-pagos").classList.remove("hidden");
    });

  // Filtro para asignaciones
  document
    .getElementById("filtro-entrenador")
    .addEventListener("change", function () {
      filtrarAsignaciones();
    });

  // Filtro para pagos
  document
    .getElementById("filtro-cliente-pagos")
    .addEventListener("change", function () {
      filtrarPagos();
    });
});

// Funciones para clientes
async function guardarCliente() {
  const form = document.getElementById("form-cliente");
  const clienteId = document.getElementById("cliente-id").value;
  const url = clienteId ? `/api/clientes/${clienteId}` : "/api/clientes";
  const method = clienteId ? "PUT" : "POST";

  const clienteData = {
    nombre: document.getElementById("nombre").value,
    apellido: document.getElementById("apellido").value,
    dni: document.getElementById("dni").value,
    correo: document.getElementById("correo").value,
    telefono: document.getElementById("telefono").value,
    estado: document.getElementById("estado").value,
  };

  try {
    const response = await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(clienteData),
    });

    if (!response.ok) throw new Error("Error al guardar el cliente");

    const result = await response.json();
    alert(
      clienteId
        ? "Cliente actualizado exitosamente"
        : "Cliente registrado exitosamente"
    );
    form.reset();
    window.location.reload();
  } catch (error) {
    console.error("Error:", error);
    alert("Error al guardar el cliente: " + error.message);
  }
}

async function editarCliente(id) {
  try {
    const response = await fetch(`/api/clientes/${id}`);
    if (!response.ok) throw new Error("Error al obtener datos del cliente");

    const cliente = await response.json();

    document.getElementById("nombre").value = cliente.nombre;
    document.getElementById("apellido").value = cliente.apellido;
    document.getElementById("dni").value = cliente.dni;
    document.getElementById("correo").value = cliente.correo;
    document.getElementById("telefono").value = cliente.telefono;
    document.getElementById("estado").value = cliente.estado;
    document.getElementById("cliente-id").value = cliente.id_cliente;

    document.getElementById("btn-guardar-cliente").textContent =
      "Actualizar Cliente";
  } catch (error) {
    console.error("Error:", error);
    alert("Error al cargar datos del cliente: " + error.message);
  }
}

async function verDetallesCliente(id) {
  try {
    // Obtener datos del cliente
    const clienteResponse = await fetch(`/api/clientes/${id}`);
    if (!clienteResponse.ok)
      throw new Error("Error al obtener datos del cliente");
    const cliente = await clienteResponse.json();

    // Obtener rutinas asignadas
    const rutinasResponse = await fetch(`/api/clientes/${id}/rutinas`);
    const rutinas = await rutinasResponse.json();

    // Obtener pagos pendientes
    const pagosResponse = await fetch(
      `/api/clientes/${id}/pagos?estado=pendiente`
    );
    const pagosPendientes = await pagosResponse.json();

    // Construir HTML para mostrar
    let detallesHTML = `
            <strong>Nombre:</strong> ${cliente.nombre} ${cliente.apellido}<br>
            <strong>DNI:</strong> ${cliente.dni}<br>
            <strong>Correo:</strong> ${cliente.correo}<br>
            <strong>Teléfono:</strong> ${cliente.telefono}<br>
            <strong>Estado:</strong> ${cliente.estado}<br>
            <strong>Fecha de registro:</strong> ${cliente.fecha_registro}<br><br>
            <strong>Rutinas asignadas:</strong><br>
        `;

    if (rutinas.length > 0) {
      rutinas.forEach((rutina) => {
        detallesHTML += `- ${rutina.nombre} (${rutina.nivel})<br>`;
      });
    } else {
      detallesHTML += `No tiene rutinas asignadas<br>`;
    }

    detallesHTML += `<br><strong>Pagos pendientes:</strong><br>`;

    if (pagosPendientes.length > 0) {
      let totalPendiente = 0;
      pagosPendientes.forEach((pago) => {
        detallesHTML += `- ${pago.tipo}: $${pago.monto} (${pago.fecha_pago})<br>`;
        totalPendiente += parseFloat(pago.monto);
      });
      detallesHTML += `<br><strong>Total pendiente:</strong> $${totalPendiente.toFixed(
        2
      )}`;
    } else {
      detallesHTML += `No tiene pagos pendientes`;
    }

    alertHtml("Detalles del Cliente", detallesHTML);
  } catch (error) {
    console.error("Error:", error);
    alert("Error al cargar detalles del cliente: " + error.message);
  }
}

async function eliminarCliente(id) {
  if (
    !confirm(
      "¿Está seguro que desea eliminar este cliente y todos sus datos asociados?"
    )
  )
    return;

  try {
    // Primero eliminamos las asignaciones y pagos asociados
    const response = await fetch(`/api/clientes/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error al eliminar el cliente");
    }

    alert("Cliente eliminado exitosamente");
    window.location.reload();
  } catch (error) {
    console.error("Error:", error);
    alert("Error al eliminar el cliente: " + error.message);
  }
}

// Funciones para entrenadores
async function guardarEntrenador() {
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
      headers: {
        "Content-Type": "application/json",
      },
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

function verDetallesEntrenador(id) {
  // Implementar lógica para ver detalles del entrenador
  alert("Funcionalidad en desarrollo");
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
async function asignarCliente() {
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
      headers: {
        "Content-Type": "application/json",
      },
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

function filtrarAsignaciones() {
  const entrenadorId = document.getElementById("filtro-entrenador").value;

  fetch("/api/asignaciones")
    .then((response) => response.json())
    .then((asignaciones) => {
      const filtered = asignaciones.filter(
        (a) => !entrenadorId || a.id_entrenador.toString() === entrenadorId
      );

      let html =
        "<table><thead><tr><th>Cliente</th><th>Rutina</th><th>Entrenador</th><th>Fecha</th></tr></thead><tbody>";

      filtered.forEach((asignacion) => {
        html += `<tr>
                    <td>${asignacion.cliente_nombre}</td>
                    <td>${asignacion.rutina_nombre}</td>
                    <td>${asignacion.entrenador_nombre}</td>
                    <td>${asignacion.fecha_asignacion}</td>
                </tr>`;
      });

      html += "</tbody></table>";
      document.getElementById("lista-asignaciones").innerHTML = html;
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Error al filtrar asignaciones");
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
      headers: {
        "Content-Type": "application/json",
      },
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

// Funciones para pagos
async function registrarPago() {
  const formPago = document.getElementById("form-pago");

  const pagoData = {
    id_cliente: document.getElementById("cliente-pago").value,
    fecha_pago: new Date().toISOString().split("T")[0],
    monto: document.getElementById("monto").value,
    tipo: document.getElementById("tipo-pago").value,
    estado: document.getElementById("estado-pago").value,
  };

  if (!pagoData.id_cliente || !pagoData.monto) {
    alert("Por favor complete todos los campos obligatorios");
    return;
  }

  try {
    const response = await fetch("/api/pagos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(pagoData),
    });

    if (!response.ok) throw new Error("Error al registrar el pago");

    const result = await response.json();
    alert("Pago registrado exitosamente");
    formPago.reset();
    window.location.reload();
  } catch (error) {
    console.error("Error:", error);
    alert("Error al registrar el pago: " + error.message);
  }
}

function filtrarPagos() {
  const clienteId = document.getElementById("filtro-cliente-pagos").value;

  fetch("/api/pagos")
    .then((response) => response.json())
    .then((pagos) => {
      const filtered = pagos.filter(
        (p) => !clienteId || p.id_cliente.toString() === clienteId
      );

      let html =
        "<table><thead><tr><th>Cliente</th><th>Fecha</th><th>Monto</th><th>Tipo</th><th>Estado</th></tr></thead><tbody>";

      filtered.forEach((pago) => {
        html += `<tr>
                    <td>${pago.cliente_nombre}</td>
                    <td>${pago.fecha_pago}</td>
                    <td>$${pago.monto.toFixed(2)}</td>
                    <td>${pago.tipo}</td>
                    <td class="status-${pago.estado}">${
          pago.estado.charAt(0).toUpperCase() + pago.estado.slice(1)
        }</td>
                </tr>`;
      });

      html += "</tbody></table>";
      document.getElementById("lista-pagos").innerHTML = html;
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Error al filtrar pagos");
    });
}

// Función auxiliar para mostrar alertas con HTML
function alertHtml(title, html) {
  const alertDiv = document.createElement("div");
  alertDiv.className = "custom-alert";
  alertDiv.style.position = "fixed";
  alertDiv.style.top = "50%";
  alertDiv.style.left = "50%";
  alertDiv.style.transform = "translate(-50%, -50%)";
  alertDiv.style.backgroundColor = "#1b1d35";
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

  // Agregar el modal al cuerpo del documento
  document.body.appendChild(alertDiv);

  // Manejar el evento de clic en el botón de cerrar
  document
    .getElementById("btn-cerrar-modal")
    .addEventListener("click", function () {
      document.body.removeChild(alertDiv);
    });

  // Manejar clic fuera del modal para cerrarlo
  alertDiv.addEventListener("click", function (e) {
    if (e.target === alertDiv) {
      document.body.removeChild(alertDiv);
    }
  });

  return alertDiv;
}
