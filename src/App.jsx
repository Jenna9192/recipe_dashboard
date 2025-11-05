import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import './App.css'

const API_KEY = import.meta.env.VITE_APP_API_KEY || "";
const API_BASE = 'https://api.spoonacular.com/recipes'

// Sidebar Component
function Sidebar() {
  return (
    <div className="sidebar">
      <Link to="/" className="sidebar-header-link">
        <div className="sidebar-header">
          <span className="sidebar-icon">👨‍🍳</span>
          <h2 className="sidebar-title">Recipe Hub</h2>
        </div>
      </Link>
      
      <nav className="sidebar-nav">
        <Link to="/" className="sidebar-nav-link">
          📊 Dashboard
        </Link>
        <div className="sidebar-nav-disabled">
          🔍 Browse Recipes
        </div>
        <div className="sidebar-nav-disabled">
          📈 Analytics
        </div>
      </nav>
      
      <div className="sidebar-info">
        <p className="sidebar-info-text">
          Explore delicious recipes and discover cooking insights!
        </p>
      </div>
    </div>
  )
}

// Dashboard Component
function Dashboard({ recipes, loading, error }) {
  const [filteredRecipes, setFilteredRecipes] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [dietFilter, setDietFilter] = useState('all')

  useEffect(() => {
    let results = recipes

    if (searchQuery) {
      results = results.filter(recipe =>
        recipe.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (dietFilter !== 'all') {
      results = results.filter(recipe => {
        switch(dietFilter) {
          case 'vegetarian':
            return recipe.vegetarian
          case 'vegan':
            return recipe.vegan
          case 'gluten-free':
            return recipe.glutenFree
          default:
            return true
        }
      })
    }

    setFilteredRecipes(results)
  }, [searchQuery, dietFilter, recipes])

  const calculateStats = () => {
    if (filteredRecipes.length === 0) return { avgTime: 0, avgHealth: 0, totalRecipes: 0 }
    
    const avgTime = Math.round(
      filteredRecipes.reduce((sum, r) => sum + r.readyInMinutes, 0) / filteredRecipes.length
    )
    
    const avgHealth = Math.round(
      filteredRecipes.reduce((sum, r) => sum + (r.healthScore || 0), 0) / filteredRecipes.length
    )
    
    return {
      avgTime,
      avgHealth,
      totalRecipes: filteredRecipes.length
    }
  }

  const prepareTimeDistribution = () => {
    const ranges = [
      { name: '0-30 min', min: 0, max: 30, count: 0 },
      { name: '31-60 min', min: 31, max: 60, count: 0 },
      { name: '61-90 min', min: 61, max: 90, count: 0 },
      { name: '90+ min', min: 91, max: 999, count: 0 }
    ]
    
    filteredRecipes.forEach(recipe => {
      const time = recipe.readyInMinutes
      const range = ranges.find(r => time >= r.min && time <= r.max)
      if (range) range.count++
    })
    
    return ranges.map(({ name, count }) => ({ name, count }))
  }

  const prepareDietDistribution = () => {
    const data = [
      { name: 'Vegetarian', value: filteredRecipes.filter(r => r.vegetarian).length, color: '#22c55e' },
      { name: 'Vegan', value: filteredRecipes.filter(r => r.vegan).length, color: '#a855f7' },
      { name: 'Gluten Free', value: filteredRecipes.filter(r => r.glutenFree).length, color: '#3b82f6' },
      { name: 'Other', value: filteredRecipes.filter(r => !r.vegetarian && !r.vegan && !r.glutenFree).length, color: '#ef4444' }
    ]
    return data.filter(d => d.value > 0)
  }

  const stats = calculateStats()
  const timeData = prepareTimeDistribution()
  const dietData = prepareDietDistribution()

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="loading-icon">👨‍🍳</div>
          <p className="loading-text">Loading delicious recipes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="main-content">
      <div className="content-wrapper">
        <div className="page-header">
          <h1 className="page-title">Recipe Dashboard</h1>
          <p className="page-subtitle">Discover and explore delicious recipes from around the world</p>
          {error && (
            <div className="warning-banner">
              <strong>Warning:</strong> {error}
            </div>
          )}
        </div>

        {/* Summary Statistics */}
        <div className="stats-grid">
          <div className="stat-card stat-card-orange">
            <div className="stat-card-content">
              <div>
                <p className="stat-label">Total Recipes</p>
                <p className="stat-value">{stats.totalRecipes}</p>
              </div>
              <span className="stat-icon stat-icon-orange">📊</span>
            </div>
          </div>
          
          <div className="stat-card stat-card-blue">
            <div className="stat-card-content">
              <div>
                <p className="stat-label">Avg Cooking Time</p>
                <p className="stat-value">{stats.avgTime} min</p>
              </div>
              <span className="stat-icon stat-icon-blue">⏱️</span>
            </div>
          </div>
          
          <div className="stat-card stat-card-green">
            <div className="stat-card-content">
              <div>
                <p className="stat-label">Avg Health Score</p>
                <p className="stat-value">{stats.avgHealth}/100</p>
              </div>
              <span className="stat-icon stat-icon-green">💚</span>
            </div>
          </div>
        </div>

        {/* Data Visualizations - TWO UNIQUE CHARTS */}
        <div className="charts-grid">
          <div className="chart-card">
            <h3 className="chart-title">
              <span>📊</span> Cooking Time Distribution
            </h3>
            <p className="chart-description">
              Breakdown of recipes by preparation time range.
            </p>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={timeData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#374151" />
                <YAxis stroke="#374151" />
                <Tooltip 
                  cursor={{ fill: 'rgba(253, 230, 138, 0.5)' }} 
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '8px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px' }} />
                <Bar dataKey="count" fill="#f97316" name="Number of Recipes" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3 className="chart-title">
              <span>🥗</span> Diet Type Distribution
            </h3>
            <p className="chart-description">
              Percentage breakdown of recipes by key dietary tags.
            </p>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <Pie
                  data={dietData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  animationDuration={500}
                >
                  {dietData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#fff" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${value} recipes`, 'Count']}
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '8px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="filter-section">
          <div className="filter-grid">
            <div className="search-wrapper">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search recipes by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>

            <div>
              <select
                value={dietFilter}
                onChange={(e) => setDietFilter(e.target.value)}
                className="filter-select"
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
        <div className="table-container">
          <div className="table-scroll">
            <table className="recipe-table">
              <thead className="table-header">
                <tr>
                  <th>Recipe</th>
                  <th>Time</th>
                  <th>Servings</th>
                  <th>Health Score</th>
                  <th>Diet Tags</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {filteredRecipes.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="empty-state">
                      No recipes found. Try adjusting your search or filters.
                    </td>
                  </tr>
                ) : (
                  filteredRecipes.map((recipe) => (
                    <tr key={recipe.id}>
                      <td className="table-cell">
                        <Link to={`/recipe/${recipe.id}`} className="recipe-link">
                          <img
                            src={recipe.image}
                            alt={recipe.title}
                            className="recipe-image"
                          />
                          <span className="recipe-name">{recipe.title}</span>
                        </Link>
                      </td>
                      <td className="table-cell">
                        <div className="table-icon-text">
                          <span>⏱️</span>
                          <span>{recipe.readyInMinutes} min</span>
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="table-icon-text">
                          <span>👥</span>
                          <span>{recipe.servings}</span>
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="health-bar-container">
                          <div className="health-bar-bg">
                            <div
                              className="health-bar-fill"
                              style={{ 
                                width: `${recipe.healthScore || 0}%`,
                                backgroundColor: recipe.healthScore > 75 ? '#10b981' : recipe.healthScore > 40 ? '#f59e0b' : '#ef4444'
                              }}
                            />
                          </div>
                          <span className="health-bar-text">{recipe.healthScore || 0}</span>
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="diet-tags">
                          {recipe.vegetarian && (
                            <span className="diet-tag diet-tag-vegetarian">
                              Vegetarian
                            </span>
                          )}
                          {recipe.vegan && (
                            <span className="diet-tag diet-tag-vegan">
                              Vegan
                            </span>
                          )}
                          {recipe.glutenFree && (
                            <span className="diet-tag diet-tag-gluten-free">
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
  )
}

// Recipe Detail Component - Uses useParams() hook!
function RecipeDetail({ recipes }) {
  const { id } = useParams() // Extract the ID from URL
  const navigate = useNavigate()
  const recipe = recipes.find(r => r.id === parseInt(id))

  if (!recipe) {
    return (
      <div className="not-found-container">
        <div className="not-found-content">
          <div className="not-found-icon">❌</div>
          <p className="not-found-text">Recipe not found</p>
          <button
            onClick={() => navigate('/')}
            className="not-found-button"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="detail-container">
      <div className="detail-wrapper">
        <button
          onClick={() => navigate('/')}
          className="back-button"
        >
          <span>←</span> Back to Dashboard
        </button>

        <div className="detail-card">
          <img
            src={recipe.image}
            alt={recipe.title}
            className="detail-image"
          />
          <div className="detail-content">
            <h1 className="detail-title">{recipe.title}</h1>
            
            <div className="detail-tags">
              {recipe.vegetarian && (
                <span className="detail-tag detail-tag-vegetarian">
                  🌱 Vegetarian
                </span>
              )}
              {recipe.vegan && (
                <span className="detail-tag detail-tag-vegan">
                  🥬 Vegan
                </span>
              )}
              {recipe.glutenFree && (
                <span className="detail-tag detail-tag-gluten-free">
                  🌾 Gluten Free
                </span>
              )}
            </div>

            <div className="detail-stats-grid">
              <div className="detail-stat-box detail-stat-box-orange">
                <div className="detail-stat-icon">⏱️</div>
                <div className="detail-stat-value detail-stat-value-orange">{recipe.readyInMinutes}</div>
                <div className="detail-stat-label">Minutes</div>
              </div>
              
              <div className="detail-stat-box detail-stat-box-blue">
                <div className="detail-stat-icon">👥</div>
                <div className="detail-stat-value detail-stat-value-blue">{recipe.servings}</div>
                <div className="detail-stat-label">Servings</div>
              </div>
              
              <div className="detail-stat-box detail-stat-box-green">
                <div className="detail-stat-icon">💚</div>
                <div className="detail-stat-value detail-stat-value-green">{recipe.healthScore || 0}</div>
                <div className="detail-stat-label">Health Score</div>
              </div>
              
              <div className="detail-stat-box detail-stat-box-purple">
                <div className="detail-stat-icon">💰</div>
                <div className="detail-stat-value detail-stat-value-purple">${(recipe.pricePerServing / 100).toFixed(2)}</div>
                <div className="detail-stat-label">Per Serving</div>
              </div>
            </div>
          </div>
        </div>

        <div className="detail-info-grid">
          <div className="detail-info-card">
            <h2 className="detail-info-title">
              <span>📊</span> Nutritional Highlights
            </h2>
            <div className="detail-info-list">
              <div className="detail-info-item">
                <span className="detail-info-label">Health Score</span>
                <span className="detail-info-value detail-info-value-green">{recipe.healthScore || 0}/100</span>
              </div>
              <div className="detail-info-item">
                <span className="detail-info-label">Very Healthy</span>
                <span className={recipe.veryHealthy ? 'detail-info-value detail-info-value-green' : 'detail-info-value detail-info-value-red'}>
                  {recipe.veryHealthy ? '✓ Yes' : '✗ No'}
                </span>
              </div>
              <div className="detail-info-item">
                <span className="detail-info-label">Very Popular</span>
                <span className={recipe.veryPopular ? 'detail-info-value detail-info-value-green' : 'detail-info-value detail-info-value-red'}>
                  {recipe.veryPopular ? '✓ Yes' : '✗ No'}
                </span>
              </div>
            </div>
          </div>

          <div className="detail-info-card">
            <h2 className="detail-info-title">
              <span>ℹ️</span> Recipe Properties
            </h2>
            <div className="detail-info-list">
              <div className="detail-info-item">
                <span className="detail-info-label">Cheap to Make</span>
                <span className={recipe.cheap ? 'detail-info-value detail-info-value-green' : 'detail-info-value detail-info-value-red'}>
                  {recipe.cheap ? '✓ Yes' : '✗ No'}
                </span>
              </div>
              <div className="detail-info-item">
                <span className="detail-info-label">Dairy Free</span>
                <span className={recipe.dairyFree ? 'detail-info-value detail-info-value-green' : 'detail-info-value detail-info-value-red'}>
                  {recipe.dairyFree ? '✓ Yes' : '✗ No'}
                </span>
              </div>
              <div className="detail-info-item">
                <span className="detail-info-label">Sustainable</span>
                <span className={recipe.sustainable ? 'detail-info-value detail-info-value-green' : 'detail-info-value detail-info-value-red'}>
                  {recipe.sustainable ? '✓ Yes' : '✗ No'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="summary-box">
          <h3 className="summary-title">
            <span>💡</span> Recipe Summary
          </h3>
          <p className="summary-text">
            This delightful recipe is ready in just <strong>{recipe.readyInMinutes} minutes</strong> and is portioned to serve <strong>{recipe.servings} people</strong>. 
            {recipe.cheap && ' It\'s incredibly budget-friendly, making it a perfect choice for meal planning!'}
            {recipe.veryHealthy && ' Additionally, it boasts a high nutritional score, confirming it as a very healthy option!'}
          </p>
        </div>
      </div>
    </div>
  )
}

// Layout wrapper to include sidebar on all pages
function Layout({ recipes, loading, error }) {
  return (
    <div className="app-container">
      <Sidebar />
      <Routes>
        <Route path="/" element={<Dashboard recipes={recipes} loading={loading} error={error} />} />
        <Route path="/recipe/:id" element={<RecipeDetail recipes={recipes} />} />
      </Routes>
    </div>
  )
}

// Main App Component
function App() {
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchRecipes = async () => {
      // Check if API key is missing
      if (!API_KEY) {
        setError('No API key found. Using sample data.')
        setLoading(false)
        const mockRecipes = generateMockRecipes()
        setRecipes(mockRecipes)
        return
      }

      try {
        setLoading(true)
        const response = await fetch(
          `${API_BASE}/complexSearch?apiKey=${API_KEY}&number=50&addRecipeInformation=true`
        )
        
        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`)
        }
        
        const data = await response.json()
        
        // Check if we got valid results
        if (data.results && data.results.length > 0) {
          setRecipes(data.results)
          setError(null) // Clear any previous errors
        } else {
          throw new Error('No recipes found in API response')
        }
        setLoading(false)
      } catch (err) {
        console.error('API Error:', err)
        setError(`Demo mode: Using sample data. ${err.message}`)
        setLoading(false)
        const mockRecipes = generateMockRecipes()
        setRecipes(mockRecipes)
      }
    }

    fetchRecipes()
  }, [])

  const generateMockRecipes = () => {
    const titles = [
      'Classic Margherita Pizza', 'Chicken Tikka Masala', 'Caesar Salad',
      'Beef Tacos', 'Mushroom Risotto', 'Grilled Salmon', 'Pasta Carbonara',
      'Thai Green Curry', 'Quinoa Buddha Bowl', 'Chocolate Chip Cookies',
      'Greek Moussaka', 'Sushi Rolls', 'French Onion Soup', 'BBQ Ribs',
      'Caprese Sandwich'
    ]
    
    return titles.map((title, i) => ({
      id: i + 1,
      title,
      readyInMinutes: Math.floor(Math.random() * 90) + 15,
      servings: Math.floor(Math.random() * 6) + 2,
      healthScore: Math.floor(Math.random() * 100),
      vegetarian: Math.random() > 0.5,
      vegan: Math.random() > 0.7,
      glutenFree: Math.random() > 0.6,
      dairyFree: Math.random() > 0.6,
      veryHealthy: Math.random() > 0.7,
      cheap: Math.random() > 0.5,
      veryPopular: Math.random() > 0.6,
      sustainable: Math.random() > 0.7,
      image: `https://source.unsplash.com/400x300/?food,${title.replace(/\s+/g, '-')}`,
      pricePerServing: Math.floor(Math.random() * 500) + 100
    }))
  }

  return (
    <Router>
      <Layout recipes={recipes} loading={loading} error={error} />
    </Router>
  )
}

export default App