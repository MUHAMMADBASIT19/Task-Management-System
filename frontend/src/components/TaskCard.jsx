import React, { useState } from 'react';
import { 
  Calendar, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Share2, 
  Paperclip, 
  Users, 
  FileText, 
  Image as ImageIcon, 
  File, 
  X, 
  UploadCloud,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { shareTask, uploadAttachment, deleteAttachment } from '../services/api';

const TaskCard = ({ task, onEdit, onDelete, onRefresh }) => {
  const currentUser = JSON.parse(localStorage.getItem('user'));
  const isOwner = task.owner?._id === currentUser?._id || task.owner === currentUser?._id;
  
  const [isSharing, setIsSharing] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [shareLoading, setShareLoading] = useState(false);
  const [shareError, setShareError] = useState('');
  const [shareSuccess, setShareSuccess] = useState('');

  const [uploadLoading, setUploadLoading] = useState(false);

  const getStatusConfig = (status) => {
    switch (status) {
      case 'Completed': 
        return { 
          color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30', 
          icon: <CheckCircle2 size={14} className="text-emerald-500" /> 
        };
      case 'In Progress': 
        return { 
          color: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/30', 
          icon: <Clock size={14} className="text-indigo-500" /> 
        };
      default: 
        return { 
          color: 'bg-slate-50 text-slate-600 dark:bg-slate-700/30 dark:text-slate-400 border-slate-100 dark:border-slate-800', 
          icon: <Circle size={14} className="text-slate-400" /> 
        };
    }
  };

  const config = getStatusConfig(task.status);

  // Share Task
  const handleShare = async (e) => {
    e.preventDefault();
    if (!shareEmail) return;
    try {
      setShareLoading(true);
      setShareError('');
      setShareSuccess('');
      await shareTask(task._id, shareEmail);
      setShareSuccess('Shared successfully!');
      setShareEmail('');
      setTimeout(() => {
        setIsSharing(false);
        setShareSuccess('');
      }, 1500);
      if (onRefresh) onRefresh();
    } catch (err) {
      setShareError(err.response?.data?.message || 'Failed to share task.');
    } finally {
      setShareLoading(false);
    }
  };

  // Upload File Attachment
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploadLoading(true);
      await uploadAttachment(task._id, formData);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to upload attachment.');
    } finally {
      setUploadLoading(false);
    }
  };

  // Delete Attachment
  const handleDeleteAttachment = async (attachmentId) => {
    if (!window.confirm('Are you sure you want to remove this attachment?')) return;
    try {
      await deleteAttachment(task._id, attachmentId);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete attachment.');
    }
  };

  // Format File Size
  const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimetype) => {
    if (mimetype.startsWith('image/')) return <ImageIcon size={14} className="text-pink-500" />;
    if (mimetype.includes('pdf')) return <FileText size={14} className="text-red-500" />;
    return <File size={14} className="text-blue-500" />;
  };

  return (
    <div className="group bg-white dark:bg-slate-800 rounded-[24px] p-6 border border-slate-100 dark:border-slate-700/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-4">
          <div className="flex flex-col gap-1.5">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[12px] font-bold border w-max ${config.color}`}>
              {config.icon}
              {task.status}
            </div>
            
            {/* Ownership Badges */}
            {!isOwner && task.owner && (
              <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5 rounded-md border border-amber-100 dark:border-amber-900/30 w-max">
                Shared by {task.owner.name}
              </span>
            )}
            {isOwner && task.sharedWith && task.sharedWith.length > 0 && (
              <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/20 px-2 py-0.5 rounded-md border border-indigo-100 dark:border-indigo-900/30 w-max flex items-center gap-1">
                <Users size={10} />
                Shared with {task.sharedWith.length} member{task.sharedWith.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
          
          {/* Quick Action buttons */}
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {isOwner && (
              <button 
                onClick={() => setIsSharing(!isSharing)}
                className={`p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors ${isSharing ? 'bg-indigo-50 dark:bg-indigo-900 text-indigo-600' : ''}`}
                title="Share Task"
              >
                <Share2 size={16} />
              </button>
            )}
            
            <button 
              onClick={() => onEdit(task)}
              className="p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              title="Edit Task"
            >
              <Edit3 size={16} />
            </button>
            
            {isOwner && (
              <button 
                onClick={() => onDelete(task._id)}
                className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-400 hover:text-red-500 transition-colors"
                title="Delete Task"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>
        
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {task.title}
        </h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 line-clamp-3 font-medium leading-relaxed">
          {task.description}
        </p>

        {/* Sharing Form - Inline */}
        {isSharing && (
          <form onSubmit={handleShare} className="mb-4 p-4 bg-slate-50 dark:bg-slate-700/30 rounded-2xl border border-slate-100 dark:border-slate-700 animate-slideDown">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Share via Email</span>
              <button type="button" onClick={() => setIsSharing(false)} className="text-slate-400 hover:text-slate-600">
                <X size={14} />
              </button>
            </div>
            <div className="flex gap-2">
              <input 
                type="email"
                required
                placeholder="colleague@domain.com"
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
              />
              <button 
                type="submit"
                disabled={shareLoading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center disabled:opacity-50"
              >
                {shareLoading ? <Loader2 size={12} className="animate-spin" /> : 'Share'}
              </button>
            </div>
            {shareError && <p className="text-[10px] text-red-500 font-bold mt-1.5">{shareError}</p>}
            {shareSuccess && <p className="text-[10px] text-emerald-500 font-bold mt-1.5">{shareSuccess}</p>}
          </form>
        )}

        {/* Attachments Section */}
        {task.attachments && task.attachments.length > 0 && (
          <div className="mb-4 space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Attachments</span>
            <div className="max-h-[100px] overflow-y-auto space-y-1 pr-1 scrollbar-thin">
              {task.attachments.map((file) => (
                <div key={file._id} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-700/40 border border-slate-100 dark:border-slate-700 rounded-xl text-xs group/file">
                  <a 
                    href={`http://localhost:5000${file.path}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-2 hover:underline text-slate-600 dark:text-slate-300 font-bold truncate max-w-[80%]"
                  >
                    {getFileIcon(file.mimetype)}
                    <span className="truncate">{file.filename}</span>
                    <span className="text-[9px] font-normal text-slate-400">({formatSize(file.size)})</span>
                  </a>
                  {isOwner && (
                    <button 
                      onClick={() => handleDeleteAttachment(file._id)}
                      className="opacity-0 group-hover/file:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-all rounded-md hover:bg-red-50 dark:hover:bg-red-950/20"
                      title="Remove Attachment"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="flex items-center justify-between text-[12px] font-bold text-slate-400 dark:text-slate-400/80 mt-4 pt-4 border-t border-slate-50 dark:border-slate-700/50">
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-slate-400 dark:text-slate-500" />
          <span>{format(new Date(task.dueDate), 'MMM dd, yyyy')}</span>
        </div>
        
        {/* Attachment Upload Button */}
        <div className="flex items-center gap-2.5">
          {uploadLoading ? (
            <Loader2 size={14} className="animate-spin text-indigo-600" />
          ) : (
            <label className="p-1 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-400 hover:text-indigo-600 cursor-pointer transition-colors" title="Attach file">
              <Paperclip size={14} />
              <input 
                type="file" 
                onChange={handleFileUpload} 
                className="hidden" 
              />
            </label>
          )}
          <div className="w-2 h-2 rounded-full bg-slate-100 dark:bg-slate-700 group-hover:bg-indigo-300 dark:group-hover:bg-indigo-500 transition-colors"></div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
