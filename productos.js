

let carrito = JSON.parse(localStorage.getItem("carrito")) || [];



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

  function agregarAlCarrito(producto) {
    const index = carrito.findIndex(p => p.nombre === producto.nombre);
    if (index !== -1) {
      carrito[index].cantidad += 1;
    } else {
      carrito.push({ ...producto, cantidad: 1 });
    }
    actualizarCarrito();
  }

  function actualizarCarrito() {
    listaCarrito.innerHTML = '';
    let subtotal = 0;

    carrito.forEach((item, index) => {
      subtotal += item.precio * item.cantidad;
      const div = document.createElement('div');
      div.classList.add('producto');

      div.innerHTML = `
        <img src="${item.imagen}" alt="${item.nombre}" class="img-carrito">
        <div class="info-carrito">
          <span>${item.nombre}</span>
          <div class="controles-cantidad">
            <button class="cantidad-btn" onclick="cambiarCantidad(${index}, -1)">−</button>
            ${item.cantidad} x C$${item.precio.toFixed(2)}
            <button class="cantidad-btn" onclick="cambiarCantidad(${index}, 1)">+</button>
          </div>
        </div>
        <button class="eliminar-btn" onclick="eliminarProducto(${index})">🗑️</button>
      `;



      listaCarrito.appendChild(div);




    });

    subtotalCarrito.textContent = `C$${subtotal.toFixed(2)}`;
    document.getElementById("contador-carrito").textContent = carrito.reduce((acc, item) => acc + item.cantidad, 0);

    const mensaje = carrito.map(p => `• ${p.nombre} - ${p.cantidad} x C$${p.precio.toFixed(2)}`).join('%0A');
    const link = `https://wa.me/50582318300?text=Hola,%20quiero%20hacer%20este%20pedido:%0A${mensaje}%0A%0ASubtotal:%20C$${subtotal.toFixed(2)}`;
    btnWhatsapp.href = link;

    localStorage.setItem("carrito", JSON.stringify(carrito));


  }




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

