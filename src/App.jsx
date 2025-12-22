import React, {useState, useEffect} from 'react'
import Search from "./Components/Search.jsx";
import Spinner from "./Components/Spinner.jsx";
import MovieCard from "./Components/MovieCard.jsx";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        Authorization: `Bearer ${API_KEY}`
    }
};

function useDebounce(value, delay = 500) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => clearTimeout(handler); // cleanup
    }, [value, delay]);

    return debouncedValue;
}

const App = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [movieList, setMovieList] = useState([]);
    const [loading, setLoading] = useState(false);
    const debouncedSearch = useDebounce(searchTerm, 500);


    const fetchMovies = async (query = '') => {
        setLoading(true);
        setErrorMessage('');

        try {
            const endpoint = query
                ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&api_key=${API_KEY}`
                :`${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

            const response = await fetch(endpoint, API_OPTIONS)

            if (!response.ok) {
                throw new Error("Network response was not ok");
            }

            const data = await response.json();

            if (data.response === "False") {
                setErrorMessage(data.error || "Failed to fetch movies.");
                setMovieList([]);
                return;
            }

            setMovieList(data.results || []);
        } catch (error) {
            console.error("Error fetching movies:", error);
            setErrorMessage("Failed to fetch movies. Please try again later.");
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        fetchMovies(debouncedSearch);
    }, [debouncedSearch]);

    return (
        <>
            <main>
                <div className="pattern"/>
                <div className="wrapper">
                    <header>
                        <img src="./hero.png" alt="Hero Banner"/>
                        <h1>
                            Find <span className="text-gradient">Movies</span> You'll Love Without the Hassle
                        </h1>
                        <Search serachTerm={searchTerm} setSearchTerm={setSearchTerm}/>
                    </header>

                    <section className="all-movies">
                        <h2 className="mt-[40px]">All Movies</h2>

                        {loading ? (
                            <Spinner/>
                        ) : errorMessage ? (
                            <p className="text-red-500">{errorMessage}</p>
                        ) : (
                            <ul>
                                {movieList.map(movie => (
                                    <li key={movie.id}>
                                        <MovieCard movie={movie} />
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                </div>
            </main>
        </>
    )
}
export default App

