const mongoose = require('mongoose');

const PokemonSchema = new mongoose.Schema({
  name: { type: String, required: true },
  pokedexId: Number,
  types: [String],
  image: String, 
  stats: {
    hp: Number,
    attack: Number,
    defense: Number,
    speed: Number,
  },
  description: String, 
  // AI Vector Embedding store
  embedding: {
    type: [Number],
    required: true,
  },
});

module.exports = mongoose.model('Pokemon', PokemonSchema);