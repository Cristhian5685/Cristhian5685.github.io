document.addEventListener("DOMContentLoaded", () => {
  window.carrito = JSON.parse(localStorage.getItem("carrito")) || [];

  const iconoCarrito = document.getElementById("icono-carrito");
  const carritoDropdown = document.getElementById("carrito-dropdown");
  const listaCarrito = document.getElementById("lista-carrito");
  const subtotalCarrito = document.getElementById("subtotal-carrito");
  const btnWhatsapp = document.getElementById("btn-whatsapp");
  const btnVaciarCarrito = document.getElementById("btn-vaciar-carrito");

  // Actualiza el carrito visualmente
  window.actualizarCarrito = function () {
    listaCarrito.innerHTML = '';
    let subtotal = 0;

    window.carrito.forEach((item, index) => {
      subtotal += item.precio * item.cantidad;
      const div = document.createElement('div');
      div.classList.add('producto');

      div.innerHTML = `
        <img src="${item.imagen}" alt="${item.nombre}" class="img-carrito">
        <div class="info-carrito">
          <span>${item.nombre}${item.tipoCarne ? ` (${item.tipoCarne})` : ""}</span>
          <small>${item.observaciones || ''}</small>
          <div class="controles-cantidad">
            <button class="cantidad-btn" onclick="cambiarCantidad(${index}, -1)">−</button>
            ${item.cantidad} x C$${item.precio.toFixed(2)}
            <button class="cantidad-btn" onclick="cambiarCantidad(${index}, 1)">+</button>
          </div>
        </div>
        <button class="editar-btn" onclick="editarProducto(${index})">✏️</button>
        <button class="eliminar-btn" onclick="eliminarProducto(${index})">🗑️</button>
      `;
      listaCarrito.appendChild(div);
    });

    subtotalCarrito.textContent = `C$${subtotal.toFixed(2)}`;
    document.getElementById("contador-carrito").textContent = window.carrito.reduce((acc, item) => acc + item.cantidad, 0);

    const mensaje = window.carrito.map(p =>
      `• ${p.nombre}${p.tipoCarne ? ` (${p.tipoCarne})` : ""} - ${p.cantidad} x C$${p.precio.toFixed(2)}${p.observaciones ? `\n  Nota: ${p.observaciones}` : ''}`
    ).join('%0A');
    const link = `https://wa.me/50582318300?text=Hola,%20quiero%20hacer%20este%20pedido:%0A${mensaje}%0A%0ASubtotal:%20C$${subtotal.toFixed(2)}`;
    btnWhatsapp.href = link;

    localStorage.setItem("carrito", JSON.stringify(window.carrito));
  };

  // Agrega un producto al carrito
  window.agregarAlCarrito = function (producto) {
    const esPersonalizable = producto.personalizableCarne;
    const permitirMixto = producto.permitirMixto;
    Swal.fire({
      title: `Personaliza tu pedido de ${producto.nombre}`,
      html: `
        ${esPersonalizable ? `
          <label for="tipo-carne">Tipo de carne:</label>
          <select id="tipo-carne" class="swal2-select">
            <option value="">Selecciona...</option>
            <option value="res">Res</option>
            <option value="cerdo">Cerdo</option>
            <option value="pollo">Pollo</option>
            ${permitirMixto ? `<option value="mixto">Mixto</option>` : ""}
          </select>
          <br><br>
        ` : ''}
        <label for="observaciones">Observaciones:</label>
        <textarea id="observaciones" class="swal2-textarea" placeholder="Ej: sin cebolla"></textarea>
      `,
      confirmButtonText: 'Agregar al carrito',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        let tipoCarne = "";
        if (esPersonalizable) {
          tipoCarne = document.getElementById("tipo-carne").value;
          if (!tipoCarne) {
            Swal.showValidationMessage('Por favor selecciona un tipo de carne');
            return false;
          }
        }
        const observaciones = document.getElementById("observaciones").value;
        return { tipoCarne, observaciones };
      }
    }).then(result => {
      if (result.isConfirmed) {
        const personalizada = {
          ...producto,
          tipoCarne: esPersonalizable ? result.value.tipoCarne : "",
          observaciones: result.value.observaciones,
          cantidad: 1
        };
        // Ver si ya existe en el carrito
        const indexExistente = window.carrito.findIndex(item =>
          item.nombre === personalizada.nombre &&
          item.tipoCarne === personalizada.tipoCarne &&
          item.observaciones === personalizada.observaciones
        );

        if (indexExistente >= 0) {
          window.carrito[indexExistente].cantidad += 1;
        } else {
          window.carrito.push(personalizada);
        }

        window.actualizarCarrito();
      }
    });
  };

  // Cambia la cantidad de un producto
  window.cambiarCantidad = function (index, cambio) {
    window.carrito[index].cantidad += cambio;
    if (window.carrito[index].cantidad <= 0) {
      window.carrito.splice(index, 1);
    }
    window.actualizarCarrito();
  };

  // Elimina un producto del carrito
  window.eliminarProducto = function (index) {
    window.carrito.splice(index, 1);
    window.actualizarCarrito();
  };

  // Función para editar un producto en el carrito
  window.editarProducto = function (index) {
    const producto = window.carrito[index];
    const esPersonalizable = producto.personalizableCarne;
    const permitirMixto = producto.permitirMixto;

    Swal.fire({
      title: `Editar ${producto.nombre}`,
      html: `
        ${esPersonalizable ? `
          <label for="tipo-carne-edit">Tipo de carne:</label>
          <select id="tipo-carne-edit" class="swal2-select">
            <option value="res" ${producto.tipoCarne === "res" ? "selected" : ""}>Res</option>
            <option value="cerdo" ${producto.tipoCarne === "cerdo" ? "selected" : ""}>Cerdo</option>
            <option value="pollo" ${producto.tipoCarne === "pollo" ? "selected" : ""}>Pollo</option>
            ${permitirMixto ? `<option value="mixto" ${producto.tipoCarne === "mixto" ? "selected" : ""}>Mixto</option>` : ""}
          </select>
          <br><br>
        ` : ''}
        <label for="observaciones-edit">Observaciones:</label>
        <textarea id="observaciones-edit" class="swal2-textarea" placeholder="Ej: sin cebolla">${producto.observaciones || ""}</textarea>
      `,
      confirmButtonText: 'Guardar cambios',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        let tipoCarne = producto.tipoCarne;
        if (esPersonalizable) {
          tipoCarne = document.getElementById("tipo-carne-edit").value;
          if (!tipoCarne) {
            Swal.showValidationMessage('Por favor selecciona un tipo de carne');
            return false;
          }
        }
        const observaciones = document.getElementById("observaciones-edit").value;
        return { tipoCarne, observaciones };
      }
    }).then(result => {
      if (result.isConfirmed) {
        window.carrito[index].tipoCarne = esPersonalizable ? result.value.tipoCarne : producto.tipoCarne;
        window.carrito[index].observaciones = result.value.observaciones;
        window.actualizarCarrito();
      }
    });
  };

  // Mostrar/ocultar el carrito
  iconoCarrito.addEventListener("click", () => {
    carritoDropdown.classList.toggle("oculto");
  });

  // Ocultar el carrito si se hace clic fuera del dropdown o del icono
  document.addEventListener("click", (e) => {
    const dentroDelCarrito = carritoDropdown.contains(e.target);
    const clicEnIcono = iconoCarrito.contains(e.target);
    const esBotonInterno = e.target.closest(".cantidad-btn") || e.target.closest(".eliminar-btn") || e.target.closest(".acciones-carrito");

    if (!dentroDelCarrito && !clicEnIcono && !esBotonInterno) {
      carritoDropdown.classList.add("oculto");
    }
  });

  // Vaciar el carrito
  btnVaciarCarrito.addEventListener("click", () => {
    if (window.carrito.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'Carrito vacío',
        text: 'No hay productos para eliminar.',
        confirmButtonColor: '#333',
        timer: 3000,
        timerProgressBar: true
      });
      return;
    }

    Swal.fire({
      title: '¿Estás seguro?',
      text: "Se eliminarán todos los productos del carrito.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e74c3c',
      cancelButtonColor: '#aaa',
      confirmButtonText: 'Sí, vaciar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        window.carrito = [];
        localStorage.removeItem("carrito");
        window.actualizarCarrito();

        Swal.fire({
          icon: 'success',
          title: '¡Carrito vaciado!',
          text: 'Tu carrito ahora está vacío.',
          confirmButtonColor: '#27ae60',
          timer: 3000,
          timerProgressBar: true
        });
      }
    });
  });

  // Inicializa el carrito al cargar
  window.actualizarCarrito();
});