import React from 'react';

export default function Badge({ status }) {
  if (!status) return null;

  const s = String(status).trim();
  let type = 'neutral';

  switch (s.toLowerCase()) {
    case 'available':
    case 'active':
    case 'closed':
    case 'completed':
    case 'sent':
    case 'valid':
      type = 'success';
      break;
    case 'rented':
    case 'pending':
    case 'in progress':
      type = 'warning';
      break;
    case 'sold':
    case 'terminated':
    case 'expired':
    case 'cancelled':
    case 'failed':
    case 'critical':
      type = 'danger';
      break;
    case 'open':
    case 'under maintenance':
      type = 'purple';
      break;
    default:
      type = 'neutral';
  }

  return (
    <span className={`badge badge-${type}`}>
      <span style={{ 
        width: '6px', 
        height: '6px', 
        borderRadius: '50%', 
        backgroundColor: 'currentColor' 
      }}></span>
      {s}
    </span>
  );
}
