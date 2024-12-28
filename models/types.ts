export interface SketchDocument {
  _id: string
  sketch_paths: string
  page_number: number
  is_enabled: boolean
  createdAt: Date
  updatedAt: Date
}

export interface PageLockDocument {
  _id: string
  sketch_doc: SketchDocument
  code: string
  startTime: Date
  endTime: Date
  createdAt: Date
  updatedAt: Date
}
