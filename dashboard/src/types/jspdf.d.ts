declare module 'jspdf/dist/jspdf.umd.min' {
  export class jsPDF {
    constructor(options?: {
      orientation?: 'portrait' | 'landscape';
      unit?: 'pt' | 'mm' | 'cm' | 'in';
      format?: string | [number, number];
      hotfixes?: string[];
    });
    
    setFontSize(size: number): jsPDF;
    text(text: string, x: number, y: number, options?: any): jsPDF;
    addPage(): jsPDF;
    addImage(imageData: string, format: string, x: number, y: number, width: number, height: number, alias?: string, compression?: string, rotation?: number): jsPDF;
    save(filename?: string): jsPDF;
  }
}
