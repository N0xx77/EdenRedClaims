const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5050').replace(/\/$/, '');
const RECEIPTS_BASE_URL = (import.meta.env.VITE_RECEIPTS_BASE_URL || 'http://localhost:5001').replace(/\/$/, '');

export { API_BASE_URL, RECEIPTS_BASE_URL };
