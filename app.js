// Imports
const express = require("express");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const app = express();

// Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor encendido en puerto ${PORT}`));

// Middlewares & Config
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const {
    newUser,
    loginUser,
    addPersonaje,
    getPersonajes,
    updatePersonaje,
    deletePersonaje,
    addPelicula,
    getPeliculas,
    updatePelicula,
    deletePelicula,
    addGender,
    getGenders,
    getPersonajeById,
    getPeliculaById,
    getPersonajesByName
} = require("./consultas");


// Usuarios
app.get("/auth/login", async (req, res) => {
    let login = req.body;
    try {
        login = Object.values(login);
        console.log(login)
        const resultLogin = await loginUser(login);
        if (resultLogin) {
            const token = jwt.sign(resultLogin, process.env.SECRET_KEY);
            console.log(token)
            res.status(200).send(token);
        } else {
            res.status(404).send(
                {
                    error: "404 Not found",
                    message: "No existe el email o contraseña incorrecta"
                });
        }
    } catch (e) {
        console.log(e);
        res.status(500).send(
            {
                error: "500 Internal Server Error",
                message: e
            });
    }
})

app.post("/auth/register", async (req, res) => {
    let usuario = req.body;
    console.log(usuario);
    try {
        usuario = Object.values(usuario);
        const resultNewUser = await newUser(usuario);
        res.status(201).send(resultNewUser); // crear usuario
    } catch (e) {
        console.log(e);
        res.status(500).send(
            {
                error: "500 Internal Server Error",
                message: e.message
            }
        );
    }
});

//Insertar Personaje
app.post("/characters", async (req, res) => {

// http://localhost:3000/characters?token=<token del usuario>

    const { token } = req.query;
    console.log(token);

    // datos personaje
    const { image, name, age, weight, history, id_movie } = req.body;

    jwt.verify(token, process.env.SECRET_KEY, async (err, data) => {
        if (err) {
            const { message } = err;
            res.status(401).send({ error: "401 Unauthorized", message });
        } else {
            try {
                //  personaje = Object.values(personaje);
                const resultAddPersonaje = await addPersonaje(image, name, age, weight, history, id_movie);
                res.status(201).send({ usuario: data, token, resultAddPersonaje });
                // res.status(201).send(resultAddPersonaje); 
            } catch (e) {
                console.log(e);
                res.status(500).send(
                    {
                        error: "500 Internal Server Error",
                        message: e
                    });
            }
        }
    });
});

// Listar personajes
app.get("/characters", async (req, res) => {

// http://localhost:3000/characters?token=<token del usuario>

    const { token } = req.query;
    console.log(token);

    jwt.verify(token, process.env.SECRET_KEY, async (err, data) => {
        if (err) {
            const { message } = err;
            res.status(401).send({ error: "401 Unauthorized", message });
        } else {
            let personajes;
            try {
                const { id_user } = data;
                console.log('id_user: ', id_user);
                personajes = await getPersonajes();
                res.status(200).send({ usuario: data, token, personajes });
            } catch (e) {
                console.log(e);
                res.status(500).send(
                    {
                        error: "500 Internal Server Error",
                        message: e
                    });
            }
        }
    });
});

// Editar personaje
app.put('/characters/:id_character', async (req, res) => {

// http://localhost:3000/characters/id_character?token=<token del usuario>

    const { id_character } = req.params;
    const { token } = req.query;
    console.log(token);
    let datos = req.body;

    jwt.verify(token, process.env.SECRET_KEY, async (err, data) => {
        if (err) {
            const { message } = err;
            res.status(401).send({ error: "401 Unauthorized", message });
        } else {

            try {
                datos = Object.values(datos);
                const resultUpdatePersonaje = await updatePersonaje(datos, id_character); // actualizar personaje
                res.status(201).send({ usuario: data, token, personaje: resultUpdatePersonaje });
            } catch (e) {
                console.log(e);
                res.status(500).send(
                    {
                        error: "500 Internal Server Error",
                        message: e
                    });
            }
        }
    })
})

