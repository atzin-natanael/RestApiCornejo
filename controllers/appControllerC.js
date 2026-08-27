exports.mostrarCodigosFull = async (req, res) => {
    try {
        let { pagina = 1, termino = '', sort = 'NOMBRE', order = 'ASC', categoria= ''} = req.query;
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
        let query;
        let parametros;
        if(!categoria){
            query = `
                SELECT 
                    ART_ID,
                    NOMBRE,
                    CLAVE_ARTICULO,
                    PRECIO,
                    EXISTENCIA_A,
                    EXISTENCIA_T,
                    (EXISTENCIA_A + EXISTENCIA_T) AS TOTAL_EXISTENCIA,
                    IMPUESTO,
                    CONTENIDO_CAJA
                FROM ARTICULOS_PAGWEB_CORNEJO
                WHERE NOMBRE LIKE ? OR CLAVE_ARTICULO LIKE ?
                ORDER BY ${columnaOrden} ${order}
                LIMIT ? OFFSET ?
            `;
            parametros= [termino, termino, limit, offset];
        }else{
            query = `
                SELECT 
                    ART_ID,
                    NOMBRE,
                    CLAVE_ARTICULO,
                    PRECIO,
                    EXISTENCIA_A,
                    EXISTENCIA_T,
                    (EXISTENCIA_A + EXISTENCIA_T) AS TOTAL_EXISTENCIA,
                    IMPUESTO,
                    CONTENIDO_CAJA
                FROM ARTICULOS_PAGWEB_CORNEJO
                WHERE (NOMBRE LIKE ? OR CLAVE_ARTICULO LIKE ?)
                    AND CATEGORIA_ID = ?
                ORDER BY ${columnaOrden} ${order}
                LIMIT ? OFFSET ?
            `;
                parametros= [termino, termino, categoria, limit, offset];
        }
        console.log('Query:', query, 'CATEGORÍA:', categoria);

        const [rows] = await db.query(query, parametros);
        console.log('Resultados obtenidos:', rows[0]);
        // 📈 Total de registros (para paginación real)
        const [[{ total }]] = await db.query(
            `
            SELECT COUNT(*) as total
            FROM ARTICULOS_PAGWEB_CORNEJO
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