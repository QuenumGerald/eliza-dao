module.exports = {
  apps: [{
    name: "dao-state-updater",
    script: "./scripts/updateDaoState.js",
    watch: false,
    env: {
      NODE_ENV: "production",
    }
  }]
}
