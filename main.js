document.addEventListener('DOMContentLoaded', () => {

    // --- Estructura de Datos Base ---
    const categoriasIngresos = ['Salario', 'Freelance', 'Inversiones', 'Ventas', 'Ingreso Extra'];
    const subcategoriasIngresos = {
        'Salario': ['Básico', 'Bonos', 'Comisiones'],
        'Freelance': ['Proyecto A', 'Proyecto B'],
        'Inversiones': ['Dividendos', 'Intereses'],
        'Ventas': ['Producto 1', 'Producto 2'],
        'Ingreso Extra': ['Regalo', 'Reembolso']
    };
    const categoriasGastos = ['Alimentación', 'Transporte', 'Vivienda', 'Entretenimiento', 'Compras'];
    const subcategoriasGastos = {
        'Alimentación': ['Supermercado', 'Restaurantes'],
        'Transporte': ['Gasolina', 'Transporte público'],
        'Vivienda': ['Alquiler', 'Servicios', 'Reparaciones'],
        'Entretenimiento': ['Cine', 'Deportes'],
        'Compras': ['Ropa', 'Electrónica']
    };
    const conceptosPagos = ['Alquiler', 'Luz', 'Agua', 'Internet', 'Teléfono', 'Tarjeta de Crédito'];
    
    // Simulación de la base de datos de transacciones
    let transacciones = JSON.parse(localStorage.getItem('transacciones')) || [];

    // --- Elementos del DOM ---
    const totalIngresosEl = document.getElementById('total-ingresos');
    const totalGastosEl = document.getElementById('total-gastos');
    const saldoDisponibleEl = document.getElementById('saldo-disponible');
    const tablaTransaccionesBody = document.querySelector('#tabla-transacciones tbody');

    // Formularios
    const formIngresos = document.getElementById('form-ingresos');
    const formGastos = document.getElementById('form-gastos');
    const formPagos = document.getElementById('form-pagos');

    // Selects de categoría/subcategoría
    const selectIngresoCategoria = document.getElementById('ingreso-categoria');
    const selectIngresoSubcategoria = document.getElementById('ingreso-subcategoria');
    const selectGastoCategoria = document.getElementById('gasto-categoria');
    const selectGastoSubcategoria = document.getElementById('gasto-subcategoria');
    const selectPagoConcepto = document.getElementById('pago-concepto');
    
    // Modal
    const modal = document.getElementById('modal-edicion');
    const closeModalBtn = document.querySelector('.close-btn');
    const formEdicion = document.getElementById('form-edicion');
    const editIdInput = document.getElementById('edit-id');
    const editFechaInput = document.getElementById('edit-fecha');
    const editMontoInput = document.getElementById('edit-monto');
    const editCategoriaSelect = document.getElementById('edit-categoria');
    const editSubcategoriaSelect = document.getElementById('edit-subcategoria');
    const editDescripcionTextarea = document.getElementById('edit-descripcion');

    // Filtros
    const filtroFecha = document.getElementById('filtro-fecha');
    const filtroTipo = document.getElementById('filtro-tipo');
    const filtroCategoria = document.getElementById('filtro-categoria');

    // --- Funciones de Utilidad ---

    /**
     * Guarda el array de transacciones en localStorage.
     */
    const guardarTransacciones = () => {
        localStorage.setItem('transacciones', JSON.stringify(transacciones));
    };

    /**
     * Rellena un select con opciones de un array.
     * @param {HTMLElement} selectElement - El elemento select.
     * @param {Array<string>} opciones - El array de opciones.
     */
    const rellenarSelect = (selectElement, opciones) => {
        selectElement.innerHTML = '<option value="">Selecciona...</option>';
        opciones.forEach(opcion => {
            const option = document.createElement('option');
            option.value = opcion;
            option.textContent = opcion;
            selectElement.appendChild(option);
        });
    };

    /**
     * Inicializa los selects de categorías y conceptos.
     */
    const inicializarSelects = () => {
        rellenarSelect(selectIngresoCategoria, categoriasIngresos);
        rellenarSelect(selectGastoCategoria, categoriasGastos);
        rellenarSelect(selectPagoConcepto, conceptosPagos);

        // Llenar select de filtros de categoría
        const todasCategorias = ['Todas', ...categoriasIngresos, ...categoriasGastos, ...conceptosPagos];
        rellenarSelect(filtroCategoria, todasCategorias);
        filtroCategoria.querySelector('option[value="Todas"]').selected = true;
    };

    /**
     * Actualiza el select de subcategorías basado en la categoría seleccionada.
     * @param {string} tipo - 'ingreso', 'gasto', o 'edicion'.
     * @param {string} categoriaSeleccionada - El valor de la categoría.
     */
    const actualizarSubcategorias = (tipo, categoriaSeleccionada) => {
        let subselect, subcategoriasMap;
        if (tipo === 'ingreso') {
            subselect = selectIngresoSubcategoria;
            subcategoriasMap = subcategoriasIngresos;
        } else if (tipo === 'gasto') {
            subselect = selectGastoSubcategoria;
            subcategoriasMap = subcategoriasGastos;
        } else if (tipo === 'edicion') {
            subselect = editSubcategoriaSelect;
            if (['ingreso', 'gasto'].includes(transacciones.find(t => t.id === editIdInput.value)?.tipo)) {
                subcategoriasMap = transacciones.find(t => t.id === editIdInput.value).tipo === 'ingreso' ? subcategoriasIngresos : subcategoriasGastos;
            } else {
                subcategoriasMap = {};
            }
        }

        const subcategorias = subcategoriasMap[categoriaSeleccionada] || [];
        rellenarSelect(subselect, subcategorias);
    };

    // Event listeners para actualizar subcategorías
    selectIngresoCategoria.addEventListener('change', (e) => actualizarSubcategorias('ingreso', e.target.value));
    selectGastoCategoria.addEventListener('change', (e) => actualizarSubcategorias('gasto', e.target.value));

    // --- Funcionalidad Principal ---

    /**
     * Captura los datos de un formulario y añade la transacción.
     * @param {Event} e - El evento de submit del formulario.
     * @param {string} tipo - 'ingreso', 'gasto' o 'pago'.
     */
    const manejarFormulario = (e, tipo) => {
        e.preventDefault();
        const fecha = e.target.querySelector('input[type="date"]').value;
        const monto = parseFloat(e.target.querySelector('input[type="number"]').value);
        const descripcion = e.target.querySelector('textarea').value;
        let categoria, subcategoria, concepto;

        if (tipo === 'ingreso') {
            categoria = e.target.querySelector('#ingreso-categoria').value;
            subcategoria = e.target.querySelector('#ingreso-subcategoria').value;
        } else if (tipo === 'gasto') {
            categoria = e.target.querySelector('#gasto-categoria').value;
            subcategoria = e.target.querySelector('#gasto-subcategoria').value;
        } else { // tipo === 'pago'
            concepto = e.target.querySelector('#pago-concepto').value;
        }

        const nuevaTransaccion = {
            id: Date.now().toString(),
            fecha,
            tipo,
            categoria: categoria || concepto,
            subcategoria: subcategoria || '',
            descripcion,
            monto: monto
        };

        transacciones.unshift(nuevaTransaccion); // Añadir al inicio para que aparezca primero en la tabla
        guardarTransacciones();
        e.target.reset();
        actualizarDashboard();
        renderizarTabla();
    };

    formIngresos.addEventListener('submit', (e) => manejarFormulario(e, 'ingreso'));
    formGastos.addEventListener('submit', (e) => manejarFormulario(e, 'gasto'));
    formPagos.addEventListener('submit', (e) => manejarFormulario(e, 'pago'));

    /**
     * Calcula los totales y actualiza el dashboard.
     */
    const actualizarDashboard = () => {
        let totalIngresos = 0;
        let totalGastos = 0;
        let totalPagos = 0;

        transacciones.forEach(t => {
            if (t.tipo === 'ingreso') {
                totalIngresos += t.monto;
            } else if (t.tipo === 'gasto') {
                totalGastos += t.monto;
            } else if (t.tipo === 'pago') {
                totalPagos += t.monto;
            }
        });

        const saldo = totalIngresos - totalGastos - totalPagos;
        
        totalIngresosEl.textContent = `$${totalIngresos.toFixed(2)}`;
        totalGastosEl.textContent = `$${totalGastos.toFixed(2)}`;
        saldoDisponibleEl.textContent = `$${saldo.toFixed(2)}`;
    };

    /**
     * Renderiza la tabla de transacciones.
     * @param {Array<Object>} [data=transacciones] - Array de transacciones a mostrar.
     */
    const renderizarTabla = (data = transacciones) => {
        tablaTransaccionesBody.innerHTML = ''; // Limpiar la tabla

        const transaccionesFiltradas = filtrarTransacciones(data);

        if (transaccionesFiltradas.length === 0) {
            tablaTransaccionesBody.innerHTML = `<tr><td colspan="7">No hay transacciones para mostrar.</td></tr>`;
            return;
        }

        transaccionesFiltradas.forEach(t => {
            const row = document.createElement('tr');
            const montoClass = t.tipo === 'ingreso' ? 'ingreso-monto' : 'gasto-monto';
            const categoriaConcepto = t.tipo === 'pago' ? t.categoria : t.categoria;

            row.innerHTML = `
                <td>${t.fecha}</td>
                <td>${t.tipo}</td>
                <td>${categoriaConcepto}</td>
                <td>${t.subcategoria || '-'}</td>
                <td>${t.descripcion || '-'}</td>
                <td class="${montoClass}">$${t.monto.toFixed(2)}</td>
                <td>
                    <button class="btn-edit" data-id="${t.id}">✏️</button>
                    <button class="btn-delete" data-id="${t.id}">🗑️</button>
                </td>
            `;
            tablaTransaccionesBody.appendChild(row);
        });
    };

    // --- Funcionalidades Adicionales ---

    /**
     * Abre el modal de edición con los datos de una transacción.
     * @param {string} id - El ID de la transacción a editar.
     */
    const abrirModalEdicion = (id) => {
        const transaccion = transacciones.find(t => t.id === id);
        if (!transaccion) return;

        editIdInput.value = transaccion.id;
        editFechaInput.value = transaccion.fecha;
        editMontoInput.value = transaccion.monto;
        editDescripcionTextarea.value = transaccion.descripcion;

        // Llenar select de categorías/conceptos en el modal
        let categorias = [];
        if (transaccion.tipo === 'ingreso') {
            categorias = categoriasIngresos;
        } else if (transaccion.tipo === 'gasto') {
            categorias = categoriasGastos;
        } else if (transaccion.tipo === 'pago') {
            categorias = conceptosPagos;
        }
        rellenarSelect(editCategoriaSelect, categorias);
        editCategoriaSelect.value = transaccion.categoria;
        
        // Actualizar subcategorías
        actualizarSubcategorias('edicion', transaccion.categoria);
        editSubcategoriaSelect.value = transaccion.subcategoria;

        modal.style.display = 'block';
    };

    /**
     * Elimina una transacción del array.
     * @param {string} id - El ID de la transacción a eliminar.
     */
    const eliminarTransaccion = (id) => {
        if (confirm('¿Estás seguro de que quieres eliminar esta transacción?')) {
            transacciones = transacciones.filter(t => t.id !== id);
            guardarTransacciones();
            actualizarDashboard();
            renderizarTabla();
        }
    };

    // Event listener para los botones de editar y eliminar de la tabla
    tablaTransaccionesBody.addEventListener('click', (e) => {
        const target = e.target;
        if (target.classList.contains('btn-delete')) {
            eliminarTransaccion(target.dataset.id);
        }
        if (target.classList.contains('btn-edit')) {
            abrirModalEdicion(target.dataset.id);
        }
    });

    // Cerrar el modal
    closeModalBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Manejar el submit del formulario de edición
    formEdicion.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = editIdInput.value;
        const transaccionIndex = transacciones.findIndex(t => t.id === id);

        if (transaccionIndex > -1) {
            transacciones[transaccionIndex].fecha = editFechaInput.value;
            transacciones[transaccionIndex].monto = parseFloat(editMontoInput.value);
            transacciones[transaccionIndex].categoria = editCategoriaSelect.value;
            transacciones[transaccionIndex].subcategoria = editSubcategoriaSelect.value;
            transacciones[transaccionIndex].descripcion = editDescripcionTextarea.value;
            
            guardarTransacciones();
            actualizarDashboard();
            renderizarTabla();
            modal.style.display = 'none';
        }
    });

    /**
     * Filtra las transacciones según los criterios seleccionados.
     * @param {Array<Object>} data - El array de transacciones a filtrar.
     * @returns {Array<Object>} El array de transacciones filtrado.
     */
    const filtrarTransacciones = (data) => {
        const fechaFiltro = filtroFecha.value;
        const tipoFiltro = filtroTipo.value;
        const categoriaFiltro = filtroCategoria.value;

        return data.filter(t => {
            const fechaMatch = !fechaFiltro || t.fecha === fechaFiltro;
            const tipoMatch = tipoFiltro === 'todos' || t.tipo === tipoFiltro;
            const categoriaMatch = categoriaFiltro === 'Todas' || t.categoria === categoriaFiltro;
            return fechaMatch && tipoMatch && categoriaMatch;
        });
    };

    // Event listeners para los filtros
    filtroFecha.addEventListener('change', () => renderizarTabla(transacciones));
    filtroTipo.addEventListener('change', () => renderizarTabla(transacciones));
    filtroCategoria.addEventListener('change', () => renderizarTabla(transacciones));

    // --- Inicialización ---
    inicializarSelects();
    actualizarDashboard();
    renderizarTabla();
});