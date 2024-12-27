import mongoose, { Schema, model } from 'mongoose'

export interface SketchDocument {
  _id: string
  sketch_paths: string
  page_number: number
  is_enabled: boolean
  createdAt: Date
  updatedAt: Date
}

const SketchSchema = new Schema<SketchDocument>(
  {
    sketch_paths: {
      type: String,
      required: false,
    },
    page_number: {
      type: Number,
      required: [true, 'A page number is required'],
    },
    is_enabled: {
      type: Boolean,
      default: false,
      required: false,
    },
  },
  {
    timestamps: true,
  },
)

const Sketch =
  mongoose.models?.Sketch || model<SketchDocument>('Sketch', SketchSchema)
export default Sketch
