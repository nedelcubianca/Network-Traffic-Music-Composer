export function formatDuration(seconds) {
  if (seconds === 0) 
    return '0.00 s';

  if (seconds < 0.01) 
    return '<0.01 s';

  if (seconds < 60) 
    return `${seconds.toFixed(2)} s`;

  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  
  return `${mins}m ${secs}s`;
}
