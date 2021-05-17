const { Pool } = require("pg");

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    password: "postgres",
    database: "disney",
    port: 5432,
});

const newUser = async (usuario) => {
    try {
        const result = await pool.query(
            `INSERT INTO usuarios (email, password) values ($1, $2) RETURNING *`,
            usuario
        );
        return result.rows[0]
    } catch (error) {
        console.log(error.code);
        return error.code;
    }
};

const loginUser = async (login) => {
    try {
        const result = await pool.query('SELECT * FROM usuarios WHERE email = $1 AND password = $2',
            login);
        return result.rows[0];
    } catch (error) {
        console.log(error.code);
        return error.code;
    }
}

// AGREGAR PERSONAJE
const addPersonaje = async (image, name, age, weight, history, id_movie) => {

    const resultQueryPelicula = await pool.query(
        `SELECT * FROM peliculas WHERE id_movie = ${id_movie}`);

    if (resultQueryPelicula.rowCount == 0) {

        throw "No se encuentra Pelicula con ese ID";

    } else {

        // consultar que personaje no este repetido
        const resultQueryPersonaje = await pool.query(
            `SELECT * FROM personajes WHERE name = '${name}'`);
        let personaje = resultQueryPersonaje.rows[0];
        console.log(personaje);

        if (resultQueryPersonaje.rowCount == 0) {
            // Personaje no existe

            const resultInsertPersonaje = await pool.query(
                `INSERT INTO personajes (image, name, age, weight, history) values ('${image}', '${name}', ${age}, ${weight}, '${history}') RETURNING *`);
            personaje = resultInsertPersonaje.rows[0];

            // Obtener el id del personaje insertado
            const result = await pool.query(`SELECT id_character FROM personajes WHERE name = '${name}'`);
            const { id_character: id_personaje } = result.rows[0];
            console.log('ID de personaje insertado', id_personaje);

            const resultInsertReparto = await pool.query(
                `INSERT INTO reparto (id_movie, id_character) values (${id_movie}, ${id_personaje}) RETURNING *`);
            const reparto = resultInsertReparto.rows[0];

            return { personaje, reparto }

        } else {
           
            // Personaje  Existe
            const { id_character: character } = resultQueryPersonaje.rows[0];
            console.log('character : ', character);

            const resultQueryReparto = await pool.query(
                `SELECT * FROM reparto WHERE id_movie = ${id_movie} AND id_character = ${character}`);

            if (resultQueryReparto.rowCount == 0) {
               // Existe personaje pero no con ese pelicula por lo que se ingresa a reparto

                const resultInsertReparto = await pool.query(
                    `INSERT INTO reparto (id_movie, id_character) values (${id_movie}, ${character}) RETURNING *`);
                const reparto = resultInsertReparto.rows[0];

                return { personaje, reparto }

            } else {
                
                throw "Personaje ya se encuentra en los registros asociado a esa pelicula";
            }
        }
    }
}

const getPersonajes = async () => {
    try {
        const result = await pool.query("SELECT id_character, image, name FROM personajes");
        return result.rows;
    } catch (error) {
        console.log(error.code);
        return error.code;
    }
}

const updatePersonaje = async (datos, id_character) => {
    try {
        const result = await pool.query(`UPDATE personajes SET image = $1, name = $2, age = $3, weight = $4, history = $5 WHERE id_character = ${id_character} RETURNING *`,
            datos);
        return result.rows[0];
    } catch (error) {
        console.log(error.code);
        return error.code;
    }
}

const deletePersonaje = async (id_character) => {
    try {
        const result = await pool.query(
            `DELETE FROM personajes WHERE id_character = ${id_character}  RETURNING *`);

        if (result.rowCount == 0) {
            throw "NO existe un personaje con este ID";
        } else {
            return result.rowCount;
        }
    } catch (error) {
        console.log(error.code);
        return error.code;
    }
};

const getPersonajeById = async(id_character)=>{
    console.log(id_character);
    try {
        const result = await pool.query(`SELECT * FROM personajes WHERE id_character = ${id_character}`);
        const character = result.rows[0]; 

        const resultado = await pool.query(`SELECT pp.id_movie , pp.image, pp.title, pp.create_date, pp.qualification, jj.id_character FROM peliculas AS pp INNER JOIN reparto as rr ON pp.id_movie = rr.id_movie INNER JOIN personajes AS jj ON rr.id_character = jj.id_character WHERE jj.id_character = ${id_character}  GROUP BY jj.id_character, pp.id_movie`);
        const moviesByCharacter = resultado.rows;
        
        return { character, moviesByCharacter };
    } catch (error) {
        console.log(error.code);
        return error.code;
    }
}

