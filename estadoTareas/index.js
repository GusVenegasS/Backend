const cron = require('node-cron');

var url = "mongodb://localhost:27017";
const MongoClient = require('mongodb').MongoClient;

cron.schedule("0 0 * * *", () => { // Ejecuta cada segundo
    console.log("Entre a ejecutar");
    start();
});

async function start() {
    try {
        // Conexión usando MongoClient
        const client = await MongoClient.connect(url);

        const database = client.db("Tareas");

        // Ejecuta la función actualizar
        await actualizar(database);

        // Cierra la conexión después de la actualización
        client.close();
    } catch (err) {
        console.error("Error al conectar a MongoDB:", err);
    }
}

async function actualizar(database) {
    const fecha = new Date();
    fecha.setUTCHours(fecha.getUTCHours() - 5);

    try {
        // Actualiza todos los documentos en la colección "data" donde la fecha sea menor a la fecha actual
        const result = await database.collection("data").updateMany(
            {
                fecha: { $lt: fecha } // Filtra documentos donde la fecha sea menor a la fecha actual
            },
            {
                $set: { estado: "vencida" } // Actualiza el campo "estado" a "vencida"
            }
        );

        console.log(`${result.modifiedCount} documentos fueron actualizados`);
    } catch (error) {
        console.log("No se actualizaron las tareas  ", error)
    }
    console.log("fecha", fecha);


    return Promise.resolve(); // Simula que la actualización ha sido exitosa
}
