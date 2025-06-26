document.addEventListener("DOMContentLoaded", () => {
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
  btnVolver.textContent = "← Volver";
  btnVolver.className = "btn-agregar-carrito";
  btnVolver.style.margin = "18px 0 0 0";
  btnVolver.onclick = () => {
    const cat = JSON.parse(localStorage.getItem("categoriaSeleccionada"));
    if (cat) {
      // Guardar la categoría en localStorage y redirigir a productos.html
      localStorage.setItem("mostrarCategoriaAlCargar", JSON.stringify(cat));
      window.location.href = "productos.html";
    } else {
      window.history.back();
    }
  };
  document.getElementById("detalle-precio").parentNode.insertBefore(btnVolver, document.getElementById("detalle-precio").parentNode.firstChild);

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
      const enlace = document.createElement("a");
      enlace.href = "detalle.html";
      enlace.classList.add("producto");
      enlace.addEventListener("click", () => {
        localStorage.setItem("productoSeleccionado", JSON.stringify(producto));
      });

      enlace.innerHTML = `
        <img src="${producto.imagen}" alt="${producto.nombre}">
        <h3>${producto.nombre}</h3>
        <p>${producto.tipoCarne || ""}</p>
        <span>C$${producto.precio.toFixed(2)}</span>
      `;

      // Botón agregar al carrito en sugerencias
      const btn = document.createElement("button");
      btn.textContent = "Agregar al carrito";
      btn.className = "btn-agregar-carrito";
      btn.onclick = (e) => {
        e.preventDefault(); // Para que no navegue al detalle

        // Buscar el producto completo en el JSON por nombre
        const productoCompleto = categorias
          .flatMap(cat => cat.productos)
          .find(p => p.nombre === producto.nombre);

        if (typeof agregarAlCarrito === "function" && productoCompleto) {
          agregarAlCarrito(productoCompleto);
        } else {
          alert("Función de carrito no disponible en esta página.");
        }
      };
      enlace.appendChild(btn);

      contenedor.appendChild(enlace);
    });
  });
