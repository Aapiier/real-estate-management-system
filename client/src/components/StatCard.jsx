import React from 'react';

export default function StatCard({ title, value, icon: Icon, color = 'blue', subtitle }) {
  const colorMap = {
    blue: { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' },
    emerald: { bg: '#ecfdf5', color: '#059669', border: '#a7f3d0' },
    amber: { bg: '#fffbeb', color: '#d97706', border: '#fde68a' },
    purple: { bg: '#f5f3ff', color: '#7c3aed', border: '#ddd6fe' },
    rose: { bg: '#fff1f2', color: '#e11d48', border: '#fecdd3' },
  };

  const scheme = colorMap[color] || colorMap.blue;

  return (
    <div className="stat-card">
      <div 
        className="stat-icon" 
        style={{ backgroundColor: scheme.bg, color: scheme.color, border: `1px solid ${scheme.border}` }}
      >
        <Icon size={24} />
      </div>
      <div className="stat-info">
        <div className="stat-label">{title}</div>
        <div className="stat-value">{value}</div>
        {subtitle && <div className="stat-meta">{subtitle}</div>}
      </div>
    </div>
  );
}
