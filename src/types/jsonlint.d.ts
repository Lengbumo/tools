declare module 'jsonlint' {
  interface JsonLint {
    parse(text: string): any;
  }
  
  const jsonlint: JsonLint;
  export = jsonlint;
} 