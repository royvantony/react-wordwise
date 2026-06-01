import { createContext, useContext, useEffect, useReducer } from "react";
const BASE_URL = "http://localhost:8000";
const CitiesContext = createContext();

const initialState = {
  cities: [],
  isLoading: false,
  currentCity: {},
  error: null,
};

function reducer(state, action) {
  switch (action.type) {
    case "loading":
      return { ...state, isLoading: true };
    case "loaded":
      return { ...state, isLoading: false };
    case "cities/loaded":
      return { ...state, isLoading: false, cities: action.payload };
    case "city/loaded":
      return { ...state, isLoading: false, currentCity: action.payload };
    case "cities/created":
      return { ...state, isLoading: false, cities: [...state.cities, action.payload] };
    case "cities/deleted":
      return {...state, cities: state.cities.filter((city) => city.id !== action.payload.id)};
    case "rejected":
      return { ...state, isLoading: false, error: action.payload };
    default:
      throw new Error("Unknown action type" + action.type);
  }
}

function CitiesProvider({ children }) {
  const [{ cities, isLoading, currentCity }, dispatch] = useReducer(
    reducer,
    initialState,
  );

  // const [cities, setCities] = useState([]);
  // const [currentCity, setCurrentCity] = useState(null);
  // const [isLoading, setIsLoading] = useState(false);

  useEffect(function () {
    async function fetchCities() {
      // setIsLoading(true);
      dispatch({ type: "loading" });
      try {
        const res = await fetch(`${BASE_URL}/cities`);
        const data = await res.json();
        // setCities(data);
        dispatch({ type: "cities/loaded", payload: data });
      } catch (err) {
        alert("Error: " + err);
        dispatch({ type: "rejected", payload: err });
      } finally {
        // setIsLoading(false);
        dispatch({ type: "rejected" });
      }
    }
    fetchCities();
  }, []);

  async function getCity(id) {
    // setIsLoading(true);
    dispatch({ type: "loading" });

    try {
      const res = await fetch(`${BASE_URL}/cities/${id}`);
      const data = await res.json();
      // setCurrentCity(data);
      dispatch({ type: "city/loaded", payload: data });
    } catch (err) {
      dispatch({
        type: "rejected",
        payload: `Error while loading city! ${err}`,
      });
    } finally {
      // setIsLoading(false);
      dispatch({ type: "loaded" });
    }
  }

  async function createCity(newCity) {
    dispatch({ type: "loading" });
    try {
      const res = await fetch(`${BASE_URL}/cities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCity),
      });
      const data = await res.json();
      // setCities((cities) => [...cities, data]);
      dispatch({ type: "cities/created", payload: data });
    } catch (err) {
      // alert("Error: " + err);
      dispatch({ type: "rejected", payload: err });
    } finally {
      dispatch({ type: "loaded" });
    }
  }

  async function deleteCity(id) {
    // setIsLoading(true);
    dispatch({ type: "loading" });
    try {
      await fetch(`${BASE_URL}/cities/${id}`, {
        method: "DELETE",
      });
      // const data = await res.json();
      // setCities((cities) => cities.filter((city) => city.id !== id));
      dispatch({ type: "cities/deleted", payload: { id } });
    } catch (err) {
      dispatch({ type: "rejected", payload: err });
    } finally {
      // setIsLoading(false);
      dispatch({ type: "loaded" });
    }
  }
  return (
    <CitiesContext.Provider
      value={{
        cities,
        isLoading,
        currentCity,
        getCity,
        createCity,
        deleteCity,
      }}
    >
      {children}
    </CitiesContext.Provider>
  );
}

function useCities() {
  const context = useContext(CitiesContext);
  if (context === undefined) {
    throw new Error("useCities must be used within a CitiesProvider");
  }
  return context;
}
export { CitiesProvider, useCities };
