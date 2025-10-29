import { useState, useEffect } from 'react'
import './App.css'

const API_KEY = import.meta.env.VITE_APP_API_KEY
const API_BASE = 'https://api.spoonacular.com/recipes'

function App() {
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [dietFilter, setDietFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch recipes on component mount
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setLoading(true);
        // Using complexSearch endpoint to get recipes with detailed info
        const response = await fetch(
          `${API_BASE}/complexSearch?apiKey=${API_KEY}&number=50&addRecipeInformation=true&fillIngredients=true`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch recipes');
        }
        
        const data = await response.json();
        setRecipes(data.results);
        setFilteredRecipes(data.results);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
        // Mock data for demo purposes if API fails
        const mockRecipes = generateMockRecipes();
        setRecipes(mockRecipes);
        setFilteredRecipes(mockRecipes);
      }
    };

    fetchRecipes();
  }, []);

  // Generate mock data for demo
  const generateMockRecipes = () => {
    const diets = ['vegetarian', 'vegan', 'gluten free', 'none'];
    const titles = [
      'Classic Margherita Pizza', 'Chicken Tikka Masala', 'Caesar Salad',
      'Beef Tacos', 'Mushroom Risotto', 'Grilled Salmon', 'Pasta Carbonara',
      'Thai Green Curry', 'Quinoa Buddha Bowl', 'Chocolate Chip Cookies',
      'Greek Moussaka', 'Sushi Rolls', 'French Onion Soup', 'BBQ Ribs',
      'Caprese Sandwich'
    ];
    
    return titles.map((title, i) => ({
      id: i + 1,
      title,
      readyInMinutes: Math.floor(Math.random() * 90) + 15,
      servings: Math.floor(Math.random() * 6) + 2,
      healthScore: Math.floor(Math.random() * 100),
      vegetarian: Math.random() > 0.5,
      vegan: Math.random() > 0.7,
      glutenFree: Math.random() > 0.6,
      image: `https://source.unsplash.com/400x300/?food,${title.replace(/\s+/g, '-')}`,
      pricePerServing: (Math.random() * 500 + 100).toFixed(0)
    }));
  };

  // Filter recipes based on search and diet filter
  useEffect(() => {
    let results = recipes;

    // Apply search filter
    if (searchQuery) {
      results = results.filter(recipe =>
        recipe.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply diet filter
    if (dietFilter !== 'all') {
      results = results.filter(recipe => {
        switch(dietFilter) {
          case 'vegetarian':
            return recipe.vegetarian;
          case 'vegan':
            return recipe.vegan;
          case 'gluten-free':
            return recipe.glutenFree;
          default:
            return true;
        }
      });
    }

    setFilteredRecipes(results);
  }, [searchQuery, dietFilter, recipes]);

  // Calculate summary statistics
  const calculateStats = () => {
    if (filteredRecipes.length === 0) return { avgTime: 0, avgHealth: 0, totalRecipes: 0 };
    
    const avgTime = Math.round(
      filteredRecipes.reduce((sum, r) => sum + r.readyInMinutes, 0) / filteredRecipes.length
    );
    
    const avgHealth = Math.round(
      filteredRecipes.reduce((sum, r) => sum + (r.healthScore || 0), 0) / filteredRecipes.length
    );
    
    return {
      avgTime,
      avgHealth,
      totalRecipes: filteredRecipes.length
    };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">👨‍🍳</div>
          <p className="text-xl">Loading delicious recipes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-5xl">👨‍🍳</span>
          <h1 className="text-4xl font-bold">Recipe Dashboard</h1>
        </div>
        <p className="text-gray-600 text-lg">Discover and explore delicious recipes from around the world</p>
        {error && (
          <div className="mt-4 p-3 bg-yellow-100 border border-yellow-400 rounded-lg">
            Demo mode: Using sample data. Add your Spoonacular API key to fetch real recipes.
          </div>
        )}
      </div>

      {/* Summary Statistics */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Recipes</p>
              <p className="text-3xl font-bold mt-1">{stats.totalRecipes}</p>
            </div>
            <span className="text-5xl">📊</span>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Avg Cooking Time</p>
              <p className="text-3xl font-bold mt-1">{stats.avgTime} min</p>
            </div>
            <span className="text-5xl">⏱️</span>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Avg Health Score</p>
              <p className="text-3xl font-bold mt-1">{stats.avgHealth}/100</p>
            </div>
            <span className="text-5xl">💚</span>
          </div>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="max-w-7xl mx-auto mb-6 bg-white rounded-lg shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search Bar */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-2xl">🔍</span>
            <input
              type="text"
              placeholder="Search recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Diet Filter */}
          <div>
            <select
              value={dietFilter}
              onChange={(e) => setDietFilter(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none bg-white"
            >
              <option value="all">All Diets</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="vegan">Vegan</option>
              <option value="gluten-free">Gluten Free</option>
            </select>
          </div>
        </div>
      </div>

      {/* Recipe List */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Recipe</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Cooking Time</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Servings</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Health Score</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Diet Tags</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRecipes.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      No recipes found. Try adjusting your search or filters.
                    </td>
                  </tr>
                ) : (
                  filteredRecipes.map((recipe) => (
                    <tr key={recipe.id} className="hover:bg-orange-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={recipe.image}
                            alt={recipe.title}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                          <span className="font-medium">{recipe.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span>⏱️</span>
                          <span>{recipe.readyInMinutes} min</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span>👥</span>
                          <span>{recipe.servings}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-gray-200 rounded-full h-2 max-w-[100px]">
                            <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${recipe.healthScore || 0}%` }}
                            />
                          </div>
                          <span className="text-sm">{recipe.healthScore || 0}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {recipe.vegetarian && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              Vegetarian
                            </span>
                          )}
                          {recipe.vegan && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                              Vegan
                            </span>
                          )}
                          {recipe.glutenFree && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              Gluten Free
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
