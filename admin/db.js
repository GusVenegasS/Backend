'use strict';

const MongoClient = require('mongodb').MongoClient;

var state = {
    db: null,
}

exports.connect = async function (url, done) {
    if (state.db) return done()

    try {
        const client = await MongoClient.connect(url);
        state.db = client;
        done();
    } catch (err) {
        console.log(err);
        done(err);  // Llamamos a done con el error
    }
}

exports.get = function () {
    return state.db;
}

exports.close = (done) => {
    done = done || function () { };
    if (state.db) {
        state.db.close((err, result) => {
            state.db = null;
            state.mode = null;
            done(err);
        });
    }
}
