import React, { useState, useEffect } from 'react';
import { X, Calendar, Type, AlignLeft, BarChart2, CheckCircle2 } from 'lucide-react';

const TaskForm = ({ isOpen, onClose, onSubmit, initialTask }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'Pending',
    dueDate: ''
  });

  useEffect(() => {
    if (initialTask) {
      setFormData({
        title: initialTask.title,
        description: initialTask.description,
        status: initialTask.status,
        dueDate: initialTask.dueDate.split('T')[0]
      });
    } else {
      setFormData({
        title: '',
        description: '',
        status: 'Pending',
        dueDate: ''
      });
    }
  }, [initialTask, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-10 animate-in fade-in duration-300">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
        onClick={onClose}
      ></div>

      {/* Modal Card */}
      <div className="relative bg-white w-full max-w-lg rounded-[32px] p-8 sm:p-10 shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              {initialTask ? 'Edit Task' : 'New Task'}
            </h2>
            <p className="text-slate-400 font-medium mt-1">Specify your task details below</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-3 bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-2xl transition-all"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
              <Type size={14} /> Title
            </label>
            <input
              type="text"
              required
              className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-300 font-semibold"
              placeholder="E.g. Design Landing Page"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
              <AlignLeft size={14} /> Description
            </label>
            <textarea
              className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all h-32 placeholder:text-slate-300 font-medium leading-relaxed resize-none"
              placeholder="What needs to be done?"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            ></textarea>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                <BarChart2 size={14} /> Status
              </label>
              <select
                className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-white font-bold text-slate-700"
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                <Calendar size={14} /> Due Date
              </label>
              <input
                type="date"
                required
                className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-700"
                value={formData.dueDate}
                onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
              />
            </div>
          </div>

          <div className="pt-6 flex gap-4">
            <button
              type="submit"
              className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-5 rounded-[20px] shadow-lg shadow-indigo-100 transition-all transform active:scale-[0.98] flex items-center justify-center gap-3"
            >
              <CheckCircle2 size={20} />
              <span>{initialTask ? 'Save Changes' : 'Create Task'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
