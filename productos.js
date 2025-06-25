

let carrito = JSON.parse(localStorage.getItem("carrito")) || [];


  function actualizarCarrito() {
    const listaCarrito = document.getElementById("lista-carrito");
    const subtotalCarrito = document.getElementById("subtotal-carrito");
    const btnWhatsapp = document.getElementById("btn-whatsapp");
    listaCarrito.innerHTML = '';
    let subtotal = 0;

    carrito.forEach((item, index) => {
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
    document.getElementById("contador-carrito").textContent = carrito.reduce((acc, item) => acc + item.cantidad, 0);

const mensaje = carrito.map(p => 
  `• ${p.nombre}${p.tipoCarne ? ` (${p.tipoCarne})` : ""} - ${p.cantidad} x C$${p.precio.toFixed(2)}${p.observaciones ? `\n  Nota: ${p.observaciones}` : ''}`
).join('%0A');    const link = `https://wa.me/50582318300?text=Hola,%20quiero%20hacer%20este%20pedido:%0A${mensaje}%0A%0ASubtotal:%20C$${subtotal.toFixed(2)}`;
    btnWhatsapp.href = link;

    localStorage.setItem("carrito", JSON.stringify(carrito));
  }
window.actualizarCarrito = actualizarCarrito;
  // Función para agregar un producto al carrito con personalización
function agregarAlCarrito(producto) {
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
      const indexExistente = carrito.findIndex(item =>
        item.nombre === personalizada.nombre &&
        item.tipoCarne === personalizada.tipoCarne &&
        item.observaciones === personalizada.observaciones
      );

      if (indexExistente >= 0) {
        carrito[indexExistente].cantidad += 1;
      } else {
        carrito.push(personalizada);
      }

      actualizarCarrito();
    }
  });
}
window.agregarAlCarrito = agregarAlCarrito;

