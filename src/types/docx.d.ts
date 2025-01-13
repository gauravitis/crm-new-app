declare module 'docx' {
  export class Document {
    constructor(options: any);
  }

  export class Packer {
    static toBuffer(doc: Document): Promise<Buffer>;
  }

  export class Paragraph {
    constructor(options: any);
  }

  export class TextRun {
    constructor(options: any);
  }

  export class Table {
    constructor(options: any);
  }

  export class TableRow {
    constructor(options: any);
  }

  export class TableCell {
    constructor(options: any);
  }

  export enum BorderStyle {
    SINGLE = 'single'
  }
} 