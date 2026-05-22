import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  LayoutDashboard, 
  CheckSquare, 
  Clock, 
  AlertCircle, 
  LogOut, 
  Filter, 
  Target, 
  Bell, 
  Moon, 
  Sun, 
  Users, 
  Layers, 
  Sparkles,
  Volume2,
  X
} from 'lucide-react';
import { io } from 'socket.io-client';
import { 
  getTasks, 
  getSharedTasks, 
  createTask, 
  updateTask, 
  deleteTask,
  getNotifications,
  markNotificationAsRead
} from './services/api';
import TaskCard from './components/TaskCard';
import TaskForm from './components/TaskForm';
import Auth from './components/Auth';
import AnalyticsDashboard from './components/AnalyticsDashboard';

function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  
  // Navigation / Tabs State
  const [activeTab, setActiveTab] = useState('tasks'); // 'tasks', 'shared', 'analytics'
  
  // Notifications State
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Dark Mode State
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');

  // Socket.IO Client instance
  const [socket, setSocket] = useState(null);

  // Initialize Dark Mode Class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Socket.IO Setup
  useEffect(() => {
    if (user) {
      fetchTasksData();
      fetchNotificationsData();

      // Establish Socket connection
      const socketUrl = 'http://localhost:5000';
      const newSocket = io(socketUrl, {
        auth: {
          token: user.token
        }
      });

      newSocket.on('connect', () => {
        console.log('⚡ Socket.IO connection established securely.');
      });

      newSocket.on('notification', (newNotification) => {
        setNotifications(prev => [newNotification, ...prev]);
        triggerToast(newNotification.message);
        
        // Refresh appropriate tasks tab in real time!
        fetchTasksData();
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [user, activeTab]);

  const toggleDarkMode = () => {
    const nextMode = !darkMode;
    setDarkMode(nextMode);
    localStorage.setItem('darkMode', String(nextMode));
  };

  const fetchTasksData = async () => {
    try {
      setLoading(true);
      const { data } = activeTab === 'shared' ? await getSharedTasks() : await getTasks();
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

  const fetchNotificationsData = async () => {
    try {
      const { data } = await getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const handleLogout = () => {
    if (socket) socket.close();
    localStorage.removeItem('user');
    setUser(null);
    setTasks([]);
    setNotifications([]);
  };

  const handleCreateOrUpdate = async (formData) => {
    try {
      if (editingTask) {
        await updateTask(editingTask._id, formData);
      } else {
        await createTask(formData);
      }
      fetchTasksData();
      setIsFormOpen(false);
      setEditingTask(null);
    } catch (error) {
      console.error('Error saving task:', error);
      alert(error.response?.data?.message || 'Failed to save task.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(id);
        fetchTasksData();
      } catch (error) {
        console.error('Error deleting task:', error);
        alert(error.response?.data?.message || 'Failed to delete task.');
      }
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications(prev => 
        prev.map(notif => notif._id === id ? { ...notif, read: true } : notif)
      );
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const triggerToast = (msg) => {
    setToastMessage(msg);
    // Play a subtle notification pop sound (using standard Web Audio API for maximum compatibility!)
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5 note
      osc.frequency.setValueAtTime(880.00, ctx.currentTime + 0.08); // A5 note
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch (e) {
      // AudioContext fails silently if browser policy blocks it, which is normal
    }

    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
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

  const unreadCount = useMemo(() => {
    return notifications.filter(notif => !notif.read).length;
  }, [notifications]);

  if (!user) {
    return <Auth onAuthSuccess={(userData) => setUser(userData)} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-0 md:p-8 transition-colors duration-300 relative overflow-hidden">
      {/* Toast Alert Box */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-[200] max-w-sm bg-white dark:bg-slate-800 border-l-4 border-indigo-600 rounded-2xl shadow-2xl p-4 flex items-center gap-3 border border-slate-100 dark:border-slate-700 animate-slideIn">
          <div className="bg-indigo-50 dark:bg-indigo-950/40 p-2 rounded-xl text-indigo-600 dark:text-indigo-400">
            <Bell size={20} className="animate-bounce" />
          </div>
          <div className="flex-1 pr-4">
            <h4 className="text-xs font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-wider">New Notification</h4>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200 leading-tight mt-0.5">{toastMessage}</p>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X size={16} />
          </button>
        </div>
      )}

      {/* The Application container block */}
      <div className="bg-white dark:bg-slate-900 w-full max-w-7xl min-h-[92vh] md:rounded-[40px] shadow-2xl flex flex-col overflow-hidden border border-slate-200/60 dark:border-slate-800/80 transition-colors duration-300">
        
        {/* Header Block */}
        <header className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-6 sm:px-8 py-5 z-40 transition-colors duration-300">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2.5 rounded-[16px] text-white shadow-lg shadow-indigo-100 dark:shadow-none">
                <Target size={22} className="animate-spin-slow" />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-800 dark:text-white tracking-tighter uppercase flex items-center gap-1.5">
                  TaskFlow
                  <span className="text-[9px] font-black bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900 px-1.5 py-0.5 rounded uppercase">PRO</span>
                </h1>
              </div>
            </div>

            {/* Middle Nav Tabs */}
            <nav className="flex items-center bg-slate-50 dark:bg-slate-800/60 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-800">
              <button 
                onClick={() => setActiveTab('tasks')}
                className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 flex items-center gap-2 cursor-pointer ${activeTab === 'tasks' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
              >
                My Workspace
              </button>
              <button 
                onClick={() => setActiveTab('shared')}
                className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 flex items-center gap-2 cursor-pointer ${activeTab === 'shared' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
              >
                <Users size={12} />
                Shared
              </button>
              <button 
                onClick={() => setActiveTab('analytics')}
                className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 flex items-center gap-2 cursor-pointer ${activeTab === 'analytics' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
              >
                Analytics
              </button>
            </nav>

            {/* Profile & Controls */}
            <div className="flex items-center gap-4">
              {/* Dark Mode toggle */}
              <button 
                onClick={toggleDarkMode}
                className="p-3 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-2xl transition-all cursor-pointer"
                title="Toggle Theme"
              >
                {darkMode ? <Sun size={20} className="text-amber-500 animate-spin-slow" /> : <Moon size={20} />}
              </button>

              {/* Notification dropdown trigger */}
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`p-3 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-2xl transition-all relative cursor-pointer ${showNotifications ? 'bg-indigo-50 dark:bg-slate-800 text-indigo-600' : ''}`}
                  title="Notifications"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[9px] font-black border border-white dark:border-slate-900 animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications dropdown popover */}
                {showNotifications && (
                  <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-800 rounded-[24px] border border-slate-100 dark:border-slate-700 shadow-2xl p-4 z-50 animate-slideDown overflow-hidden">
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-50 dark:border-slate-700">
                      <span className="text-sm font-black text-slate-700 dark:text-slate-200">Notifications</span>
                      <button onClick={() => setShowNotifications(false)} className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
                        Close
                      </button>
                    </div>
                    
                    <div className="max-h-[260px] overflow-y-auto space-y-2 scrollbar-thin">
                      {notifications.length > 0 ? (
                        notifications.map((notif) => (
                          <div 
                            key={notif._id} 
                            onClick={() => handleMarkAsRead(notif._id)}
                            className={`p-3 rounded-xl text-xs flex flex-col gap-1 transition-all border cursor-pointer ${notif.read ? 'bg-slate-50/50 dark:bg-slate-700/20 border-slate-50 dark:border-slate-700/40 text-slate-400' : 'bg-indigo-50/30 dark:bg-indigo-950/20 border-indigo-100/40 dark:border-indigo-900/30 text-slate-700 dark:text-slate-200 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30'}`}
                          >
                            <div className="flex justify-between items-start gap-1">
                              <span className="font-bold leading-normal">{notif.message}</span>
                              {!notif.read && <span className="w-2 h-2 bg-indigo-600 rounded-full mt-1 shrink-0"></span>}
                            </div>
                            <span className="text-[9px] text-slate-400 font-medium">
                              {new Date(notif.createdAt).toLocaleDateString()} at {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6 text-slate-400 font-semibold">
                          <p>All caught up! 🎉</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Profile info */}
              <div className="flex items-center gap-3 pr-4 border-r border-slate-100 dark:border-slate-800">
                <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30 font-black shadow-inner">
                  {user.name.charAt(0)}
                </div>
                <div className="hidden sm:block">
                  <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">Collaborator</p>
                  <p className="text-xs font-black text-slate-700 dark:text-slate-200 mt-1">{user.name}</p>
                </div>
              </div>

              {/* Logout Button */}
              <button 
                onClick={handleLogout}
                className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-2xl transition-all cursor-pointer"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-grow overflow-y-auto p-6 sm:p-10 bg-slate-50/50 dark:bg-slate-900/50 transition-colors duration-300">
          
          {activeTab === 'analytics' ? (
            <AnalyticsDashboard />
          ) : (
            <>
              {/* Main Greeting Block */}
              <div className="flex flex-col lg:flex-row gap-6 mb-10">
                <div className="flex-[2]">
                  <h2 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight leading-tight flex items-center gap-2">
                    Good to see you, <span className="text-indigo-600 dark:text-indigo-400">{user.name.split(' ')[0]}</span>.
                    <Sparkles className="text-amber-500" size={24} />
                  </h2>
                  <p className="text-slate-400 dark:text-slate-500 font-bold mt-2 text-lg">
                    {activeTab === 'shared' ? (
                      <>You have <span className="text-slate-700 dark:text-slate-300">{tasks.length} shared tasks</span> from your team.</>
                    ) : (
                      <>You have <span className="text-slate-700 dark:text-slate-300">{tasks.length - stats.completed} pending tasks</span> in your workspace.</>
                    )}
                  </p>
                </div>

                <div className="flex-[1.5] grid grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-slate-800 p-5 rounded-[24px] border border-slate-100 dark:border-slate-700/80 shadow-sm flex flex-col justify-between">
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Success Rate</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl font-black text-slate-800 dark:text-white">{stats.progress}%</p>
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    </div>
                  </div>
                  <div className="bg-slate-800 dark:bg-slate-700 p-5 rounded-[24px] text-white flex flex-col justify-between shadow-lg">
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest">Total Done</p>
                    <p className="text-3xl font-black">{stats.completed}</p>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 pb-8 border-b border-slate-100 dark:border-slate-800">
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                  <div className="relative flex-grow md:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600" size={18} />
                    <input 
                      type="text"
                      placeholder="Filter tasks by title..."
                      className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none transition-all font-bold text-sm text-slate-700 dark:text-slate-200 shadow-sm"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <div className="relative">
                    <select
                      className="appearance-none pl-4 pr-10 py-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none transition-all font-bold text-sm text-slate-600 dark:text-slate-300 cursor-pointer shadow-sm"
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <option value="All">All Statuses</option>
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                    <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 pointer-events-none" size={16} />
                  </div>
                </div>

                {activeTab === 'tasks' && (
                  <button 
                    onClick={() => { setEditingTask(null); setIsFormOpen(true); }}
                    className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-xl shadow-indigo-100 dark:shadow-none transition-all transform hover:-translate-y-1 active:scale-95 cursor-pointer"
                  >
                    <Plus size={20} />
                    <span>Add New Task</span>
                  </button>
                )}
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
                      onRefresh={fetchTasksData}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 rounded-[32px] p-16 flex flex-col items-center shadow-sm">
                  <div className="bg-slate-50 dark:bg-slate-700 p-6 rounded-full text-slate-200 dark:text-slate-600 shadow-sm mb-6">
                    <AlertCircle size={48} />
                  </div>
                  <h3 className="text-xl font-black text-slate-800 dark:text-white">Your list is clear</h3>
                  <p className="text-slate-400 dark:text-slate-500 font-semibold mt-2">
                    {activeTab === 'shared' ? 'No tasks have been shared with you yet.' : 'Create your first task to see it here.'}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
        
        {/* Footer Block */}
        <footer className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 py-5 px-8 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4 transition-colors duration-300">
          <p className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.2em]">
            &copy; 2026 TaskFlow Workspace. Crafted Professional Edition.
          </p>
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-1.5">
               <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
               <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Real-time Sync Active</span>
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
