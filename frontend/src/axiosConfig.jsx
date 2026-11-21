import axios from 'axios';

const axiosInstance = axios.create({
  // use same host as the web page, so it work on localhost and on EC2 after IP change
  baseURL: `http://${window.location.hostname}:5001`,
  headers: { 'Content-Type': 'application/json' },
});

export default axiosInstance;
