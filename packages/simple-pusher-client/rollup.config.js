const pkg = require("./package.json");

module.exports = {
  input: "src/main.js",
  output: [
    {
      file: pkg.main,
      format: "cjs"
    },
    {
      file: pkg.module,
      format: "es"
    }
  ],
  external: [...Object.keys(pkg.dependencies)]
};
