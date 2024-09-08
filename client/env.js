require("dotenv").config();
const ENV = process.env.NODE_ENV || "development"; 

const dev = {
  apiUrl: "http://localhost:8080",
  devServer: {
    host: "localhost",
    port: 3000,
  },
};

const prod = {
  apiUrl: process.env.RAILWAY_STATIC_URL,
  devServer: {
    host: process.env.HOST,
    port: process.env.PORT,
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
