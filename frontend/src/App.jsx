import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, LayoutDashboard, CheckSquare, Clock, AlertCircle, LogOut, User as UserIcon, Filter, Layers, Target } from 'lucide-react';
import { getTasks, createTask, updateTask, deleteTask } from './services/api';
import TaskCard from './components/TaskCard';
import TaskForm from './components/TaskForm';
import Auth from './components/Auth';

function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  const fetchTasks = async () => {
    try {
      const { data } = await getTasks();
      setTasks(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      if (error.response?.status === 401) {
        handleLogout();
      }
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setTasks([]);
  };

  const handleCreateOrUpdate = async (formData) => {
    try {
      if (editingTask) {
        await updateTask(editingTask._id, formData);
      } else {
        await createTask(formData);
      }
      fetchTasks();
      setIsFormOpen(false);
      setEditingTask(null);
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(id);
        fetchTasks();
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           task.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'All' || task.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [tasks, searchTerm, filterStatus]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'Completed').length;
    const progress = total === 0 ? 0 : Math.round((completed / total) * 100);
    return { total, completed, progress };
  }, [tasks]);

  if (!user) {
    return <Auth onAuthSuccess={(userData) => setUser(userData)} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-0 md:p-10 page-fade">
      {/* The Application Block */}
      <div className="bg-white w-full max-w-7xl min-h-[90vh] md:rounded-[40px] shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        
        {/* Header Block Internal */}
        <header className="bg-white border-b border-slate-100 px-8 py-6 z-50">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2.5 rounded-[16px] text-white shadow-lg shadow-indigo-100">
                <Target size={22} />
              </div>
              <h1 className="text-xl font-black text-slate-800 tracking-tighter uppercase">TaskFlow Workspace</h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 pr-4 border-r border-slate-100">
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-indigo-600 border border-slate-100 font-black">
                  {user.name.charAt(0)}
                </div>
                <div className="hidden sm:block">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Active Intern</p>
                  <p className="text-sm font-bold text-slate-700 leading-tight">{user.name}</p>
                </div>
              </div>

              <button 
                onClick={handleLogout}
                className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                title="Logout"
              >
                <LogOut size={22} />
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Content Internal */}
        <div className="flex-grow overflow-y-auto p-8 sm:p-12">
          {/* Dashboard Stats */}
          <div className="flex flex-col lg:flex-row gap-6 mb-12">
            <div className="flex-[2]">
              <h2 className="text-4xl font-black text-slate-800 tracking-tight leading-tight">
                Good to see you, <span className="text-indigo-600">{user.name.split(' ')[0]}</span>.
              </h2>
              <p className="text-slate-400 font-bold mt-2 text-lg">You have <span className="text-slate-800">{tasks.length - stats.completed} pending tasks</span> for today.</p>
            </div>

            <div className="flex-[1.5] grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-5 rounded-[24px] border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Success Rate</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-black text-slate-800">{stats.progress}%</p>
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                </div>
              </div>
              <div className="bg-slate-800 p-5 rounded-[24px] text-white flex flex-col justify-between">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Done</p>
                <p className="text-3xl font-black">{stats.completed}</p>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-10 pb-10 border-b border-slate-50">
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="relative flex-grow md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="text"
                  placeholder="Filter tasks by title..."
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none transition-all font-bold text-sm shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="relative">
                <select
                  className="appearance-none pl-4 pr-10 py-4 bg-white border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none transition-all font-bold text-sm text-slate-600 cursor-pointer shadow-sm"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
                <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={16} />
              </div>
            </div>

            <button 
              onClick={() => { setEditingTask(null); setIsFormOpen(true); }}
              className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-xl shadow-indigo-100 transition-all transform hover:-translate-y-1 active:scale-95"
            >
              <Plus size={20} />
              <span>Add New Task</span>
            </button>
          </div>

          {/* Task Grid */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredTasks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredTasks.map(task => (
                <TaskCard 
                  key={task._id} 
                  task={task} 
                  onEdit={(task) => { setEditingTask(task); setIsFormOpen(true); }}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          ) : (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[32px] p-20 flex flex-col items-center">
              <div className="bg-white p-6 rounded-full text-slate-200 shadow-sm mb-6">
                <AlertCircle size={48} />
              </div>
              <h3 className="text-xl font-black text-slate-800">Your list is clear</h3>
              <p className="text-slate-400 font-bold mt-2">Create your first task to see it here.</p>
            </div>
          )}
        </div>
        
        {/* Footer Block Internal */}
        <footer className="bg-white border-t border-slate-50 py-6 px-12 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
            &copy; 2026 Developed by Intern for TaskFlow Workspace.
          </p>
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-1.5">
               <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Systems Active</span>
             </div>
          </div>
        </footer>
      </div>

      <TaskForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        onSubmit={handleCreateOrUpdate}
        initialTask={editingTask}
      />
    </div>
  );
}

export default App;
