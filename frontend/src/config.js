const config = {
  development: {
    API_BASE_URL: 'http://localhost:8000/api'
  },
  production: {
    API_BASE_URL: 'https://your-django-backend.onrender.com/api'
  }
};

export default config[process.env.NODE_ENV];