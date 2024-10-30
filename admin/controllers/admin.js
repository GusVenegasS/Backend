// admin.js
const db = require('../db');

async function brigadas(req, res) {
    try {
        let fechaInicio = new Date(req.body.fechaInicio);
        fechaInicio.setUTCHours(fechaInicio.getUTCHours() + 5)
        let fechaFin = new Date(req.body.fechaFin);
        fechaFin.setUTCHours(fechaFin.getUTCHours() + 5)
        const diasSemana = ["lunes", "martes", "miércoles", "jueves", "viernes"];
        const brigadas = [
            { nombre: "Brigada de limpieza", actividad: "limpieza" },
            { nombre: "Brigada de paseo", actividad: "paseo" }
        ];

        for (const brigada of brigadas) {
            for (const diaSemana of diasSemana) {
                const documento = { nombre: `${brigada.nombre} ${diaSemana}` };
                const brigadaExistente = await buscarBrigadas("Brigadas", "data", documento);

                if (!brigadaExistente) {
                    const insert = {
                        brigada_id: `${brigada.nombre.toLowerCase().replace(/ /g, '')}-${diaSemana.toLowerCase()}`,
                        nombre: `${brigada.nombre} ${diaSemana}`,
                        actividad: brigada.actividad,
                        diaSemana: diaSemana,
                        usuarios: [],
                        fechaCreacion: new Date()
                    };
                    await saveDB("Brigadas", "data", insert);
                }
            }
        }

        for (let fecha = fechaInicio; fecha <= fechaFin; fecha.setDate(fecha.getDate() + 1)) {
            console.log("esta es la fecha iniciaaaaaaal", fecha)
            const diaSemanaIndex = fecha.getDay();
            console.log(diaSemanaIndex)

            if (diaSemanaIndex >= 1 && diaSemanaIndex <= 5) {
                const diaSemana = diasSemana[diaSemanaIndex - 1];
                for (const brigada of brigadas) {
                    const brigadaNombre = `${brigada.nombre} ${diaSemana}`;
                    const brigadaExistente = await buscarBrigadas("Brigadas", "data", { nombre: brigadaNombre });

                    if (brigadaExistente) {
                        console.log("fecha de la tarea", fecha)
                        const tarea = {
                            tarea_id: `${brigada.nombre.toLowerCase()}-${fecha.toISOString().split('T')[0]}`,
                            brigada_id: brigadaExistente.brigada_id,
                            descripcion: `${brigada.actividad.charAt(0).toUpperCase() + brigada.actividad.slice(1)} del día ${fecha.toISOString().split('T')[0]}`,
                            fecha: new Date(fecha),
                            estado: "pendiente",
                            evidencia_id: null,
                            fechaCreacion: new Date()
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

async function buscarBrigadas(Base, Coleccion, documento) {
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
    brigadas
};
