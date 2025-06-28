document.addEventListener("DOMContentLoaded", () => {
  // --- NUEVO: Manipular historial para que el botón atrás lleve a productos.html ---
  const cat = JSON.parse(localStorage.getItem("categoriaSeleccionada"));
  if (cat) {
    localStorage.setItem("mostrarCategoriaAlCargar", JSON.stringify(cat));
    history.replaceState({}, "", "productos.html");
  } else {
    // Si no hay categoría, solo reemplaza el historial sin setear mostrarCategoriaAlCargar
    history.replaceState({}, "", "productos.html");
  }

  const producto = JSON.parse(localStorage.getItem("productoSeleccionado"));

  if (!producto) {
    document.body.innerHTML = "<p style='padding: 2rem;'>No se encontró el producto.</p>";
    return;
  }

  document.getElementById("detalle-imagen").src = producto.imagen;
  document.getElementById("detalle-imagen").alt = producto.nombre;
  document.getElementById("detalle-nombre").textContent = producto.nombre;
  document.getElementById("detalle-descripcion").textContent = producto.descripcion || "Descripción no disponible.";
  document.getElementById("detalle-tipo-carne").textContent = producto.tipoCarne || "No especificado.";
  document.getElementById("detalle-precio").textContent = `C$${producto.precio.toFixed(2)}`;

  // Agregar botón al detalle (¡ahora sí lo insertamos!)
  const btnAgregar = document.createElement("button");
  btnAgregar.textContent = "Agregar al carrito";
  btnAgregar.className = "btn-agregar-carrito";
  btnAgregar.onclick = () => {
    if (typeof agregarAlCarrito === "function") {
      agregarAlCarrito(producto);
    } else {
      alert("Función de carrito no disponible en esta página.");
    }
  };
  // Insertar el botón después del precio
  document.getElementById("detalle-precio").after(btnAgregar);

  // Botón volver a la lista de productos de la categoría
  const btnVolver = document.createElement("button");
  btnVolver.innerHTML = '<i class="fas fa-arrow-left"></i> Volver';
  btnVolver.className = "btn-volver";
  btnVolver.id = "btn-volver";
  btnVolver.onclick = () => {
    const cat = JSON.parse(localStorage.getItem("categoriaSeleccionada"));
    if (cat) {
      localStorage.setItem("mostrarCategoriaAlCargar", JSON.stringify(cat));
      window.location.href = "productos.html";
    } else {
      window.location.href = "productos.html";
    }
  };
  // Insertar el botón antes del contenedor de detalle
  const detalleContainer = document.querySelector(".detalle-container");
  detalleContainer.parentNode.insertBefore(btnVolver, detalleContainer);

  // Ingredientes
  const ul = document.getElementById("detalle-ingredientes");
  ul.innerHTML = "";
  if (producto.ingredientes && producto.ingredientes.length) {
    producto.ingredientes.forEach(ing => {
      const li = document.createElement("li");
      li.textContent = ing;
      ul.appendChild(li);
    });
  } else {
    ul.innerHTML = "<li>No hay información de ingredientes.</li>";
  }
});

// Sugerencias
fetch("productos.json")
  .then(res => res.json())
  .then(categorias => {
    const productoActual = JSON.parse(localStorage.getItem("productoSeleccionado"));
    if (!productoActual) return;

    // Buscar categoría del producto actual
    const categoria = categorias.find(cat =>
      cat.productos.some(p => p.nombre === productoActual.nombre)
    );
    if (!categoria) return;

    const sugerencias = categoria.productos
      .filter(p => p.nombre !== productoActual.nombre)
      .slice(0, 5);

    const contenedor = document.getElementById("recomendaciones-container");

    sugerencias.forEach(producto => {
      // Usar la misma estructura que en productos: un solo div.producto
      const div = document.createElement("div");
      div.className = "producto";
      // Imagen
      const img = document.createElement("img");
      img.src = producto.imagen;
      img.alt = producto.nombre;
      // Título
      const h3 = document.createElement("h3");
      h3.textContent = producto.nombre;
      // Tipo de carne
      const p = document.createElement("p");
      p.textContent = producto.tipoCarne || "";
      // Precio
      const span = document.createElement("span");
      span.textContent = `C$${producto.precio.toFixed(2)}`;
      // Enlace al detalle
      div.addEventListener("click", (e) => {
        // Solo si no es el botón
        if (e.target.tagName !== "BUTTON") {
          localStorage.setItem("productoSeleccionado", JSON.stringify(producto));
          window.location.href = "detalle.html";
        }
      });
      // Botón agregar al carrito
      const btn = document.createElement("button");
      btn.textContent = "Agregar al carrito";
      btn.onclick = (e) => {
        e.stopPropagation();
        const productoCompleto = categorias
          .flatMap(cat => cat.productos)
          .find(p => p.nombre === producto.nombre);
        if (typeof agregarAlCarrito === "function" && productoCompleto) {
          agregarAlCarrito(productoCompleto);
        } else {
          alert("Función de carrito no disponible en esta página.");
        }
      };
      // Ensamblar
      div.appendChild(img);
      div.appendChild(h3);
      div.appendChild(p);
      div.appendChild(span);
      div.appendChild(btn);
      contenedor.appendChild(div);
    });
  });

// Menú hamburguesa funcional para detalle
const btnMenu = document.getElementById('btnMenu');
const navMenu = document.getElementById('navMenu');
if (btnMenu && navMenu) {
  btnMenu.addEventListener('click', (e) => {
    e.stopPropagation();
    navMenu.classList.toggle('abierto');
  });
  document.addEventListener('click', (e) => {
    if (window.innerWidth <= 900 && navMenu.classList.contains('abierto')) {
      if (!navMenu.contains(e.target) && !btnMenu.contains(e.target)) {
        navMenu.classList.remove('abierto');
      }
    }
  });
}

// Limpiar estado de categoría al hacer clic en "Menú" desde el nav
const menuLink = document.querySelector('a[href="productos.html"]');
if (menuLink) {
  menuLink.addEventListener("click", () => {
    localStorage.removeItem("mostrarCategoriaAlCargar");
    localStorage.removeItem("categoriaSeleccionada");
  });
}
