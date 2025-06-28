document.addEventListener("DOMContentLoaded", async () => {
  // Solución para el problema del historial (bfcache)
  if (window.performance && window.performance.getEntriesByType("navigation")[0]?.type === "back_forward") {
    window.location.reload();
  }

  const response = await fetch("productos.json");
  const categorias = await response.json();

  const contenedorCategorias = document.getElementById("categorias-container");
  const contenedorProductos = document.getElementById("productos-container");
  const inputBuscador = document.getElementById("buscador");
  const resultadosBusqueda = document.getElementById("resultadosBusqueda");
  const btnLimpiar = document.getElementById("limpiarBuscador");
  btnLimpiar.style.display = "none"; // Ocultar la X al cargar la página

  let categoriaActual = null; // Estado: null = categorías, objeto = categoría activa

  // Mostrar categorías
  categorias.forEach(cat => {
    const card = document.createElement("div");
    card.classList.add("categoria-card");
    const img = document.createElement("img");
    img.src = cat.productos[0]?.imagen || "img/default.jpg";
    img.alt = cat.categoria;
    const h3 = document.createElement("h3");
    h3.textContent = cat.categoria;
    card.appendChild(img);
    card.appendChild(h3);
    card.addEventListener("click", () => mostrarProductosDeCategoria(cat));
    contenedorCategorias.appendChild(card);
  });

  function mostrarProductosDeCategoria(cat) {
    categoriaActual = cat; // Guardar estado
    contenedorCategorias.style.display = "none";
    resultadosBusqueda.style.display = "none";
    contenedorProductos.style.display = "block";
    contenedorProductos.innerHTML = "";

    // Botón regresar
    const btnRegresar = document.createElement("button");
    btnRegresar.textContent = "← Regresar";
    btnRegresar.className = "btn-agregar btn-regresar";
    btnRegresar.addEventListener("click", () => {
      categoriaActual = null; // Volver a estado de categorías
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
      const img = document.createElement("img");
      img.src = producto.imagen;
      img.alt = producto.nombre;
      const h3 = document.createElement("h3");
      h3.textContent = producto.nombre;
      const p = document.createElement("p");
      p.textContent = producto.tipoCarne;
      const span = document.createElement("span");
      span.textContent = `C$${producto.precio.toFixed(2)}`;
      enlace.appendChild(img);
      enlace.appendChild(h3);
      enlace.appendChild(p);
      enlace.appendChild(span);
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
    // No hacer return aquí, así los listeners del buscador siempre se inicializan
  }

  // Buscador de productos
  inputBuscador.addEventListener("input", () => {
    const valor = inputBuscador.value.toLowerCase().trim();
    btnLimpiar.style.display = valor ? "inline" : "none";
    if (!valor) {
      resultadosBusqueda.style.display = "none";
      if (categoriaActual) {
        // Si estaba viendo una categoría, mostrar solo esa
        mostrarProductosDeCategoria(categoriaActual);
      } else {
        contenedorProductos.style.display = "none";
        contenedorCategorias.style.display = "grid";
      }
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
            localStorage.removeItem("categoriaSeleccionada");
            // No manipular el DOM aquí, la recarga de la página lo reiniciará
          });
          const img = document.createElement("img");
          img.src = producto.imagen;
          img.alt = producto.nombre;
          const h3 = document.createElement("h3");
          h3.textContent = producto.nombre;
          const p = document.createElement("p");
          p.textContent = producto.tipoCarne;
          const span = document.createElement("span");
          span.textContent = `C$${producto.precio.toFixed(2)}`;
          enlace.appendChild(img);
          enlace.appendChild(h3);
          enlace.appendChild(p);
          enlace.appendChild(span);
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
      resultadosBusqueda.innerHTML = "<p class='sin-resultados'>No se encontraron resultados.</p>";
    }
  });

  btnLimpiar.addEventListener("click", () => {
    inputBuscador.value = "";
    btnLimpiar.style.display = "none";
    resultadosBusqueda.innerHTML = "";
    resultadosBusqueda.style.display = "none";
    if (categoriaActual) {
      mostrarProductosDeCategoria(categoriaActual);
    } else {
      contenedorCategorias.style.display = "grid";
      contenedorProductos.style.display = "none";
    }
  });

  setTimeout(() => {
    const scrollPos = localStorage.getItem("scrollPos");
    if (scrollPos !== null) {
      window.scrollTo(0, parseInt(scrollPos));
      localStorage.removeItem("scrollPos");
    }
  }, 100);

  // Menú hamburguesa funcional
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
});
