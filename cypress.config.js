const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    video: false,
    supportFile: false,
    env: {
      apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:3001/api'
    },
  },
});



