# Proyecto-Disney

Objetivo
Desarrollar una API para explorar el mundo de Disney, la cual permitirá conocer y modificar los personajes que lo componen
y entender en qué películas estos participaron. Por otro lado, deberá exponer la información para que cualquier frontend pueda consumirla.

# Requerimientos técnicos
---------------------------

1.	Modelado de Base de Datos

● Personaje: deberá tener,
○ Imagen.
○ Nombre.
○ Edad.
○ Peso.
○ Historia.
○ Películas o series asociadas.

● Película o Serie: deberá tener,
○ Imagen.
○ Título.
○ Fecha de creación.
○ Calificación (del 1 al 5).
○ Personajes asociados.

● Género: deberá tener,
○ Nombre.
○ Imagen.
○ Películas o series asociadas.

CREATE TABLE personajes(id_character SERIAL PRIMARY KEY, image VARCHAR(255) NOT NULL, name VARCHAR(100) NOT NULL, age INT NOT NULL, weight INT NOT NULL, history VARCHAR(255));

CREATE TABLE reparto(id SERIAL PRIMARY KEY, id_movie INT NOT NULL, id_character INT NOT NULL );

CREATE TABLE peliculas(id_movie SERIAL PRIMARY KEY, image VARCHAR(255) NOT NULL, title VARCHAR(100) NOT NULL, create_date TIMESTAMP NOT NULL, qualification INT NOT NULL);

CREATE TABLE genero(id_gender SERIAL PRIMARY KEY, gender VARCHAR(50) NOT NULL);

CREATE TABLE caracteriza(id SERIAL PRIMARY KEY, id_movie INT NOT NULL, id_gender INT NOT NULL );

CREATE TABLE usuarios(id_user SERIAL PRIMARY KEY, email VARCHAR(100) NOT NULL, password VARCHAR(20) NOT NULL);


2. Autenticación de Usuarios

Para realizar peticiones a los endpoints subsiguientes el usuario deberá contar con un token que obtendrá al autenticarse. 
Para ello, deberán desarrollarse los endpoints de registro y login, que permitan obtener el token.

Los endpoints encargados de la autenticación deberán ser:

● /auth/login

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

● /auth/register

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

3. Listado de Personajes

El listado deberá mostrar:

● Imagen.
● Nombre.

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


4. Creación, Edición y Eliminación de Personajes

Deberán existir las operaciones básicas de creación, edición y eliminación de personajes.

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


5. Detalle de Personaje

En el detalle deberán listarse todos los atributos del personaje, como así también sus películas o series relacionadas.

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


6. Búsqueda de Personajes. (no realizado)

Deberá permitir buscar por nombre, y filtrar por edad, peso o películas/series en las que participó. 
Para especificar el término de búsqueda o filtros se deberán enviar como parámetros de query:

● /characters?name=nombre
● /characters?age=edad
● /characters?movies=idMovie

7. Listado de Películas

Deberá mostrar solamente los campos imagen, título y fecha de creación.

El endpoint deberá ser:

● /movies

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


8. Detalle de Película / Serie con sus personajes
Devolverá todos los campos de la película o serie junto a los personajes asociados a la misma

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

9. Creación, Edición y Eliminación de Película / Serie
Deberán existir las operaciones básicas de creación, edición y eliminación de películas o series.

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

10. Búsqueda de Películas o Series (no implementado)

Deberá permitir buscar por título, y filtrar por género. Además, permitir ordenar los resultados por fecha de creación de forma ascendiente o descendiente.

El término de búsqueda, filtro u ordenación se deberán especificar como parámetros de query:

● /movies?name=nombre
● /movies?genre=idGenero
● /movies?order=ASC | DESC


11. Envío de emails (no implementado)

Al registrarse en el sitio, el usuario deberá recibir un email de bienvenida. Es recomendable, la utilización de algún servicio de terceros como SendGrid.









