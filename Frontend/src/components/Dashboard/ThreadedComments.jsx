import React, { useState, useMemo } from 'react';

// 1. Recursive Single Comment Component
const CommentNode = ({ comment, onReply }) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');

  const handleReplySubmit = () => {
    if (!replyText.trim()) return;
    onReply(comment.id, replyText);
    setReplyText('');
    setIsReplying(false);
  };

  // Field mapping for Prisma-backed backend
  const displayText = comment.content || '';
  const displayDate = comment.createdAt;
  const username = comment.user?.username || 'User';
  const role = comment.user?.role || 'employee';

  return (
    <div className="mb-4 text-sm animate-in fade-in slide-in-from-left-2 duration-300">
      {/* User Info & Role Tag */}
      <div className="flex items-center gap-2 mb-1.5">
        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 border border-slate-200 uppercase">
            {username.charAt(0)}
        </div>
        <span className="font-bold text-slate-900">{username}</span>
        
        {/* Role Tags */}
        <span className={`text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest border ${
            role === 'admin' || role === 'manager' 
            ? 'bg-blue-50 text-blue-600 border-blue-100' 
            : 'bg-slate-50 text-slate-400 border-slate-100'
        }`}>
            {role}
        </span>
        
        {displayDate && (
          <span className="text-slate-400 text-[10px] ml-1 font-medium italic">
            • {new Date(displayDate).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>

      {/* Comment Content */}
      <div className="text-slate-600 ml-8 bg-slate-50/50 p-3 rounded-2xl rounded-tl-none border border-slate-100/50 shadow-sm leading-relaxed">
        {displayText}
      </div>

      {/* Reply Action */}
      <div className="ml-8 mt-1.5 flex items-center gap-4">
        <button 
          onClick={() => setIsReplying(!isReplying)}
          className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-all active:scale-95"
        >
          {isReplying ? 'Cancel' : 'Reply'}
        </button>
      </div>

      {/* Reply Input Box */}
      {isReplying && (
        <div className="mt-4 ml-8 p-4 bg-white border border-blue-100 rounded-2xl shadow-xl shadow-blue-500/5 flex flex-col gap-3 animate-in zoom-in-95 duration-200">
          <textarea 
            autoFocus
            rows={2}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            className="w-full bg-transparent text-sm outline-none resize-none placeholder:text-slate-300 italic"
            placeholder={`Reply to ${username}...`}
          />
          <div className="flex justify-end gap-2">
            <button 
              onClick={handleReplySubmit}
              className="bg-blue-600 text-white px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
            >
              Transmit Reply
            </button>
          </div>
        </div>
      )}

      {/* Recursive Replies Rendering */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="border-l border-slate-200/60 ml-3.5 pl-4.5 mt-4 space-y-4">
          {comment.replies.map(reply => (
            <CommentNode key={reply.id} comment={reply} onReply={onReply} />
          ))}
        </div>
      )}
    </div>
  );
};

// 2. Main Wrapper Component
export default function ThreadedComments({ rawComments, onPostComment }) {
  // Convert flat comments to a nested tree if the backend didn't already
  const commentsTree = useMemo(() => {
    if (!rawComments || !Array.isArray(rawComments)) return [];
    
    // Check if it's already a tree (nested replies)
    const isAlreadyTree = rawComments.some(c => c.replies && c.replies.length > 0);
    if (isAlreadyTree) return rawComments;

    const commentMap = {};
    const tree = [];

    // Ensure initial replies array for every entry
    rawComments.forEach(c => {
      commentMap[c.id] = { ...c, replies: c.replies || [] };
    });

    // Parent aur Child ko joden (uses parentId from Prisma field name)
    rawComments.forEach(c => {
      const parentId = c.parentId || c.parent_id;
      if (parentId && commentMap[parentId]) {
        commentMap[parentId].replies.push(commentMap[c.id]);
      } else {
        tree.push(commentMap[c.id]);
      }
    });

    return tree;
  }, [rawComments]);

  return (
    <div className="space-y-6">
      {commentsTree.length === 0 ? (
        <div className="text-center py-10 bg-slate-50/50 border border-dashed border-slate-200 rounded-3xl">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Tactical Comms: Silent</p>
        </div>
      ) : (
        commentsTree.map(comment => (
          <CommentNode 
            key={comment.id} 
            comment={comment} 
            onReply={onPostComment} 
          />
        ))
      )}
    </div>
  );
}