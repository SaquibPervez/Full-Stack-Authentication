import React from 'react';

const StatCard = ({ title, value, icon: Icon, color, bgColor, iconColor }) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-5 hover:shadow-md transition-all hover:-translate-y-1">
      <div className={`w-14 h-14 rounded-2xl ${bgColor || 'bg-indigo-50'} flex items-center justify-center shadow-sm`}>
        <Icon className={`w-7 h-7 ${iconColor || 'text-indigo-600'}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
        <h3 className="text-2xl font-black text-gray-900 truncate">{value}</h3>
      </div>
    </div>
  );
};

export default StatCard;