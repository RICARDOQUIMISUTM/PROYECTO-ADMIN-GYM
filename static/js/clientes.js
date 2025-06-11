document.addEventListener("DOMContentLoaded", function () {
  // Mostrar fecha actual
  mostrarFechaActual();

  // Event listeners para modales
  configurarModales();

  // Gestión de clientes
  document
    .getElementById("btn-nuevo-cliente")
    .addEventListener("click", nuevoCliente);
  document
    .getElementById("form-cliente")
    .addEventListener("submit", guardarCliente);
  document
    .getElementById("btn-cancelar")
    .addEventListener("click", cancelarEdicionCliente);

  // Delegación de eventos para botones en la tabla de clientes
  document
    .getElementById("clientes-table")
    .addEventListener("click", manejarEventosTablaClientes);
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

// Funciones para clientes
function nuevoCliente() {
  document.getElementById("cliente-id").value = "";
  document.getElementById("form-cliente").reset();
  document.getElementById("btn-guardar-cliente").textContent =
    "Registrar Cliente";
}

async function guardarCliente(e) {
  e.preventDefault();

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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(clienteData),
    });

    if (!response.ok) throw new Error("Error al guardar el cliente");

    const result = await response.json();
    alert(
      clienteId
        ? "Cliente actualizado exitosamente"
        : "Cliente registrado exitosamente"
    );
    document.getElementById("form-cliente").reset();
    window.location.reload();
  } catch (error) {
    console.error("Error:", error);
    alert("Error al guardar el cliente: " + error.message);
  }
}

function cancelarEdicionCliente() {
  document.getElementById("form-cliente").reset();
}

function manejarEventosTablaClientes(e) {
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
    const [cliente, rutinas, pagosPendientes] = await Promise.all([
      fetch(`/api/clientes/${id}`).then((res) => res.json()),
      fetch(`/api/clientes/${id}/rutinas`).then((res) => res.json()),
      fetch(`/api/clientes/${id}/pagos?estado=pendiente`).then((res) =>
        res.json()
      ),
    ]);

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
    const response = await fetch(`/api/clientes/${id}`, { method: "DELETE" });
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

// Función auxiliar para mostrar alertas con HTML
function alertHtml(title, html) {
  const alertDiv = document.createElement("div");
  alertDiv.className = "custom-alert";
  alertDiv.style.position = "fixed";
  alertDiv.style.top = "50%";
  alertDiv.style.left = "50%";
  alertDiv.style.transform = "translate(-50%, -50%)";
  alertDiv.style.backgroundColor = "rgb(47 47 47)";
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
