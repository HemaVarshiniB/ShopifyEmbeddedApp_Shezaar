// global.d.ts
declare module '*.css?url' {
  const content: string;
  export default content;
}
