const Pokemon = require('../models/Pokemon');
const { pipeline } = require('@xenova/transformers');

// Initialize model once globally to avoid reloading on every request
let extractor = null;
const getExtractor = async () => {
    if (!extractor) {
        extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    }
    return extractor;
};

exports.searchPokemon = async (req, res) => {
    try {
        const { q } = req.query;

        // If no query, return all (limit 20)
        if (!q) {
            const pokemons = await Pokemon.find().limit(20);
            return res.json(pokemons);
        }

        const model = await getExtractor();
        
        // Convert user query (e.g., "fire bird") to vector
        const output = await model(q, { pooling: 'mean', normalize: true });
        const queryVector = Array.from(output.data);

        // Vector Search Aggregation
        const results = await Pokemon.aggregate([
            {
                "$vectorSearch": {
                    "index": "vector_index",
                    "path": "embedding",
                    "queryVector": queryVector,
                    "numCandidates": 100,
                    "limit": 10
                }
            },
            {
                "$project": {
                    name: 1,
                    image: 1,
                    types: 1,
                    stats: 1,
                    description: 1,
                    score: { $meta: "vectorSearchScore" } // Show match score
                }
            }
        ]);

        res.json(results);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};