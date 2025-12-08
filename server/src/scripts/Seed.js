require('dotenv').config();
const axios = require('axios');
const mongoose = require('mongoose');
const Pokemon = require('../models/Pokemon');
const connectDB = require('../config/db');
// Transformer library for creating embeddings locally 
const { pipeline } = require('@xenova/transformers');

const seedData = async () => {
  await connectDB();

  try {
    console.log("Downloading embedding model... (this might take a moment)");
    // Load model for semantic analysis
    const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

    console.log("Fetching Pokemon data...");
    // fetch the first 50 pokemon for demo 
    const { data } = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=50');

    const pokemonList = [];

    for (const p of data.results) {
      const details = await axios.get(p.url);
      const d = details.data;

      // Extract Types
      const types = d.types.map(t => t.type.name);
      
      // Extract Stats
      const stats = {};
      d.stats.forEach(s => stats[s.stat.name] = s.base_stat);

      const descriptionForAI = `${d.name} is a ${types.join(' and ')} type pokemon. Stats: HP ${stats.hp}, Attack ${stats.attack}, Defense ${stats.defense}, Speed ${stats.speed}.`;

      // Generate Embedding (Vector)
      const output = await extractor(descriptionForAI, { pooling: 'mean', normalize: true });
      const embedding = Array.from(output.data);

      pokemonList.push({
        name: d.name,
        pokedexId: d.id,
        image: d.sprites.front_default,
        types: types,
        stats: {
          hp: stats.hp,
          attack: stats.attack,
          defense: stats.defense,
          speed: stats.speed,
        },
        description: descriptionForAI,
        embedding: embedding
      });

      console.log(`Processed: ${d.name}`);
    }

    // Clear old data and insert new
    await Pokemon.deleteMany({});
    await Pokemon.insertMany(pokemonList);

    console.log("Data Seeded Successfully!");
    process.exit();

  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  }
};

seedData();