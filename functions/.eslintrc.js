module.exports = {
  env: {
    es2021: true,
    node: true, // ✅ allows require(), module, etc.
  },
  extends: ["eslint:recommended"],
  parserOptions: {
    ecmaVersion: 12,
  },
  rules: {
    // turn off some noisy rules
    "no-unused-vars": ["warn"],
    "no-undef": "off",
  },
};