document.addEventListener("DOMContentLoaded", async () => {

  const response = await fetch("productos.json");
  const categorias = await response.json();

  const contenedorCategorias = document.getElementById("categorias-container");
  const contenedorProductos = document.getElementById("productos-container");

  const inputBuscador = document.getElementById("buscador");
  const resultadosBusqueda = document.getElementById("resultadosBusqueda");
  const btnLimpiar = document.getElementById("limpiarBuscador");
  const iconoCarrito = document.getElementById("icono-carrito");
  const carritoDropdown = document.getElementById("carrito-dropdown");
  const listaCarrito = document.getElementById("lista-carrito");
  const subtotalCarrito = document.getElementById("subtotal-carrito");
  const btnWhatsapp = document.getElementById("btn-whatsapp");
  const btnVaciarCarrito = document.getElementById("btn-vaciar-carrito");
  actualizarCarrito();

  // Mostrar categorías
  categorias.forEach(cat => {
    const card = document.createElement("div");
    card.classList.add("categoria-card");

    const imgSrc = cat.productos[0]?.imagen || "img/default.jpg";

    card.innerHTML = `
      <img src="${imgSrc}" alt="${cat.categoria}">
      <h3>${cat.categoria}</h3>
    `;

    card.addEventListener("click", () => mostrarProductosDeCategoria(cat));

    contenedorCategorias.appendChild(card);
  });

  //esto es para vaciar el carrito

  document.getElementById("btn-vaciar-carrito").addEventListener("click", () => {
    if (carrito.length === 0) {
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
        carrito = [];
        localStorage.removeItem("carrito");
        actualizarCarrito();

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



  function mostrarProductosDeCategoria(cat) {
    contenedorProductos.innerHTML = `<h2 class="titulo-categoria">${cat.categoria}</h2>`;
    const grid = document.createElement("div");
    grid.classList.add("grid-productos");

    cat.productos.forEach(producto => {
      const contenedor = document.createElement("div");
      contenedor.classList.add("producto");

      const enlace = document.createElement("a");
      enlace.href = "detalle.html";
      enlace.addEventListener("click", () => {
        localStorage.setItem("productoSeleccionado", JSON.stringify(producto));
        localStorage.setItem("scrollPos", window.scrollY);
      });

      enlace.innerHTML = `
        <img src="${producto.imagen}" alt="${producto.nombre}">
        <h3>${producto.nombre}</h3>
        <p>${producto.tipoCarne}</p>
        <span>C$${producto.precio.toFixed(2)}</span>
      `;

      const boton = document.createElement("button");
      boton.classList.add("btn-agregar");
      boton.type = "button";
      boton.textContent = "Agregar al carrito";
      boton.addEventListener("click", (e) => {
        e.stopPropagation();
        agregarAlCarrito(producto);
      });

      contenedor.appendChild(enlace);
      contenedor.appendChild(boton);
      grid.appendChild(contenedor);
    });

    contenedorProductos.innerHTML = "";
    contenedorProductos.appendChild(grid);
  }


// Función para editar un producto en el carrito
window.editarProducto = function (index) {
  const producto = carrito[index];
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
      carrito[index].tipoCarne = esPersonalizable ? result.value.tipoCarne : producto.tipoCarne;
      carrito[index].observaciones = result.value.observaciones;
      actualizarCarrito();
    }
  });
};





  window.cambiarCantidad = function (index, cambio) {
    carrito[index].cantidad += cambio;
    if (carrito[index].cantidad <= 0) {
      carrito.splice(index, 1);
    }
    actualizarCarrito();
  };

  window.eliminarProducto = function (index) {
    carrito.splice(index, 1);
    actualizarCarrito();
  };

  iconoCarrito.addEventListener("click", () => {
    carritoDropdown.classList.toggle("oculto");
  });

  // Ocultar el carrito si se hace clic fuera del dropdown o del icono
  document.addEventListener("click", (e) => {
    const dentroDelCarrito = carritoDropdown.contains(e.target);
    const clicEnIcono = iconoCarrito.contains(e.target);

    // Si hace clic en botones que están dentro del carrito (como + o -), no cerramos
    const esBotonInterno = e.target.closest(".cantidad-btn") || e.target.closest(".eliminar-btn") || e.target.closest(".acciones-carrito");

    if (!dentroDelCarrito && !clicEnIcono && !esBotonInterno) {
      carritoDropdown.classList.add("oculto");
    }
  });

  //Esto es para buscar los productos
  inputBuscador.addEventListener("input", () => {
    const valor = inputBuscador.value.toLowerCase().trim();
    btnLimpiar.style.display = valor ? "inline" : "none";

    if (!valor) {
      resultadosBusqueda.style.display = "none";
      contenedorProductos.style.display = "block";
      contenedorCategorias.style.display = "grid";
      return;
    }

    contenedorProductos.style.display = "none";
    contenedorCategorias.style.display = "none";
    resultadosBusqueda.innerHTML = "";
    resultadosBusqueda.style.display = "grid";

    let encontrados = false;

    categorias.forEach(cat => {
      cat.productos.forEach(producto => {
        const nombre = producto.nombre.toLowerCase();
        const tipoCarne = producto.tipoCarne.toLowerCase();

        if (nombre.includes(valor) || tipoCarne.includes(valor)) {
          const contenedor = document.createElement("div");
          contenedor.classList.add("producto");

          const enlace = document.createElement("a");
          enlace.href = "detalle.html";
          enlace.addEventListener("click", () => {
            localStorage.setItem("productoSeleccionado", JSON.stringify(producto));
            localStorage.setItem("scrollPos", window.scrollY);
            inputBuscador.value = "";
            btnLimpiar.style.display = "none";
            resultadosBusqueda.style.display = "none";
            contenedorProductos.style.display = "block";
            contenedorCategorias.style.display = "grid";
          });

          enlace.innerHTML = `
          <img src="${producto.imagen}" alt="${producto.nombre}">
          <h3>${producto.nombre}</h3>
          <p>${producto.tipoCarne}</p>
          <span>C$${producto.precio.toFixed(2)}</span>
        `;

          const boton = document.createElement("button");
          boton.classList.add("btn-agregar");
          boton.type = "button";
          boton.textContent = "Agregar al carrito";
          boton.addEventListener("click", (e) => {
            e.stopPropagation();
            agregarAlCarrito(producto);
          });

          contenedor.appendChild(enlace);
          contenedor.appendChild(boton);
          resultadosBusqueda.appendChild(contenedor);

          encontrados = true;
        }
      });
    });

    if (!encontrados) {
      resultadosBusqueda.innerHTML = "<p style='grid-column: 1 / -1; text-align:center;'>No se encontraron resultados.</p>";
    }
  });

  btnLimpiar.addEventListener("click", () => {
    inputBuscador.value = "";
    btnLimpiar.style.display = "none";
    resultadosBusqueda.innerHTML = "";
    resultadosBusqueda.style.display = "none";
    contenedorCategorias.style.display = "grid";
    contenedorProductos.style.display = "block";
  });


  // esto era para vaciar el carrito despues de hacer el pedido pero lo voy a comentar por estos momentos

  //   btnWhatsapp.addEventListener("click", () => {
  //   setTimeout(() => {
  //     carrito = [];
  //     localStorage.removeItem("carrito");
  //     actualizarCarrito();
  //   }, 1000); // espera 2 segundos antes de borrar
  // });


  setTimeout(() => {
    const scrollPos = localStorage.getItem("scrollPos");
    if (scrollPos !== null) {
      window.scrollTo(0, parseInt(scrollPos));
      localStorage.removeItem("scrollPos");
    }
  }, 100);
});