// Eliminar personaje
app.delete('/characters/:id_character', async (req, res) => {
// http://localhost:3000/characters/id_character?token=<token del usuario>

    const { id_character } = req.params;
    const { token } = req.query;
    console.log(token);

    jwt.verify(token, process.env.SECRET_KEY, async (err, data) => {
        if (err) {
            const { message } = err;
            res.status(401).send({ error: "401 Unauthorized", message });
        } else {
            let msgPersonaje;
            try {
                const resultDeletePersonaje = await deletePersonaje(id_character);
                if (resultDeletePersonaje == 0) msgPersonaje = resultDeletePersonaje;
                if (resultDeletePersonaje == 1) msgPersonaje = "Personaje Eliminado";
                res.status(201).send({ usuario: data, token, msgPersonaje });
            } catch (e) {
                console.log(e);
                res.status(500).send(
                    {
                        error: "500 Internal Server Error",
                        message: e
                    });
            }
        }
    })
});

// Detalle de personaje
app.get("/characters/:id_character", async (req, res) => {

    // http://localhost:3000/character/id_character?token=<token del usuario>
    const { id_character } = req.params;
    const { token } = req.query;
    console.log(token);

    jwt.verify(token, process.env.SECRET_KEY, async (err, data) => {
        if (err) {
            const { message } = err;
            res.status(401).send({ error: "401 Unauthorized", message });
        } else {
            let personaje;
            try {
                const { id_user } = data;
                console.log('id_user: ', id_user);
                personaje = await getPersonajeById(id_character);
                res.status(200).send({ usuario: data, token, personaje });
            } catch (e) {
                console.log(e);
                res.status(500).send(
                    {
                        error: "500 Internal Server Error",
                        message: e
                    });
            }
        }
    });
});

// Busqueda de Personajes por nombre
app.get("/api/characters", async (req, res) => {

// http://localhost:3000/api/characters?name=<nombre>&token=<token>

    const { name, token } = req.query;
    console.log(token);

    jwt.verify(token, process.env.SECRET_KEY, async (err, data) => {
        if (err) {
            const { message } = err;
            res.status(401).send({ error: "401 Unauthorized", message });
        } else {
            let personaje;
            try {
                const { id_user } = data;
                console.log('id_user: ', id_user);
                personaje = await getPersonajesByName(name);
                res.status(200).send({ usuario: data, token, personaje });
            } catch (e) {
                console.log(e);
                res.status(500).send(
                    {
                        error: "500 Internal Server Error",
                        message: e
                    });
            }
        }
    });
});

// Insertar Pelicula
app.post("/movies", async (req, res) => {

// http://localhost:3000/movies?token=<token del usuario>

    const { token } = req.query;
    console.log(token);

    //datos pelicula
    const { image, title, create_date, qualification, id_gender } = req.body;
    jwt.verify(token, process.env.SECRET_KEY, async (err, data) => {
        if (err) {
            const { message } = err;
            res.status(401).send({ error: "401 Unauthorized", message });
        } else {

            //  console.log(pelicula);
            try {
                //pelicula = Object.values(pelicula);
                const resultAddPelicula = await addPelicula(image, title, create_date, qualification, id_gender);
                res.status(201).send({ usuario: data, token, resultAddPelicula });
                // res.status(201).send(resultAddPelicula); 
            } catch (e) {
                console.log(e);
                res.status(500).send(
                    {
                        error: "500 Internal Server Error",
                        message: e
                    });
            }
        }
    });
});

// Listar peliculas
app.get("/movies", async (req, res) => {

// http://localhost:3000/movies?token=<token del usuario>

    const { token } = req.query;
    console.log(token);

    jwt.verify(token, process.env.SECRET_KEY, async (err, data) => {
        if (err) {
            const { message } = err;
            res.status(401).send({ error: "401 Unauthorized", message });
        } else {
            let peliculas;
            try {
                const { id_user } = data;
                console.log('id_user: ', id_user);
                peliculas = await getPeliculas();
                res.status(200).send({ usuario: data, token, peliculas });
            } catch (e) {
                console.log(e);
                res.status(500).send(
                    {
                        error: "500 Internal Server Error",
                        message: e
                    });
            }
        }
    });
});

