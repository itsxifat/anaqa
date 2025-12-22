'use client';

import { createCategory, deleteCategory } from '@/app/actions';
import { useState } from 'react';
import { Plus, Trash2, Folder, CornerDownRight, ImageIcon, X } from 'lucide-react';

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
          className="flex items-center gap-3 p-3 border-b border-gray-100 hover:bg-gray-50 group transition-colors"
          style={{ paddingLeft: `${depth * 24 + 12}px` }}
        >
          {depth > 0 && <CornerDownRight size={14} className="text-gray-300 flex-shrink-0" />}
          
          {/* Thumbnail or Folder Icon */}
          <div className="w-8 h-8 rounded bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
             {node.image ? (
               <img src={node.image} alt={node.name} className="w-full h-full object-cover" />
             ) : (
               <Folder size={16} className="text-gray-400" />
             )}
          </div>

          <div className="flex flex-col">
            <span className="font-manrope font-bold text-sm text-gray-800 leading-tight">{node.name}</span>
            <span className="text-[10px] text-gray-400 font-mono">/{node.slug}</span>
          </div>
          
          <div className="ml-auto flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={() => setAddingTo(node._id)} 
              className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 font-bold uppercase tracking-wider"
            >
              + Child
            </button>
            <button 
              onClick={() => deleteCategory(node._id)} 
              className="text-gray-400 hover:text-red-500 transition-colors p-1"
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
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-playfair font-bold">Category Manager</h2>
          <p className="text-gray-500 text-xs mt-1">Organize your store hierarchy</p>
        </div>
        <button 
          onClick={() => setAddingTo('root')} 
          className="bg-black text-white px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-gray-800 flex items-center gap-2 transition-all"
        >
          <Plus size={16} /> New Root Category
        </button>
      </div>

      {/* ADD FORM MODAL/INLINE */}
      {addingTo && (
        <div className="bg-white p-6 rounded-xl shadow-xl border border-gray-200 animate-in fade-in slide-in-from-top-4 relative">
          <button 
            onClick={() => setAddingTo(null)} 
            className="absolute top-4 right-4 text-gray-400 hover:text-black"
          >
            <X size={18} />
          </button>

          <h3 className="text-xs font-bold uppercase tracking-widest mb-4 text-gray-500 flex items-center gap-2">
            {addingTo === 'root' ? <Folder size={14}/> : <CornerDownRight size={14}/>}
            {addingTo === 'root' ? 'Add Main Category' : 'Add Sub-Category'}
          </h3>
          
          <form action={handleCreate} className="flex flex-col gap-4">
            <input type="hidden" name="parentId" value={addingTo === 'root' ? '' : addingTo} />
            
            <div className="flex gap-4 items-start">
                <div className="flex-1 space-y-2">
                    <label className="text-xs font-bold text-gray-700">Name</label>
                    <input 
                      name="name" 
                      placeholder="e.g. Summer Collection" 
                      className="w-full border border-gray-300 p-2.5 rounded-lg text-sm outline-none focus:ring-2 focus:ring-black/5" 
                      autoFocus 
                      required 
                    />
                </div>
                
                <div className="flex-1 space-y-2">
                    <label className="text-xs font-bold text-gray-700 flex items-center gap-2">
                        <ImageIcon size={12} /> Thumbnail Image (Optional)
                    </label>
                    <input 
                      type="file" 
                      name="image" 
                      accept="image/*"
                      className="w-full border border-gray-300 p-2 rounded-lg text-xs file:mr-4 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200" 
                    />
                </div>
            </div>

            <div className="flex justify-end pt-2">
               <button className="bg-black text-white px-8 py-2.5 rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors">
                 Save Category
               </button>
            </div>
          </form>
        </div>
      )}

      {/* TREE LIST */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header Row */}
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center text-[10px] font-bold uppercase tracking-widest text-gray-500">
           <span className="w-8 mr-3 text-center">Img</span>
           <span>Name</span>
        </div>

        {categories.length > 0 ? renderTree(categories) : (
          <div className="py-20 flex flex-col items-center justify-center text-gray-400">
            <Folder size={48} className="mb-4 text-gray-200" />
            <p>No categories found.</p>
            <button onClick={() => setAddingTo('root')} className="text-black text-sm font-bold underline mt-2">Create one now</button>
          </div>
        )}
      </div>
    </div>
  );
}