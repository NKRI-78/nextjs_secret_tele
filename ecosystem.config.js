module.exports = {
  apps: [
    {
      name: "nextjs-secret-tele",
      script: "npm",
      args: "run start",
      env: {
        NODE_ENV: "development",
        PORT: 3111,
      },
    },
  ],
};
  