const getPersonajesByName= async(name)=>{
    console.log(name);
    try {
        const result = await pool.query(`SELECT * FROM personajes WHERE name LIKE '${name}%'`);
        const charactersByName = result.rows[0]; 

        return { charactersByName };
    } catch (error) {
        console.log(error.code);
        return error.code;
    }
}


// AGREGAR PELICULA
const addPelicula = async (image, title, create_date, qualification, id_gender) => {

    const resultQueryGenero = await pool.query(
        `SELECT * FROM genero WHERE id_gender = ${id_gender}`);

    if (resultQueryGenero.rowCount == 0) {

        throw "No se encuentra Genero de Pelicula con ese ID";

    } else {

        // consultar que pelicula no este repetida
        const resultQueryPelicula = await pool.query(
            `SELECT * FROM peliculas WHERE title = '${title}'`);
        let pelicula = resultQueryPelicula.rows[0];
        console.log(pelicula);

        if (resultQueryPelicula.rowCount == 0) {
            // Pelicula no existe
           
            const resultInsertPelicula = await pool.query(
                `INSERT INTO peliculas (image, title, create_date, qualification) values ('${image}', '${title}', '${create_date}', ${qualification}) RETURNING *`);
            pelicula = resultInsertPelicula.rows[0];

            // Obtener el id de la pelicula insertada
            const result = await pool.query(`SELECT id_movie FROM peliculas WHERE title = '${title}'`);
            const { id_movie: id_pelicula } = result.rows[0];
            console.log('ID de pelicula insertada', id_pelicula);

            const resultInsertCaracteriza = await pool.query(
                `INSERT INTO caracteriza (id_movie, id_gender) values (${id_pelicula}, ${id_gender}) RETURNING *`);
            const caracteriza = resultInsertCaracteriza.rows[0];

            return { pelicula, caracteriza }
            
        } else {
            // Pelicuala Existe
            const { id_movie: movie } = resultQueryPelicula.rows[0];
            console.log('movie: ', movie);

            const resultQueryCaracteriza = await pool.query(
                `SELECT * FROM caracteriza WHERE id_movie = ${movie} AND id_gender = ${id_gender}`);

            if (resultQueryCaracteriza.rowCount == 0) {
               // Existe pelicula pero no con ese genero por lo que se ingresa a carcteriza

                const resultInsertCaracteriza = await pool.query(
                    `INSERT INTO caracteriza (id_movie, id_gender) values (${movie}, ${id_gender}) RETURNING *`);
                const caracteriza = resultInsertCaracteriza.rows[0];

                return { pelicula, caracteriza }

            } else {
                
                throw "Pelicula ya se encuentra en los registros asociada a ese genero";
            }
        }
    }
}

const getPeliculas = async () => {
    try {
        const result = await pool.query("SELECT id_movie, image, title , create_date FROM peliculas");
        return result.rows;
    } catch (error) {
        console.log(error.code);
        return error.code;
    }
}

const updatePelicula = async (datos, id_movie) => {
    try {
        const result = await pool.query(`UPDATE peliculas SET image = $1, title = $2, create_date = $3, qualification = $4 WHERE id_movie = ${id_movie} RETURNING *`,
            datos);
        return result.rows[0];
    } catch (error) {
        console.log(error.code);
        return error.code;
    }
}

const deletePelicula = async (id_movie) => {
    try {
        const result = await pool.query(
            `DELETE FROM peliculas WHERE id_movie = ${id_movie}  RETURNING *`);

        if (result.rowCount == 0) {
            throw "NO existe pelicula con este ID";
        } else {
            return result.rowCount;
        }
    } catch (error) {
        console.log(error.code);
        return error.code;
    }
};

const getPeliculaById = async(id_movie)=>{
    console.log(id_movie);
    try {
        const result = await pool.query(`SELECT * FROM peliculas WHERE id_movie = ${id_movie}`);
        const movie = result.rows[0]; 

        const resultado = await pool.query(` SELECT pp.id_character , pp.image, pp.name, pp.age, pp.weight, pp.history, jj.id_movie FROM personajes AS pp INNER JOIN reparto as rr  ON pp.id_character = rr.id_character INNER JOIN peliculas AS jj ON rr.id_movie = jj.id_movie WHERE jj.id_movie = ${id_movie}  GROUP BY jj.id_movie, pp.id_character;`);
        const charactersByMovie = resultado.rows;
        
        return { movie, charactersByMovie };
    } catch (error) {
        console.log(error.code);
        return error.code;
    }
}


const addGender = async (genero) => {
    try {
        const result = await pool.query(
            `INSERT INTO genero(gender) values ($1) RETURNING *`, genero);
        return result.rows[0]
    } catch (error) {
        console.log(error.code);
        return error.code;
    }
};

const getGenders = async () => {
    try {
        const result = await pool.query("SELECT * FROM genero");
        return result.rows;
    } catch (error) {
        console.log(error.code);
        return error.code;
    }
}

module.exports = {
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
};

