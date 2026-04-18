import React from 'react';
import { Calendar, CheckCircle, Clock, Trash2, Edit3 } from 'lucide-react';
import { format } from 'date-fns';

const TaskCard = ({ task, onEdit, onDelete }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'In Progress': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-amber-100 text-amber-700 border-amber-200';
    }
  };

  return (
    <div className="glass group rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <div className="flex justify-between items-start mb-4">
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(task.status)}`}>
          {task.status}
        </span>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={() => onEdit(task)}
            className="p-2 rounded-lg hover:bg-primary-100 text-primary-600 transition-colors"
          >
            <Edit3 size={18} />
          </button>
          <button 
            onClick={() => onDelete(task._id)}
            className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
      
      <h3 className="text-xl font-bold text-gray-800 mb-2 truncate">{task.title}</h3>
      <p className="text-gray-600 text-sm mb-6 line-clamp-2 h-10">{task.description}</p>
      
      <div className="flex items-center text-gray-400 text-xs font-medium">
        <Calendar size={14} className="mr-2" />
        <span>Due: {format(new Date(task.dueDate), 'MMM dd, yyyy')}</span>
      </div>
    </div>
  );
};

export default TaskCard;
