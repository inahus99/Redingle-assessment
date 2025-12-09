import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
function App() {
  const [query, setQuery] = useState('');
  const [pokemons, setPokemons] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPokemon();
  }, []);

  const fetchPokemon = async (searchQuery = '') => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/search?q=${searchQuery}`);
      setPokemons(data);
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Failed to fetch data. Is backend running?");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPokemon(query);
  };

  return (
    <div className="container">
      <h1>AI PokéDex</h1>
      
      <form onSubmit={handleSearch} className="search-box">
        <input 
          type="text" 
          placeholder="Try: 'fast fire pokemon' or 'heavy tank'..." 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Thinking...' : 'Search'}
        </button>
      </form>

      <div className="grid">
        {pokemons.map((p) => (
          <div key={p._id} className="card">
            <img src={p.image} alt={p.name} />
            <h2>{p.name.charAt(0).toUpperCase() + p.name.slice(1)}</h2>
            
            <div className="tags">
              {p.types.map(t => <span key={t} className="tag">{t}</span>)}
            </div>

            <p style={{fontSize: '0.9rem', color: '#ccc'}}>
           
              {p.description.split('.')[0]}.
            </p>

            <div className="stats">
              <span>⚔️ {p.stats.attack}</span>
              <span>🛡️ {p.stats.defense}</span>
              <span>⚡ {p.stats.speed}</span>
            </div>
            
            {/* Semantic Search Score Display  */}
            {p.score && (
               <div className="score">Match: {(p.score * 100).toFixed(1)}%</div>
            )}
          </div>
        ))}
      </div>
      
      {pokemons.length === 0 && !loading && (
        <p>No Pokemon found looking like that.</p>
      )}
    </div>
  );
}

export default App;