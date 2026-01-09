export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "subject-case": [2, "always", "lower-case"],
    "subject-max-length": [2, "always", 50],
  },
};
