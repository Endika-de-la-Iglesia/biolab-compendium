const ENV = process.env.NODE_ENV; 

const dev = {
  apiUrl: "http://localhost:8080",
  devServer: {
    host: "localhost",
    port: 3000,
  },
};

const prod = {
  apiUrl: "https://biolab-compendium-server-production.up.railway.app",
  devServer: {
    host: "biolab-compendium-server-production.up.railway.app",
    port: 8080,
  },
};

const test = {
  apiUrl: "http://localhost:8081",
  devServer: {
    host: "localhost",
    port: 3001,
  },
};

const config = {
  development: dev,
  production: prod,
  test: test,
};

module.exports = config[ENV];
