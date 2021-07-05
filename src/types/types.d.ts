declare module '*.svg' {
  const inlineSrc: string;
  export default inlineSrc;
}

declare module '*.ttf' {
  const path: string;
  export default path;
}

declare module '*.png' {
  const path: string;
  export default path;
}
