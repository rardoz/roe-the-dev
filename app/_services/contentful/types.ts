import type { AssetFields } from 'contentful'
import type { Document } from '@contentful/rich-text-types'

export type ContentType =
  | 'blog'
  | 'portfolio'
  | 'linkBank'
  | 'featuredContent'
  | string

export interface USE_BLOG_ARGS {
  limit?: number
  skip?: number
  contentType?: ContentType
  slug?: string
  order?: string
}
export interface BlogField {
  blogPhoto: BlogAsset
  content: Document
  description: string
  featuredImage: BlogAsset
  keywords: string
  socialPhoto: BlogAsset
  title: string
  video: BlogAsset
  slug: string
  hardRoute?: boolean
}

export interface NormalizedBlogPhoto {
  url?: string
  description?: string
  contentType?: string
  fileName?: string
  width?: number
  height?: number
  title?: string
}
// todo convert this to NormalizedContentfulAsset
export type NormalizedBlogVideo = NormalizedBlogPhoto

export interface NormalizedBlogData {
  blogPhoto?: NormalizedBlogPhoto
  content?: Document
  description?: string
  featuredImage?: NormalizedBlogPhoto
  keywords?: string
  socialPhoto?: NormalizedBlogPhoto
  title?: string
  video?: NormalizedBlogVideo
  dateCreated?: string
  dateUpdated?: string
  slug?: string
  hardRoute?: boolean
}

export interface NormalizedBlogState {
  items?: NormalizedBlogData[]
}

export type BlogSkeleton = {
  contentTypeId: string
  fields: BlogField
}

export type BlogAsset = {
  fields: AssetFields
}
