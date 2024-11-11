// admin.js
const db = require('../db');

async function brigadas(req, res) {
    try {
        const { fechaInicio, fechaFin, periodoAcademico } = req.body;

        if (!fechaInicio || !fechaFin || !periodoAcademico) {
            return res.status(400).send({ message: "Las fechas no pueden estar vacías" });
        }

        let fechaInicioDate = new Date(fechaInicio);
        fechaInicioDate.setUTCHours(fechaInicioDate.getUTCHours() + 5);
        let fechaFinDate = new Date(fechaFin);
        fechaFinDate.setUTCHours(fechaFinDate.getUTCHours() + 5);
        let fechaCreacion = new Date();
        console.log(fechaCreacion);
        fechaCreacion.setUTCHours(fechaCreacion.getUTCHours() - 5)

        if (fechaInicioDate >= fechaFinDate) {
            return res.status(400).send({ message: "La fecha de inicio debe ser anterior a la fecha de finalización" });
        }

        // Verificar si ya existen brigadas y tareas para el periodo académico
        const brigadasExistentes = await buscarBrigada("Brigadas", "data", { periodoAcademico });
        console.log("Brigadas", brigadasExistentes)
        const tareasExistentes = await buscarTareas("Tareas", "data", { periodoAcademico });

        if (brigadasExistentes || tareasExistentes) {
            return res.status(400).send({ message: "Ya existen brigadas y/o tareas para este periodo académico" });
        }

        const diasSemana = ["lunes", "martes", "miércoles", "jueves", "viernes"];
        const brigadas = [
            { nombre: "Limpieza", actividad: "limpieza" },
            { nombre: "Paseo", actividad: "paseo" }
        ];

        for (const brigada of brigadas) {
            for (const diaSemana of diasSemana) {
                const documento = { nombre: `${brigada.nombre} ${diaSemana}`, periodoAcademico };
                const brigadaExistente = await buscarBrigada("Brigadas", "data", documento);

                if (!brigadaExistente) {
                    const insert = {
                        brigada_id: `${brigada.nombre.toLowerCase().replace(/ /g, '')}-${diaSemana.toLowerCase()}`,
                        nombre: `${brigada.nombre} ${diaSemana}`,
                        actividad: brigada.actividad,
                        diaSemana: diaSemana,
                        usuarios: [],
                        fechaCreacion: fechaCreacion,
                        periodoAcademico
                    };
                    await saveDB("Brigadas", "data", insert);
                }
            }
        }

        for (let fecha = fechaInicioDate; fecha <= fechaFinDate; fecha.setDate(fecha.getDate() + 1)) {
            const diaSemanaIndex = fecha.getDay();

            if (diaSemanaIndex >= 1 && diaSemanaIndex <= 5) {
                const diaSemana = diasSemana[diaSemanaIndex - 1];
                for (const brigada of brigadas) {
                    const brigadaNombre = `${brigada.nombre} ${diaSemana}`;
                    const brigadaExistente = await buscarBrigada("Brigadas", "data", { nombre: brigadaNombre, periodoAcademico });

                    if (brigadaExistente) {
                        const fechaParse = new Date(fecha);
                        fechaParse.setSeconds(0);
                        fechaParse.setMilliseconds(0);
                        fechaParse.setHours(-5);
                        const tarea = {
                            tarea_id: `${brigada.nombre.toLowerCase()}-${fecha.toISOString().split('T')[0]}`,
                            brigada_id: brigadaExistente.brigada_id,
                            descripcion: `${brigada.actividad.charAt(0).toUpperCase() + brigada.actividad.slice(1)} ${fecha.toISOString().split('T')[0]}`,
                            fecha: fechaParse,
                            estado: "pendiente",
                            asistentes: [],
                            evidencia_id: null,
                            fechaCreacion: fechaCreacion,
                            periodoAcademico
                        };
                        await saveDB("Tareas", "data", tarea);
                    }
                }
            }
        }

        return res.status(200).send({ message: "Tareas creadas correctamente" });
    } catch (error) {
        console.error("Error al crear tareas:", error);
        return res.status(500).send({ message: "Error al crear tareas" });
    }
}

