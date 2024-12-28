import mongoose, { Schema, model } from 'mongoose'
import type { PageLockDocument } from './types'

const PageLockSchema = new Schema<PageLockDocument>(
  {
    sketch_doc: {
      type: Schema.Types.ObjectId,
      ref: 'Sketch',
      unique: true,
    },
    code: {
      type: String,
      required: [true, 'A code is required'],
      validate: {
        validator: function (v: string) {
          return /^\d{4}$/.test(v)
        },
        message: 'Code must be exactly 4 digits',
      },
      unique: true,
    },
    startTime: {
      type: Date,
      required: [true, 'Start time is required'],
    },
    endTime: {
      type: Date,
      required: [true, 'End time is required'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 3600, // 1 hour in seconds
    },
  },
  {
    timestamps: true,
  },
)

const PageLock =
  mongoose.models?.PageLock ||
  model<PageLockDocument>('PageLock', PageLockSchema)
export default PageLock
