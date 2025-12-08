const express = require('express');
const router = express.Router();
const { searchPokemon } = require('../controllers/searchController');

router.get('/', searchPokemon);

module.exports = router;