const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 3000;

// Función asincrónica para obtener la información de un Pokémon
async function getPokemonData(pokemonUrl) {
  try {
    const response = await axios.get(pokemonUrl);
    return {
      name: response.data.name,
      image: response.data.sprites.front_default,
    };
  } catch (error) {
    console.error('Error fetching Pokemon data:', error.message);
    return null;
  }
}

// Función asincrónica para obtener información de todos los 150 pokemones
async function getAllPokemonData() {
  const BASE_URL = 'https://pokeapi.co/api/v2/pokemon?offset=0&limit=150';
  try {
    const response = await axios.get(BASE_URL);
    const pokemonUrls = response.data.results.map((pokemon) => pokemon.url);
    const pokemonData = await Promise.all(pokemonUrls.map(getPokemonData));
    return pokemonData.filter((data) => data !== null);
  } catch (error) {
    console.error('Error fetching all Pokemon data:', error.message);
    return [];
  }
}

// Ruta para obtener la página HTML con la galería de los 150 pokemones
app.get('/pokemones', async (req, res) => {
  try {
    const pokemonData = await getAllPokemonData();
    // Renderizar el archivo index.html
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Pokémon Gallery</title>
        <style>
          /* Estilos para la galería */
          .gallery {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 10px;
          }
          .pokemon {
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .pokemon img {
            width: 100px;
            height: 100px;
          }
        </style>
      </head>
      <body>
        <h1>Pokémon Gallery</h1>
        <div class="gallery">
          ${pokemonData
            .map(
              (pokemon) => `
              <div class="pokemon">
                <p>${pokemon.name}</p>
                <img src="${pokemon.image}" alt="${pokemon.name}">
              </div>
            `
            )
            .join('')}
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor en funcionamiento en http://localhost:${PORT}`);
});
