document.addEventListener("DOMContentLoaded", function () {
  // Mostrar fecha actual
  mostrarFechaActual();

  // Event listeners para modales
  configurarModales();

  // Gestión de pagos
  document
    .getElementById("form-pago")
    .addEventListener("submit", registrarPago);
  document
    .getElementById("btn-historial-pagos")
    .addEventListener("click", mostrarHistorialPagos);
  document
    .getElementById("filtro-cliente-pagos")
    .addEventListener("change", filtrarPagos);

  // Event listener para el botón de edición de pagos
  document
    .getElementById("lista-pagos")
    .addEventListener("click", function (e) {
      if (e.target.classList.contains("btn-editar-pago")) {
        const pagoId = e.target.closest("tr").dataset.id;
        mostrarFormularioEdicion(pagoId);
      }
    });
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

async function registrarPago(e) {
  e.preventDefault();

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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pagoData),
    });

    if (!response.ok) throw new Error("Error al registrar el pago");

    const result = await response.json();
    alert("Pago registrado exitosamente");
    document.getElementById("form-pago").reset();
    window.location.reload();
  } catch (error) {
    console.error("Error:", error);
    alert("Error al registrar el pago: " + error.message);
  }
}

function mostrarHistorialPagos() {
  document.getElementById("modal-pagos").classList.remove("hidden");
}

async function filtrarPagos() {
  const clienteId = document.getElementById("filtro-cliente-pagos").value;

  try {
    const response = await fetch("/api/pagos");
    const pagos = await response.json();

    const filtered = pagos.filter(
      (p) => !clienteId || p.id_cliente.toString() === clienteId
    );

    let html = `
            <table>
                <thead>
                    <tr>
                        <th>Cliente</th>
                        <th>Fecha</th>
                        <th>Monto</th>
                        <th>Tipo</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
        `;

    filtered.forEach((pago) => {
      html += `
                <tr data-id="${pago.id_pago}">
                    <td>${pago.cliente_nombre}</td>
                    <td>${pago.fecha_pago}</td>
                    <td>$${pago.monto.toFixed(2)}</td>
                    <td>${pago.tipo}</td>
                    <td class="status-${pago.estado}">
                        ${
                          pago.estado.charAt(0).toUpperCase() +
                          pago.estado.slice(1)
                        }
                    </td>
                    <td>
                        <button class="btn-editar-pago" style="display: ${
                          clienteId ? "block" : "none"
                        };">Editar</button>
                    </td>
                </tr>
            `;
    });

    html += "</tbody></table>";
    document.getElementById("lista-pagos").innerHTML = html;
  } catch (error) {
    console.error("Error:", error);
    alert("Error al filtrar pagos");
  }
}

async function mostrarFormularioEdicion(pagoId) {
  try {
    const response = await fetch(`/api/pagos/${pagoId}`);
    if (!response.ok) throw new Error("Error al obtener datos del pago");

    const pago = await response.json();

    const editarForm = document.createElement("form");
    editarForm.id = "form-editar-pago";
    editarForm.innerHTML = `
            <div class="form-group">
                <label for="monto-editar">Monto:</label>
                <input type="number" id="monto-editar" value="${
                  pago.monto
                }" min="0" step="0.01" required>
            </div>
            <div class="form-group">
                <label for="estado-editar">Estado:</label>
                <select id="estado-editar" required>
                    <option value="pagado" ${
                      pago.estado === "pagado" ? "selected" : ""
                    }>Pagado</option>
                    <option value="pendiente" ${
                      pago.estado === "pendiente" ? "selected" : ""
                    }>Pendiente</option>
                </select>
            </div>
            <button type="submit">Actualizar Pago</button>
        `;

    document.getElementById("modal-pagos").classList.add("hidden");
    const editarModal = document.createElement("div");
    editarModal.id = "modal-editar-pago";
    editarModal.className = "modal";
    editarModal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h3>Editar Pago</h3>
                ${editarForm.outerHTML}
            </div>
        `;

    document.body.appendChild(editarModal);

    document
      .getElementById("form-editar-pago")
      .addEventListener("submit", function (e) {
        e.preventDefault();
        actualizarPago(pagoId);
      });

    document
      .querySelector("#modal-editar-pago .close-modal")
      .addEventListener("click", function () {
        document.getElementById("modal-editar-pago").classList.add("hidden");
        document.getElementById("modal-pagos").classList.remove("hidden");
      });
  } catch (error) {
    console.error("Error:", error);
    alert("Error al cargar datos del pago: " + error.message);
  }
}

async function actualizarPago(pagoId) {
  const monto = document.getElementById("monto-editar").value;
  const estado = document.getElementById("estado-editar").value;

  try {
    const response = await fetch(`/api/pagos/${pagoId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ monto, estado }),
    });

    if (!response.ok) throw new Error("Error al actualizar el pago");

    const result = await response.json();
    alert("Pago actualizado exitosamente");
    document.getElementById("modal-editar-pago").classList.add("hidden");
    window.location.reload();
  } catch (error) {
    console.error("Error:", error);
    alert("Error al actualizar el pago: " + error.message);
  }
}
document.getElementById("menu-toggle").addEventListener("click", function () {
  document.getElementById("menu").classList.toggle("active");
});
