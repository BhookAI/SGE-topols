declare module 'pdf-extract' {
  interface PDFExtractOptions {
    // Opciones de extracción
  }

  interface PDFExtractTextItem {
    x: number
    y: number
    str: string
    dir: string
    width: number
    height: number
    fontName: string
  }

  interface PDFExtractPage {
    pageInfo: {
      num: number
      scale: number
      rotation: number
      offsetX: number
      offsetY: number
      width: number
      height: number
    }
    content: PDFExtractTextItem[]
  }

  interface PDFExtractResult {
    pages: PDFExtractPage[]
    meta?: any
  }

  class PDFExtract {
    extract(filePath: string, options?: PDFExtractOptions): Promise<PDFExtractResult>
  }

  export = PDFExtract
}
