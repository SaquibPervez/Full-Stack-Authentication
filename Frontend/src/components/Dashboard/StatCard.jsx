import React from 'react';

const StatCard = ({ title, value, icon: Icon, bgColor, iconColor, trend }) => {
  return (
    <div className="bg-white border border-slate-200/60 rounded-xl p-5 shadow-[0_2px_10px_rgb(0,0,0,0.02)] transition-all duration-200 hover:shadow-[0_8px_20px_rgb(0,0,0,0.04)] group">
        <div className="flex items-start justify-between mb-4">
            <div className={`w-10 h-10 rounded-lg ${bgColor || 'bg-slate-50'} flex items-center justify-center border border-slate-100 group-hover:scale-105 transition-transform duration-200`}>
                <Icon className={`w-5 h-5 ${iconColor || 'text-slate-600'}`} />
            </div>
            {trend && (
                <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100/50">
                    {trend}
                </span>
            )}
        </div>
        
        <div>
            <p className="text-[10px] tracking-wider uppercase font-semibold text-slate-400 mb-1">
                {title}
            </p>
            <h3 className="text-xl font-semibold text-slate-900 tracking-tight">
                {value}
            </h3>
        </div>
    </div>
  );
};

export default StatCard;