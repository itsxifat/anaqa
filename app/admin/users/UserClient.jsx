'use client';

import { toggleUserBan, toggleUserRole, deleteUser } from '@/app/actions';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, Shield, ShieldAlert, Ban, Trash2, CheckCircle2, 
  User as UserIcon, Mail, Phone, Loader2 
} from 'lucide-react';

export default function UserClient({ initialUsers }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    router.push(`/admin/users?q=${term}`);
  };

  const handleAction = async (action, id, param) => {
    setIsLoading(id);
    if (action === 'ban') await toggleUserBan(id, param);
    if (action === 'role') await toggleUserRole(id, param);
    if (action === 'delete') {
      if(confirm('Are you sure? This cannot be undone.')) await deleteUser(id);
    }
    setIsLoading(null);
    router.refresh();
  };

  // Stats Calculation
  const totalUsers = initialUsers.length;
  const admins = initialUsers.filter(u => u.role === 'admin').length;
  const banned = initialUsers.filter(u => u.isBanned).length;

  return (
    <div className="min-h-screen bg-gray-50 font-manrope pb-20">
      
      {/* HEADER & STATS */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-playfair font-bold text-gray-900">User Management</h1>
            <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Control Center</p>
          </div>
          <div className="flex gap-3">
            <StatCard label="Total Users" value={totalUsers} color="bg-black text-white" />
            <StatCard label="Admins" value={admins} color="bg-gold-500 text-white" />
            <StatCard label="Banned" value={banned} color="bg-red-50 text-red-600 border border-red-100" />
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            value={searchTerm}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50 transition-all"
          />
        </div>
      </div>

      {/* USERS LIST */}
      <div className="max-w-7xl mx-auto p-6 md:p-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-100 bg-gray-50/50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            <div className="col-span-4 pl-2">User Identity</div>
            <div className="col-span-3">Contact Info</div>
            <div className="col-span-2 text-center">Status</div>
            <div className="col-span-3 text-right pr-4">Actions</div>
          </div>

          {/* Rows */}
          {initialUsers.length === 0 ? (
            <div className="p-12 text-center text-gray-400 text-sm">No users found matching your search.</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {initialUsers.map((user) => (
                <div key={user._id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-gray-50/80 transition-colors group">
                  
                  {/* 1. Identity */}
                  <div className="col-span-4 flex items-center gap-4 pl-2">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold font-playfair overflow-hidden
                      ${user.image ? '' : 'bg-gray-100 text-gray-600'}`}
                    >
                      {user.image ? (
                        <img src={user.image} alt={user.name || 'User'} className="w-full h-full object-cover" />
                      ) : (
                        (user.name || 'U').charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                        {user.name || 'Unknown User'}
                        {user.role === 'admin' && <Shield size={12} className="text-gold-500 fill-gold-500"/>}
                      </h3>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide">
                        Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* 2. Contact */}
                  <div className="col-span-3 space-y-1">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Mail size={12} className="text-gray-400"/> {user.email || 'No Email'}
                    </div>
                    {user.phone && (
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Phone size={12} className="text-gray-400"/> {user.phone}
                      </div>
                    )}
                  </div>

                  {/* 3. Status Badges */}
                  <div className="col-span-2 flex justify-center gap-2">
                    {user.isBanned ? (
                      <span className="px-2 py-1 bg-red-100 text-red-700 text-[10px] font-bold uppercase rounded-md flex items-center gap-1">
                        <Ban size={10}/> Banned
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold uppercase rounded-md flex items-center gap-1">
                        <CheckCircle2 size={10}/> Active
                      </span>
                    )}
                    <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-md border ${user.role === 'admin' ? 'bg-black text-white border-black' : 'bg-white text-gray-500 border-gray-200'}`}>
                      {user.role}
                    </span>
                  </div>

                  {/* 4. Actions */}
                  <div className="col-span-3 flex justify-end gap-2 pr-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                    
                    {/* Role Toggle */}
                    <button 
                      onClick={() => handleAction('role', user._id, user.role)}
                      disabled={isLoading === user._id}
                      className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-black hover:text-white hover:border-black transition"
                      title={user.role === 'admin' ? "Demote to User" : "Promote to Admin"}
                    >
                      {isLoading === user._id ? <Loader2 size={16} className="animate-spin"/> : <ShieldAlert size={16}/>}
                    </button>

                    {/* Ban Toggle */}
                    <button 
                      onClick={() => handleAction('ban', user._id, user.isBanned)}
                      disabled={isLoading === user._id}
                      className={`p-2 rounded-lg border transition ${user.isBanned 
                        ? 'border-green-200 text-green-600 hover:bg-green-50' 
                        : 'border-gray-200 text-gray-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200'}`}
                      title={user.isBanned ? "Unban User" : "Ban User"}
                    >
                      <Ban size={16}/>
                    </button>

                    {/* Delete */}
                    <button 
                      onClick={() => handleAction('delete', user._id)}
                      disabled={isLoading === user._id}
                      className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition"
                      title="Delete User"
                    >
                      <Trash2 size={16}/>
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div className={`px-4 py-2 rounded-lg shadow-sm border border-transparent ${color}`}>
      <p className="text-[10px] uppercase opacity-70 tracking-wider">{label}</p>
      <p className="text-xl font-bold font-playfair">{value}</p>
    </div>
  );
}