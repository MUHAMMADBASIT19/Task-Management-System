import React from 'react';
import { Calendar, Trash2, Edit3, MoreVertical, CheckCircle2, Circle, Clock } from 'lucide-react';
import { format } from 'date-fns';

const TaskCard = ({ task, onEdit, onDelete }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'Completed': 
        return { 
          color: 'bg-emerald-50 text-emerald-700 border-emerald-100', 
          icon: <CheckCircle2 size={14} className="text-emerald-500" /> 
        };
      case 'In Progress': 
        return { 
          color: 'bg-indigo-50 text-indigo-700 border-indigo-100', 
          icon: <Clock size={14} className="text-indigo-500" /> 
        };
      default: 
        return { 
          color: 'bg-slate-50 text-slate-600 border-slate-100', 
          icon: <Circle size={14} className="text-slate-400" /> 
        };
    }
  };

  const config = getStatusConfig(task.status);

  return (
    <div className="group bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[12px] font-bold border ${config.color}`}>
          {config.icon}
          {task.status}
        </div>
        
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button 
            onClick={() => onEdit(task)}
            className="p-2 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-indigo-600 transition-colors"
          >
            <Edit3 size={18} />
          </button>
          <button 
            onClick={() => onDelete(task._id)}
            className="p-2 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
      
      <h3 className="text-lg font-bold text-slate-800 mb-2 leading-tight group-hover:text-indigo-600 transition-colors">
        {task.title}
      </h3>
      <p className="text-slate-500 text-sm mb-6 line-clamp-2 font-medium leading-relaxed">
        {task.description}
      </p>
      
      <div className="flex items-center justify-between text-[12px] font-bold text-slate-400 mt-auto pt-5 border-t border-slate-50">
        <div className="flex items-center gap-2">
          <Calendar size={14} />
          <span>{format(new Date(task.dueDate), 'MMM dd, yyyy')}</span>
        </div>
        <div className="w-2 h-2 rounded-full bg-slate-100 group-hover:bg-indigo-200 transition-colors"></div>
      </div>
    </div>
  );
};

export default TaskCard;
