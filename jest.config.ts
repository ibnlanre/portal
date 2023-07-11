const path = require("path");

module.exports = {
  modulePaths: [path.resolve(__dirname, "src")],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$",
  coveragePathIgnorePatterns: ["/node_modules/"],
  testEnvironment: "node",
  preset: "ts-jest",
};
