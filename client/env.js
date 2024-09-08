const ENV = process.env.NODE_ENV || "development"; 

const dev = {
  apiUrl: "http://localhost:8080",
  devServer: {
    host: "localhost",
    port: 3000,
  },
};

const prod = {
  apiUrl: "https://api.myproductiondomain.com",
  devServer: {
    host: "myproductiondomain.com",
    port: 80,
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
