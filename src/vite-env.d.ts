/// <reference types="vite/client" />

declare module "*.tmLanguage.json" {
  const value: Record<string, unknown>;
  export default value;
}
