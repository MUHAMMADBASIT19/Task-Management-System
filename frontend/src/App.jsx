import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, LayoutDashboard, CheckSquare, Clock, AlertCircle, LogOut, User as UserIcon } from 'lucide-react';
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
    <div className="min-h-screen bg-[#f8fafc] pb-20">
      {/* Header & Dashboard */}
      <nav className="glass sticky top-0 z-40 px-6 py-4 mb-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center justify-between w-full md:w-auto">
            <div className="flex items-center gap-3">
              <div className="bg-primary-600 p-2 rounded-xl text-white">
                <LayoutDashboard size={24} />
              </div>
              <h1 className="text-2xl font-bold text-gray-800 tracking-tight">TaskFlow</h1>
            </div>
            
            <div className="flex md:hidden items-center gap-4">
              <button 
                onClick={handleLogout}
                className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-grow md:flex-grow-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text"
                placeholder="Search tasks..."
                className="pl-10 pr-4 py-2 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none w-full md:w-64 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={() => { setEditingTask(null); setIsFormOpen(true); }}
              className="bg-primary-600 hover:bg-primary-700 text-white p-2 md:px-4 md:py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-primary-200 transition-all font-semibold"
            >
              <Plus size={20} />
              <span className="hidden md:inline">New Task</span>
            </button>
            
            <div className="hidden md:flex items-center gap-4 pl-4 border-l border-gray-200">
              <div className="flex items-center gap-2 text-gray-700 font-medium">
                <div className="bg-gray-100 p-2 rounded-full"><UserIcon size={18} /></div>
                <span className="max-w-[100px] truncate">{user.name}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="glass p-6 rounded-3xl flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-2xl text-blue-600"><Clock size={24} /></div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            </div>
          </div>
          <div className="glass p-6 rounded-3xl flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-2xl text-green-600"><CheckSquare size={24} /></div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Completed</p>
              <p className="text-2xl font-bold text-gray-800">{stats.completed}</p>
            </div>
          </div>
          <div className="glass p-6 rounded-3xl">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-gray-500 font-medium">Overall Progress</p>
              <span className="text-primary-600 font-bold">{stats.progress}%</span>
            </div>
            <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
              <div 
                className="bg-primary-600 h-full transition-all duration-1000 ease-out" 
                style={{ width: `${stats.progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
            {['All', 'Pending', 'In Progress', 'Completed'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                  filterStatus === status 
                  ? 'bg-gray-800 text-white shadow-lg' 
                  : 'bg-white text-gray-500 hover:bg-gray-50'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Task Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredTasks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
          <div className="glass rounded-3xl p-20 flex flex-col items-center text-center">
            <div className="bg-gray-100 p-6 rounded-full text-gray-400 mb-4">
              <AlertCircle size={48} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No tasks found</h3>
            <p className="text-gray-500 max-w-sm">
              {searchTerm 
                ? `We couldn't find anything matching "${searchTerm}"` 
                : "Get started by creating your first task using the button above."}
            </p>
          </div>
        )}
      </main>

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
