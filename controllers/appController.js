const db = require('../config/db.js')
//agrega nuevo codigo
exports.Start = (req, res) => {
    res.send('API REST CORNEJO INICIO')
}

exports.mostrarCodigo = async (req, res) => {
    console.log(req.params)
    const [rows] = await db.query(
        'SELECT * FROM ARTICULOS_PAGWEB_ISI WHERE ART_ID = ?',
        [req.params.idCodigo]
    )

    if (rows.length === 0) {
        return res.status(404).json({ mensaje: 'No existe' })
    }

    res.json(rows)
}
exports.mostrarCodigoByClave = async (req, res) => {
    console.log(req.params)
    const [rows] = await db.query(
        'SELECT * FROM ARTICULOS_PAGWEB_ISI WHERE CLAVE_ARTICULO = ?',
        [req.params.idCodigo]
    )

    if (rows.length === 0) {
        return res.status(404).json({ mensaje: 'No existe' })
    }

    res.json(rows)
}
exports.mostrarCodigoByClaveCornejo = async (req, res) => {
    console.log(req.params)
    const [rows] = await db.query(
        'SELECT * FROM ARTICULOS_PAGWEB_CORNEJO WHERE CLAVE_ARTICULO = ?',
        [req.params.idCodigo]
    )

    if (rows.length === 0) {
        return res.status(404).json({ mensaje: 'No existe' })
    }

    res.json(rows)
}
exports.mostrarCodigosFull = async (req, res) => {
    try {
        let { pagina = 1, termino = '', sort = 'NOMBRE', order = 'ASC' } = req.query;
        console.log(pagina);
        pagina = Number(pagina);
        if (pagina < 1) pagina = 1;

        const limit = 25;
        const offset = (pagina - 1) * limit;

        termino = `%${termino}%`;

        // 🔐 Columnas permitidas para ordenar
        const columnasPermitidas = {
            NOMBRE: 'NOMBRE',
            CLAVE_ARTICULO: 'CLAVE_ARTICULO',
            PRECIO: 'PRECIO',
            TOTAL_EXISTENCIA: '(EXISTENCIA_A + EXISTENCIA_T)'
        };
        const columnaOrden = columnasPermitidas[sort] || 'NOMBRE';
        order = order === 'DESC' ? 'DESC' : 'ASC';

        const query = `
            SELECT 
                ART_ID,
                NOMBRE,
                CLAVE_ARTICULO,
                PRECIO,
                EXISTENCIA_A,
                EXISTENCIA_T,
                (EXISTENCIA_A + EXISTENCIA_T) AS TOTAL_EXISTENCIA,
                IMPUESTO
            FROM ARTICULOS_PAGWEB_ISI
            WHERE NOMBRE LIKE ? OR CLAVE_ARTICULO LIKE ?
            ORDER BY ${columnaOrden} ${order}
            LIMIT ? OFFSET ?
        `;

        const [rows] = await db.query(query, [termino, termino, limit, offset]);

        // 📈 Total de registros (para paginación real)
        const [[{ total }]] = await db.query(
            `
            SELECT COUNT(*) as total
            FROM ARTICULOS_PAGWEB_ISI
            WHERE NOMBRE LIKE ? OR CLAVE_ARTICULO LIKE ?
            `,
            [termino, termino]
        );

        res.json({
            datos: rows,
            total,
            pagina,
            paginas: Math.ceil(total / limit),
            offset,
            limit
        });

    } catch (error) {
        console.error(error)
        res.status(500).json({ mensaje: 'Error del servidor' })
    }
}
exports.mostrarCotizaciones = async (req, res) => {
    const CLIENTE_ID = req.params.CLIENTE_ID;
    try {
        const [rows] = await db.query(
        'SELECT * FROM DOCTOS_COT WHERE CLIENTE_ID = ? AND ESTATUS != ?',
        [CLIENTE_ID, 'CANCELADA'] // <--- Pasamos el texto como parámetro
        );

        // Siempre 200, aunque venga vacío
        res.json(rows)
        console.log(rows);
    } catch (error) {
        console.error(error)
        res.status(500).json({ mensaje: 'Error del servidor' })
    }
}
exports.mostrarCotizacion = async (req, res) => {
    const COTIZACION_ID = req.params.COTIZACION_ID;
    try {
        const [rows] = await db.query(
            'SELECT * FROM DOCTOS_COT WHERE COTIZACION_ID = ?',
            [COTIZACION_ID]
        )

        // Siempre 200, aunque venga vacío
        res.json(rows)

    } catch (error) {
        console.error(error)
        res.status(500).json({ mensaje: 'Error del servidor' })
    }
}
exports.mostrarArticulos = async (req, res) => {
    const COTIZACION_ID = req.params.COTIZACION_ID;
    try {
        // 1. Obtener el detalle de la cotización específica
        const [detalle] = await db.query(
            'SELECT * FROM DOCTOS_COT_DET WHERE COTIZACION_ID = ?',
            [COTIZACION_ID]
        );

        // 2. Obtener el catálogo de nombres/precios de la tabla ISI
        const [articulosISI] = await db.query(
            'SELECT ART_ID, NOMBRE, CLAVE_ARTICULO, PRECIO, EXISTENCIA_A, EXISTENCIA_T FROM ARTICULOS_PAGWEB_ISI'
        );

        // 3. Cruzar los datos (Inner Join Manual)
        // Esto es lo que hará que tu tabla de edición tenga nombres reales
        const resultadoEnriquecido = detalle.map(linea => {
            const infoArt = articulosISI.find(a => a.ART_ID == linea.ART_ID);
            
            return {
                ...linea,
                NOMBRE: infoArt ? infoArt.NOMBRE : 'Producto no encontrado',
                CLAVE_ARTICULO: infoArt ? infoArt.CLAVE_ARTICULO : 'N/A',
                // Calculamos existencia real sumando ambas columnas de la tabla ISI
                EXISTENCIA: infoArt ? (Number(infoArt.EXISTENCIA_A) + Number(infoArt.EXISTENCIA_T)) : 0,
                // Usamos el precio que viene de la tabla ISI como referencia actual
                PRECIO: infoArt ? infoArt.PRECIO : linea.PRECIO 
            };
        });

        // 4. Enviar una SOLA respuesta con todo procesado
        res.json(resultadoEnriquecido);

    } catch (error) {
        console.error("Error en la API mostrarArticulos:", error);
        res.status(500).json({ mensaje: 'Error del servidor' });
    }
}
// En tu API (Backend)
exports.guardarCotizacionCompleta = async (req, res) => {
    console.log('Cuerpo de la solicitud:', req.body);
    console.log('Content-Type recibido:', req.get('Content-Type'));
    const { CLIENTE_ID, COSTO_TOTAL, DESCRIPCION, DESCUENTO_CLIENTE, articulos } = req.body;
    console.log('DESCUENTO CLIENTE', DESCUENTO_CLIENTE)
    const connection = await db.getConnection(); // Obtener conexión para transacción

    try {
        await connection.beginTransaction();

        // 1. Insertar Encabezado
        const [cotRes] = await connection.query(
            'INSERT INTO DOCTOS_COT (CLIENTE_ID, COSTO_TOTAL, DESCRIPCION, ESTATUS, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())',
            [CLIENTE_ID, COSTO_TOTAL, DESCRIPCION, 'PENDIENTE']
        );
        const nuevoId = cotRes.insertId;
        console.log(cotRes);
        console.log('detalle')
        console.log('ARTICULOS DESDE GUARDAR API', articulos);
        // 2. Insertar Detalle (recorremos el carrito)
        const detallePromesas = articulos.map(art => {
            const descuento = (art.CANTIDAD * art.PRECIO) * DESCUENTO_CLIENTE;
            console.log(descuento);
            const impuesto = (art.IMPORTE- descuento) * art.IMPUESTO; // Ejemplo: 16% de IVA
            console.log('IMPUESTOS API', impuesto);
            return connection.query(
                'INSERT INTO DOCTOS_COT_DET (COTIZACION_ID, ART_ID, CLAVE_ARTICULO, PRECIO, CANTIDAD, DESCUENTO, IMPUESTO, IMPORTE, IMPORTE_TOTAL) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [nuevoId, art.ART_ID, art.CLAVE_ARTICULO, art.PRECIO, art.CANTIDAD, descuento, art.IMPUESTO, art.IMPORTE, art.IMPORTE_TOTAL]
            );
        });

        await Promise.all(detallePromesas);
        await connection.commit();

        res.json({ mensaje: 'Cotización y detalles guardados', id: nuevoId });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ mensaje: 'Error al guardar detalle' });
    } finally {
        connection.release();
    }
};
exports.actualizarCotizacionEditando = async (req, res) => {
    const { id } = req.params; // El ID de la cotización que estamos editando
    const { COSTO_TOTAL, DESCRIPCION, COTIZACION_ID, articulos } = req.body;
    const connection = await db.getConnection();
    //console.log('respuesta body: ', req.body)
    //console.log('costo DESDE EDITANDO', COSTO_TOTAL)
    console.log('articulos api', articulos)
    try {
        await connection.beginTransaction();

        // 1. Actualizar Encabezado (DOCTOS_COT)
        await connection.query(
            'UPDATE DOCTOS_COT SET COSTO_TOTAL = ?, DESCRIPCION = ?, updatedAt = NOW() WHERE COTIZACION_ID = ?',
            [COSTO_TOTAL, DESCRIPCION, COTIZACION_ID]
        );

        // 2. ELIMINAR TODO EL DETALLE ANTERIOR
        // Esto "limpia el lienzo" para poner las nuevas partidas de la sesión
        await connection.query('DELETE FROM DOCTOS_COT_DET WHERE COTIZACION_ID = ?', [COTIZACION_ID]);

        // 3. Insertar el Nuevo Detalle (Partidas frescas)
        const detallePromesas = articulos.map(art => {
            // Asegúrate de usar las propiedades en MAYÚSCULAS que estandarizamos
            // Cálculos para la DB
           // const descuento = (cantidad * precioLista) - importeTotal;
            //const impuesto = importeTotal * 0.16; // O el cálculo que definas
            return connection.query(
                'INSERT INTO DOCTOS_COT_DET (COTIZACION_ID, ART_ID, CLAVE_ARTICULO, PRECIO, CANTIDAD, DESCUENTO, IMPUESTO, IMPORTE, IMPORTE_TOTAL) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [COTIZACION_ID, art.ART_ID, art.CLAVE_ARTICULO, art.PRECIO, art.CANTIDAD, art.DESCUENTO, art.IMPUESTO, art.IMPORTE, art.IMPORTE_TOTAL]
            );
        });

        await Promise.all(detallePromesas);
        await connection.commit();

        // IMPORTANTE: Limpiar la sesión después de guardar con éxito

        res.json({ mensaje: 'Cotización actualizada correctamente', COTIZACION_ID});

    } catch (error) {
        await connection.rollback();
        console.error('Error al actualizar:', error);
        res.status(500).json({ mensaje: 'Error al actualizar la cotización' });
    } finally {
        connection.release();
    }
};
exports.cancelarCotizacion = async (req, res) => {
    const { COTIZACION_ID } = req.params;

    try {
        // Ejecutamos el Update
        const [result] = await db.query(
            'UPDATE DOCTOS_COT SET ESTATUS = ? WHERE COTIZACION_ID = ?',
            ['CANCELADA', COTIZACION_ID]
        );

        // Verificamos si el ID existía y se actualizó
        if (result.affectedRows === 0) {
            return res.status(404).json({ mensaje: 'Cotización no encontrada' });
        }

        // Si usas redirección (para formularios tradicionales)
        // res.redirect('/cotizaciones/mis-cotizaciones'); 
        
        // Si usas AJAX
        res.json({ mensaje: 'Cotización cancelada con éxito' });

    } catch (error) {
        console.error("Error al cancelar:", error);
        res.status(500).json({ mensaje: 'Error del servidor al intentar cancelar' });
    }
};
exports.guardarArticuloInventario = async (req, res) => {
    console.log('Cuerpo de la solicitud:', req.body);
    console.log('Content-Type recibido:', req.get('Content-Type'));
    const {colector, zona, codigo, descripcion, cantidad, almacen} = req.body;
    
    const connection = await db.getConnection(); // Obtener conexión para transacción

    try {
        await connection.beginTransaction();

        // 1. Insertar Encabezado
        const [Res] = await connection.query(
            'INSERT INTO ARTICULOS_INV_FISICO (CLAVE_ARTICULO, DESCRIPCION, CONTADO, ZONA_ID, COLECTOR_ID, ALMACEN) VALUES (?, ?, ?, ?, ?, ?)',
            [codigo, descripcion, cantidad, zona, colector, almacen]
        );
        //await Promise.all(detallePromesas);
        await connection.commit();
        return res.status(200).json({ 
            mensaje: 'Guardado con éxito',
            colector: colector 
        });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ mensaje: 'Error al guardar detalle' });
    } finally {
        connection.release();
    }
};
exports.mostrarArticulosInventario = async (req, res) => {
    const colectorId = req.params.id;
    try {
        const [rows] = await db.query(
            `SELECT 
                a.*, 
                c.COLECTOR as NOMBRE_COLECTOR,
                z.ZONA as NOMBRE_ZONA
             FROM ARTICULOS_INV_FISICO a
             INNER JOIN COLECTORES c ON a.COLECTOR_ID = c.COLECTOR_ID
             INNER JOIN ZONAS z ON a.ZONA_ID = z.ZONA_ID
             WHERE a.COLECTOR_ID = ?`,
            [colectorId]
        );

        // Siempre 200, aunque venga vacío
        res.json(rows)
        console.log(rows);
    } catch (error) {
        console.error(error)
        res.status(500).json({ mensaje: 'Error del servidor' })
    }
};
exports.mostrarColectores = async (req, res) => {
    try {
        const [rows] = await db.query(
        'SELECT * FROM COLECTORES '
        );
        res.json(rows)
    } catch (error) {
        console.error(error)
        res.status(500).json({ mensaje: 'Error del servidor' })
    }
};
exports.mostrarZonas = async (req, res) => {
    try {
        const [rows] = await db.query(
        'SELECT * FROM ZONAS '
        );
        res.json(rows)
    } catch (error) {
        console.error(error)
        res.status(500).json({ mensaje: 'Error del servidor' })
    }
};
exports.mostrarZonasById = async (req, res) => {
    console.log(req.params)
    const [rows] = await db.query(
        'SELECT * FROM ZONAS WHERE ZONA_ID = ?',
        [req.params.id]
    )

    if (rows.length === 0) {
        return res.status(404).json({ mensaje: 'No existe' })
    }

    res.json(rows)
};
exports.mostrarColectoresById = async (req, res) => {
    console.log(req.params)
    const [rows] = await db.query(
        'SELECT * FROM COLECTORES WHERE COLECTOR_ID = ?',
        [req.params.id]
    )

    if (rows.length === 0) {
        return res.status(404).json({ mensaje: 'No existe' })
    }

    res.json(rows)
};

exports.mostrarRegistros = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT a.*, c.COLECTOR as NOMBRE_COLECTOR,
            z.ZONA as NOMBRE_ZONA
            FROM ARTICULOS_INV_FISICO a
            INNER JOIN COLECTORES c ON a.COLECTOR_ID = c.COLECTOR_ID
            INNER JOIN ZONAS z ON a.ZONA_ID = z.ZONA_ID`
            );
        res.json(rows)
    } catch (error) {
        console.error(error)
        res.status(500).json({ mensaje: 'Error del servidor' })
    }
};
exports.eliminarRegistro = async (req, res) => {
    const { id } = req.params; // Extraemos el ID de la URL

    try {
        // Ejecutamos la eliminación
        const [result] = await connection.query(
            'DELETE FROM ARTICULOS_INV_FISICO WHERE ID = ?', 
            [id]
        );

        // Verificamos si realmente se eliminó algo
        if (result.affectedRows === 0) {
            return res.status(404).json({ mensaje: 'No se encontró el registro con ese ID' });
        }

        // IMPORTANTE: Siempre responder algo para cerrar la conexión
        res.json({ mensaje: 'Registro eliminado con éxito' });

    } catch (error) {
        console.error('Error al eliminar:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor al eliminar' });
    }
};
