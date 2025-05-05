// Socket configuration
const getSocketUrl = () => {
  // In production, use the same host as the current page
  if (process.env.NODE_ENV === 'production') {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}`;
  }
  
  // In development, use localhost:5001
  return 'http://localhost:5001';
};

const socketConfig = {
  url: getSocketUrl(),
  options: {
    withCredentials: true,
    reconnectionAttempts: 3,
    timeout: 10000,
    // Don't add user_id here, it will be added when connecting
  }
};

export default socketConfig; 