declare module 'qrcode' {
  export interface QRCodeOptions {
    errorCorrectionLevel?: 'low' | 'medium' | 'quartile' | 'high' | 'L' | 'M' | 'Q' | 'H';
    version?: number;
    margin?: number;
    scale?: number;
    width?: number;
    color?: {
      dark?: string;
      light?: string;
    };
  }

  export function toDataURL(text: string | Buffer, options?: QRCodeOptions): Promise<string>;
  export function toDataURL(
    text: string | Buffer,
    options: QRCodeOptions,
    callback: (error: Error | null | undefined, url: string) => void
  ): void;
  export function toDataURL(
    text: string | Buffer,
    callback: (error: Error | null | undefined, url: string) => void
  ): void;
  export function toString(text: string | Buffer, options?: any): Promise<string>;
  export function toBuffer(text: string | Buffer, options?: any): Promise<Buffer>;

  const QRCode: {
    toDataURL: typeof toDataURL;
    toString: typeof toString;
    toBuffer: typeof toBuffer;
  };

  export default QRCode;
}

declare module 'docx' {
  export const Document: any;
  export const Packer: any;
  export const Paragraph: any;
  export const TextRun: any;
  export const HeadingLevel: any;
  export const Table: any;
  export const TableRow: any;
  export const TableCell: any;
  export const WidthType: any;
  export const AlignmentType: any;
  export const BorderStyle: any;
  const docx: any;
  export default docx;
}
