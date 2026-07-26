import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { ChefHat, Plus, Trash2, Save, Sparkles, AlertCircle, Search, UtensilsCrossed } from 'lucide-react';
import api from '../api/client';

export default function Recipes() {
  const [menuItems, setMenuItems] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [recipeIngredients, setRecipeIngredients] = useState([]);
  
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Recipe form state
  const [instructions, setInstructions] = useState('');
  const [yieldQty, setYieldQty] = useState(1);
  const [savingRecipe, setSavingRecipe] = useState(false);
  
  // Add ingredient state
  const [selectedIngId, setSelectedIngId] = useState('');
  const [ingQty, setIngQty] = useState('');
  const [addingIng, setAddingIng] = useState(false);

  async function loadData() {
    setLoading(true);
    try {
      const [miRes, ingRes, recRes, recIngRes] = await Promise.all([
        api.get('/menu-items'),
        api.get('/ingredients'),
        api.get('/recipes'),
        api.get('/recipe-ingredients'),
      ]);
      setMenuItems(miRes.data);
      setIngredients(ingRes.data);
      setRecipes(recRes.data);
      setRecipeIngredients(recIngRes.data);
    } catch (err) {
      toast.error('Failed to load recipe data');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const selectedRecipe = selectedItem ? recipes.find(r => r.menu_item_id === selectedItem.id) : null;
  const currentRecipeIngredients = selectedRecipe
    ? recipeIngredients.filter(ri => ri.recipe_id === selectedRecipe.id)
    : [];

  useEffect(() => {
    if (selectedRecipe) {
      setInstructions(selectedRecipe.instructions || '');
      setYieldQty(selectedRecipe.yield_qty || 1);
    } else {
      setInstructions('');
      setYieldQty(1);
    }
    // Clear add ingredient form
    setSelectedIngId('');
    setIngQty('');
  }, [selectedItem, selectedRecipe]);

  async function handleCreateRecipe() {
    if (!selectedItem) return;
    const toastId = toast.loading('Initializing recipe...');
    try {
      const { data } = await api.post('/recipes', {
        menu_item_id: selectedItem.id,
        instructions: '',
        yield_qty: 1
      });
      // Refresh recipes list
      const recRes = await api.get('/recipes');
      setRecipes(recRes.data);
      toast.success('Recipe created! Add ingredients below.', { id: toastId });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create recipe', { id: toastId });
    }
  }

  async function handleSaveRecipeDetails() {
    if (!selectedRecipe) return;
    setSavingRecipe(true);
    const toastId = toast.loading('Saving details...');
    try {
      await api.put(`/recipes/${selectedRecipe.id}`, {
        menu_item_id: selectedRecipe.menu_item_id,
        instructions,
        yield_qty: parseInt(yieldQty) || 1
      });
      // Refresh recipes list
      const recRes = await api.get('/recipes');
      setRecipes(recRes.data);
      toast.success('Recipe details updated', { id: toastId });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update recipe', { id: toastId });
    } finally {
      setSavingRecipe(false);
    }
  }

  async function handleAddIngredient(e) {
    e.preventDefault();
    if (!selectedRecipe || !selectedIngId || !ingQty) return;
    setAddingIng(true);
    const toastId = toast.loading('Adding ingredient...');
    try {
      await api.post('/recipe-ingredients', {
        recipe_id: selectedRecipe.id,
        ingredient_id: parseInt(selectedIngId),
        quantity: parseFloat(ingQty)
      });
      // Refresh recipe-ingredients
      const recIngRes = await api.get('/recipe-ingredients');
      setRecipeIngredients(recIngRes.data);
      setSelectedIngId('');
      setIngQty('');
      toast.success('Ingredient added to recipe', { id: toastId });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add ingredient', { id: toastId });
    } finally {
      setAddingIng(false);
    }
  }

  async function handleDeleteIngredient(id) {
    const toastId = toast.loading('Removing ingredient...');
    try {
      await api.delete(`/recipe-ingredients/${id}`);
      // Update local state
      setRecipeIngredients(prev => prev.filter(ri => ri.id !== id));
      toast.success('Removed', { id: toastId });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to remove', { id: toastId });
    }
  }

  const filteredMenuItems = menuItems.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <ChefHat className="text-brand-600" size={22} />
        <h2 className="text-xl font-bold">Recipe Management</h2>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="skeleton h-96 rounded-2xl" />
          <div className="lg:col-span-2 skeleton h-96 rounded-2xl" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Menu Items List */}
          <div className="card h-[calc(100vh-12rem)] flex flex-col min-h-[400px]">
            <h3 className="font-semibold mb-3">Menu Items</h3>
            <div className="relative mb-3">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                className="input pl-8 py-1.5 text-sm"
                placeholder="Search menu items..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex-1 overflow-y-auto space-y-1 pr-1">
              {filteredMenuItems.map(item => {
                const hasRecipe = recipes.some(r => r.menu_item_id === item.id);
                const isSelected = selectedItem?.id === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                      isSelected
                        ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-glow-md'
                        : 'hover:bg-brand-50 text-gray-700'
                    }`}
                  >
                    <span className="truncate pr-2">{item.name}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      {hasRecipe && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-brand-100 text-brand-700'
                        }`}>
                          Recipe
                        </span>
                      )}
                      <span className={isSelected ? 'text-white' : 'text-gray-400'}>₹{item.price}</span>
                    </div>
                  </button>
                );
              })}
              {!filteredMenuItems.length && (
                <p className="text-gray-400 text-sm text-center py-8">No menu items found</p>
              )}
            </div>
          </div>

          {/* Recipe Editor Column */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {selectedItem ? (
                <motion.div
                  key={selectedItem.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  {/* Selected Item Card Header */}
                  <div className="card bg-gradient-to-r from-orange-500/10 to-amber-500/10 border-orange-200/50">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-amber-400 flex items-center justify-center text-white shadow-glow-lg">
                        <UtensilsCrossed size={22} />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-gray-800">{selectedItem.name}</h3>
                        <p className="text-xs text-gray-500">
                          Base Cost: ₹{selectedItem.cost_price || 0} · Sale Price: ₹{selectedItem.price} · Prep: {selectedItem.avg_prep_time_minutes} min
                        </p>
                      </div>
                    </div>
                  </div>

                  {selectedRecipe ? (
                    <div className="space-y-6">
                      {/* Recipe details */}
                      <div className="card space-y-4">
                        <h4 className="font-semibold text-gray-800 flex items-center gap-1.5">
                          <Sparkles size={16} className="text-brand-500" /> Instructions & Output
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="md:col-span-2">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Cooking Instructions</label>
                            <textarea
                              className="input mt-1 h-24 resize-none"
                              placeholder="Step-by-step cooking guide..."
                              value={instructions}
                              onChange={e => setInstructions(e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Yield Quantity</label>
                            <input
                              type="number"
                              className="input mt-1"
                              placeholder="Portions (e.g. 1)"
                              value={yieldQty}
                              onChange={e => setYieldQty(e.target.value)}
                              min="1"
                            />
                            <div className="mt-4 flex justify-end">
                              <button
                                onClick={handleSaveRecipeDetails}
                                disabled={savingRecipe}
                                className="btn-primary w-full text-xs py-2"
                              >
                                <Save size={14} /> Save Recipe Details
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Recipe Ingredients */}
                      <div className="card space-y-4">
                        <h4 className="font-semibold text-gray-800">Ingredients Formulation</h4>
                        
                        {/* Current ingredients list */}
                        <div className="overflow-x-auto">
                          <table className="data-table w-full">
                            <thead>
                              <tr>
                                <th>Ingredient</th>
                                <th>Quantity Required</th>
                                <th>Unit Cost</th>
                                <th>Subtotal</th>
                                <th></th>
                              </tr>
                            </thead>
                            <tbody>
                              {currentRecipeIngredients.map((ri) => {
                                const matchedIng = ingredients.find(i => i.id === ri.ingredient_id);
                                const ingCost = matchedIng ? parseFloat(matchedIng.unit_cost) : 0;
                                const lineCost = ingCost * parseFloat(ri.quantity);
                                return (
                                  <tr key={ri.id}>
                                    <td className="font-medium text-gray-700">
                                      {ri.ing_ingredient_id_name || matchedIng?.name || '—'}
                                    </td>
                                    <td>
                                      {ri.quantity} {ri.ing_ingredient_id_unit || matchedIng?.unit || ''}
                                    </td>
                                    <td>₹{ingCost.toFixed(2)}</td>
                                    <td className="font-semibold">₹{lineCost.toFixed(2)}</td>
                                    <td>
                                      <button
                                        onClick={() => handleDeleteIngredient(ri.id)}
                                        className="btn-icon text-gray-400 hover:text-red-600 hover:bg-red-50"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                              {!currentRecipeIngredients.length && (
                                <tr>
                                  <td colSpan={5} className="text-gray-400 text-center py-6">
                                    No ingredients assigned to this recipe yet.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>

                        {/* Add ingredient form */}
                        <form onSubmit={handleAddIngredient} className="border-t border-gray-100 pt-4 flex flex-col sm:flex-row gap-3">
                          <div className="flex-1">
                            <select
                              className="select text-sm"
                              value={selectedIngId}
                              onChange={e => setSelectedIngId(e.target.value)}
                              required
                            >
                              <option value="">Choose ingredient...</option>
                              {ingredients.map(ing => (
                                <option key={ing.id} value={ing.id}>
                                  {ing.name} ({ing.unit}) — ₹{parseFloat(ing.unit_cost).toFixed(2)}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="w-full sm:w-32">
                            <input
                              type="number"
                              step="any"
                              className="input"
                              placeholder="Qty"
                              value={ingQty}
                              onChange={e => setIngQty(e.target.value)}
                              required
                              min="0.001"
                            />
                          </div>
                          <button
                            type="submit"
                            disabled={addingIng}
                            className="btn-primary justify-center shrink-0"
                          >
                            <Plus size={16} /> Mix Ingredient
                          </button>
                        </form>
                      </div>
                    </div>
                  ) : (
                    <div className="card flex flex-col items-center text-center py-16 space-y-4">
                      <div className="w-16 h-16 rounded-3xl bg-brand-50 flex items-center justify-center text-brand-600 animate-float">
                        <ChefHat size={32} />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800 text-lg">No Recipe Initialized</h4>
                        <p className="text-gray-400 text-sm max-w-sm mt-1">
                          This menu item does not have a recipe configuration yet. Create one to compile instructions and track component ingredients.
                        </p>
                      </div>
                      <button onClick={handleCreateRecipe} className="btn-primary">
                        <Plus size={16} /> Create Recipe
                      </button>
                    </div>
                  )}
                </motion.div>
              ) : (
                <div className="card flex flex-col items-center justify-center text-center py-32 space-y-4 h-full border border-dashed border-gray-200">
                  <div className="w-16 h-16 rounded-full bg-gray-100/80 flex items-center justify-center text-gray-400">
                    <ChefHat size={28} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-700">Select a Menu Item</h4>
                    <p className="text-gray-400 text-xs mt-1 max-w-xs">
                      Choose a menu item from the catalog on the left to review or edit its recipe formula and step-by-step instructions.
                    </p>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
