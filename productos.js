document.addEventListener("DOMContentLoaded", async () => {
  const response = await fetch("productos.json");
  const categorias = await response.json();

  const contenedorCategorias = document.getElementById("categorias-container");
  const contenedorProductos = document.getElementById("productos-container");

  const inputBuscador = document.getElementById("buscador");
  const resultadosBusqueda = document.getElementById("resultadosBusqueda");
  const btnLimpiar = document.getElementById("limpiarBuscador");

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

  function mostrarProductosDeCategoria(cat) {
    // Ocultar categorías y resultados de búsqueda, mostrar productos
    contenedorCategorias.style.display = "none";
    resultadosBusqueda.style.display = "none";
    contenedorProductos.style.display = "block";
    contenedorProductos.innerHTML = "";

    // Botón regresar
    const btnRegresar = document.createElement("button");
    btnRegresar.textContent = "← Regresar";
    btnRegresar.className = "btn-agregar";
    btnRegresar.style.marginBottom = "18px";
    btnRegresar.addEventListener("click", () => {
      contenedorProductos.innerHTML = "";
      contenedorProductos.style.display = "none";
      contenedorCategorias.style.display = "grid";
    });
    contenedorProductos.appendChild(btnRegresar);

    // Título de la categoría
    const titulo = document.createElement("h2");
    titulo.className = "titulo-categoria";
    titulo.textContent = cat.categoria;
    contenedorProductos.appendChild(titulo);

    // Grid de productos
    const grid = document.createElement("div");
    grid.classList.add("grid-productos");
    cat.productos.forEach(producto => {
      const contenedor = document.createElement("div");
      contenedor.classList.add("producto");
      const enlace = document.createElement("a");
      enlace.href = "detalle.html";
      enlace.addEventListener("click", () => {
        localStorage.setItem("productoSeleccionado", JSON.stringify(producto));
        localStorage.setItem("categoriaSeleccionada", JSON.stringify(cat));
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
    contenedorProductos.appendChild(grid);
  }

  // Mostrar categoría guardada si existe
  const catGuardada = localStorage.getItem("mostrarCategoriaAlCargar");
  if (catGuardada) {
    const cat = JSON.parse(catGuardada);
    mostrarProductosDeCategoria(cat);
    localStorage.removeItem("mostrarCategoriaAlCargar");
    return; // Evita mostrar las categorías
  }

  // Buscador de productos
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

  setTimeout(() => {
    const scrollPos = localStorage.getItem("scrollPos");
    if (scrollPos !== null) {
      window.scrollTo(0, parseInt(scrollPos));
      localStorage.removeItem("scrollPos");
    }
  }, 100);
});
