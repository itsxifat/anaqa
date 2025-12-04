'use client';

import { createCategory, deleteCategory } from '@/app/actions';
import { useState } from 'react';
import { Plus, Trash2, Folder, FolderOpen, CornerDownRight } from 'lucide-react';

export default function CategoryClient({ categories }) {
  const [addingTo, setAddingTo] = useState(null); // ID of parent category we are adding to (null = root)

  async function handleCreate(formData) {
    await createCategory(formData);
    setAddingTo(null); // Close form
  }

  // Recursive Tree Renderer
  const renderTree = (nodes, depth = 0) => {
    return nodes.map((node) => (
      <div key={node._id} className="relative">
        <div 
          className="flex items-center gap-3 p-3 border-b border-gray-100 hover:bg-gray-50 group"
          style={{ paddingLeft: `${depth * 24 + 12}px` }}
        >
          {depth > 0 && <CornerDownRight size={14} className="text-gray-300" />}
          <Folder size={18} className="text-gold-500" />
          <span className="font-manrope font-bold text-sm text-gray-800">{node.name}</span>
          <span className="text-xs text-gray-400 font-mono">/{node.slug}</span>
          
          <div className="ml-auto flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={() => setAddingTo(node._id)} 
              className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100"
            >
              + Child
            </button>
            <button 
              onClick={() => deleteCategory(node._id)} 
              className="text-gray-400 hover:text-red-500"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
        
        {/* Render Children Recursively */}
        {node.children && node.children.length > 0 && (
          <div className="bg-gray-50/30">
            {renderTree(node.children, depth + 1)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-playfair font-bold">Category Manager</h2>
        <button 
          onClick={() => setAddingTo('root')} 
          className="bg-black text-white px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider hover:bg-gray-800"
        >
          + New Root Category
        </button>
      </div>

      {/* ADD FORM MODAL/INLINE */}
      {addingTo && (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gold-100 animate-in fade-in slide-in-from-top-4">
          <h3 className="text-sm font-bold uppercase mb-4 text-gray-500">
            {addingTo === 'root' ? 'Add Main Category' : 'Add Sub-Category'}
          </h3>
          <form action={handleCreate} className="flex gap-4">
            <input type="hidden" name="parentId" value={addingTo === 'root' ? '' : addingTo} />
            <input 
              name="name" 
              placeholder="Category Name (e.g. Summer Edit)" 
              className="flex-1 border p-2 rounded-lg outline-none focus:ring-2 ring-gold-500/50" 
              autoFocus 
              required 
            />
            <button className="bg-gold-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-gold-600">Save</button>
            <button type="button" onClick={() => setAddingTo(null)} className="text-gray-400 hover:text-black px-4">Cancel</button>
          </form>
        </div>
      )}

      {/* TREE LIST */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {categories.length > 0 ? renderTree(categories) : (
          <div className="p-12 text-center text-gray-400">No categories found. Start by creating one.</div>
        )}
      </div>
    </div>
  );
}