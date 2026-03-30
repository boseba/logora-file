// eslint.naming.mjs
export default [
  "error",

  // Static properties must be camelCase
  {
    selector: "classProperty",
    modifiers: ["static"],
    format: ["camelCase"],
  },

  // Static readonly class properties must be PascalCase
  {
    selector: "classProperty",
    modifiers: ["static", "readonly"],
    format: ["PascalCase"],
  },

  // Enums must be PascalCase and must not end with "s"
  {
    selector: "enum",
    format: ["PascalCase"],
    custom: { regex: "s$", match: false },
  },
];