// Editar pelicula
app.put('/movies/:id_movie', async (req, res) => {

// http://localhost:3000/movies/id_movie?token=<token del usuario>

    const { id_movie } = req.params;
    const { token } = req.query;
    console.log(token);
    let datos = req.body;

    jwt.verify(token, process.env.SECRET_KEY, async (err, data) => {
        if (err) {
            const { message } = err;
            res.status(401).send({ error: "401 Unauthorized", message });
        } else {

            try {
                datos = Object.values(datos);
                const resultUpdatePelicula = await updatePelicula(datos, id_movie); // actualizar pelicula
                res.status(201).send({ usuario: data, token, pelicula: resultUpdatePelicula });
            } catch (e) {
                console.log(e);
                res.status(500).send(
                    {
                        error: "500 Internal Server Error",
                        message: e
                    });
            }
        }
    })
})

// Eliminar pelicula
app.delete('/movies/:id_movie', async (req, res) => {

    // http://localhost:3000/movies/id_movie?token=<token del usuario>

    const { id_movie } = req.params;
    const { token } = req.query;
    console.log(token);

    jwt.verify(token, process.env.SECRET_KEY, async (err, data) => {
        if (err) {
            const { message } = err;
            res.status(401).send({ error: "401 Unauthorized", message });
        } else {
            let msgPelicula;
            try {
                const resultDeletePelicula = await deletePelicula(id_movie);
                if (resultDeletePelicula == 0) msgPersonaje = resultDeletePelicula;
                if (resultDeletePelicula == 1) msgPersonaje = "Pelicula Eliminada";
                res.status(201).send({ usuario: data, token, msgPelicula });
            } catch (e) {
                console.log(e);
                res.status(500).send(
                    {
                        error: "500 Internal Server Error",
                        message: e
                    });
            }
        }
    })
});

// Detalle de pelicula
app.get("/movies/:id_movie", async (req, res) => {

// http://localhost:3000/movies/id_movie?token=<token del usuario>

    const { id_movie } = req.params;
    const { token } = req.query;
    console.log(token);

    jwt.verify(token, process.env.SECRET_KEY, async (err, data) => {
        if (err) {
            const { message } = err;
            res.status(401).send({ error: "401 Unauthorized", message });
        } else {
            let pelicula;
            try {
                const { id_user } = data;
                console.log('id_user: ', id_user);
                pelicula = await getPeliculaById(id_movie);
                res.status(200).send({ usuario: data, token, pelicula});
            } catch (e) {
                console.log(e);
                res.status(500).send(
                    {
                        error: "500 Internal Server Error",
                        message: e
                    });
            }
        }
    });
});

// Insertar Gender
app.post("/genders", async (req, res) => {
    
// http://localhost:3000/genders?token=<token del usuario>
   
    let genero = req.body;
    console.log(genero);
    try {
        genero = Object.values(genero);
        const resultNewGender = await addGender(genero);
        res.status(201).send(resultNewGender); 
    } catch (e) {
        console.log(e);
        res.status(500).send(
            {
                error: "500 Internal Server Error",
                message: e
            });
    }
});

app.get("/genders", async (req, res) => {

// http://localhost:3000/genders?token=<token del usuario>

    const { token } = req.query;
    console.log(token);

    jwt.verify(token, process.env.SECRET_KEY, async (err, data) => {
        if (err) {
            const { message } = err;
            res.status(401).send({ error: "401 Unauthorized", message });
        } else {
            let genders;
            try {
                const { id_user } = data;
                console.log('id_user: ', id_user);
                genders = await getGenders();
                res.status(200).send({ usuario: data, token, genders });
            } catch (e) {
                console.log(e);
                res.status(500).send(
                    {
                        error: "500 Internal Server Error",
                        message: e
                    });
            }
        }
    });
});


 