async function obtenerBrigadas(req, res) {
    console.log(req.query);
    try {
        const periodoAcademico = req.query.periodoAcademico;
        if (!periodoAcademico) {
            return res.status(400).send({ message: "Período incorrecto", status: 400 });
        }
        const brigadas = await buscarBrigadas("Brigadas", "data", { periodoAcademico });
        if (brigadas.length > 0) {
            return res.status(200).send(brigadas);
        } else {
            return res.status(404).send({ message: "No existen brigadas para este período academíco", status: 404 })
        }
    } catch (err) {
        console.error("Error al buscar brigadas:", err);
        return res.status(500).send({ message: "No eres tu, somos nosotros", status: 500 });
    }
}

async function obtenerUsuarios(req, res) {
    console.log(req.query);
    try {
        const periodoAcademico = req.query.periodoAcademico;
        if (!periodoAcademico) {
            return res.status(400).send({ message: "Período incorrecto", status: 400 });
        }
        const usuarios = await buscarBrigadas("Usuarios", "data", { periodoAcademico });
        if (usuarios.length > 0) {
            return res.status(200).send(usuarios);
        } else {
            return res.status(404).send({ message: "No existen usuarios para este período academíco", status: 404 })
        }
    } catch (err) {
        console.error("Error al buscar usuarios:", err);
        return res.status(500).send({ message: "No eres tu, somos nosotros", status: 500 });
    }
}

async function obtenerTarea(req, res) {
    console.log("query: " + req.query);
    try {
        const { periodoAcademico, fechaQuery, brigada_id } = req.query;
        const fecha = new Date(fechaQuery);
        // Eliminamos la hora, solo comparamos la fecha

        console.log("Periodo:", periodoAcademico);
        console.log("Fecha:", fecha);
        console.log("BrigadaID:", brigada_id);
        const tareas = await getTarea("Tareas", "data", { periodoAcademico, fecha, brigada_id })
        console.log(tareas)
        if (tareas.length > 0) {
            return res.status(200).send(tareas);
        } else {
            return res.status(404).send({ message: "No existen tarea para esta fecha", status: 404 })
        }
    } catch (err) {
        console.error("Error al buscar tarea:", err);
        return res.status(500).send({ message: "No eres tu, somos nosotros", status: 500 });
    }

}

async function buscarBrigada(Base, Coleccion, documento) {
    const client = db.get();
    const database = client.db(Base);
    const collection = database.collection(Coleccion);

    try {
        const result = await collection.findOne(documento);
        return result;
    } catch (err) {
        console.error("Error en la búsqueda:", err);
        throw new Error("Error al realizar la búsqueda");
    }
}

async function buscarBrigadas(Base, Coleccion, documento) {
    console.log("Buscar", documento);
    const client = db.get();
    const database = client.db(Base);
    const collection = database.collection(Coleccion);

    try {
        const result = await collection.find(documento).toArray();
        return result;
    } catch (err) {
        console.error("Error en la búsqueda:", err);
        throw new Error("Error al realizar la búsqueda");
    }
}

async function buscarTareas(Base, Coleccion, documento) {
    const client = db.get();
    const database = client.db(Base);
    const collection = database.collection(Coleccion);

    try {
        const result = await collection.findOne(documento);
        return result;
    } catch (err) {
        console.error("Error en la búsqueda:", err);
        throw new Error("Error al realizar la búsqueda");
    }
}

async function getTarea(Base, Coleccion, documento) {
    console.log("Buscar", documento);
    const client = db.get();
    const database = client.db(Base);
    const collection = database.collection(Coleccion);

    try {
        // Asegúrate de usar el operador $eq si buscas una coincidencia exacta
        const result = await collection.find({
            periodoAcademico: documento.periodoAcademico,
            brigada_id: documento.brigada_id,
            fecha: { $eq: documento.fecha }
        }).toArray();

        return result;
    } catch (err) {
        console.error("Error en la búsqueda:", err);
        throw new Error("Error al realizar la búsqueda");
    }
}


async function saveDB(Base, Coleccion, documento) {
    const client = db.get();
    const database = client.db(Base);
    const collection = database.collection(Coleccion);

    try {
        const result = await collection.insertOne(documento);
        return result;
    } catch (err) {
        console.error("Error en la inserción:", err);
        throw new Error("Error al insertar el documento");
    }
}

module.exports = {
    brigadas,
    obtenerBrigadas,
    obtenerUsuarios,
    obtenerTarea
};
