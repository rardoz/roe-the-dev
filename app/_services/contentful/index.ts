import * as contentful from 'contentful'
import type {
  NormalizedBlogData,
  NormalizedBlogState,
  ContentType,
  BlogSkeleton,
  BlogField,
} from './types'

let contentfulClient: contentful.ContentfulClientApi<any>

const getClient = (): contentful.ContentfulClientApi<any> => {
  contentfulClient =
    contentfulClient ||
    contentful.createClient({
      // A space is like a project folder in Contentful terms
      space: `${process.env.CONTENTFUL_SPACE_ID}`,
      //Normally you get both ID and the token in the Contentful web app
      accessToken: `${process.env.CONTENTFUL_ACCESS_TOKEN}`,
      //ENABLE PREVIEW API  host: "preview.contentful.com"
      host: process.env.CONTENTFUL_HOST,
    })
  return contentfulClient
}

const normalizeData = (
  items: contentful.Entry<BlogSkeleton>[],
): NormalizedBlogData[] => {
  const normalizedFields: NormalizedBlogData[] = []
  items.forEach((field) => {
    const {
      sys: { createdAt, updatedAt },
    } = field
    let fieldRow = field.fields as BlogField

    // todo make this not hurt my heart to look at
    normalizedFields.push({
      blogPhoto: {
        url: `https:${fieldRow.blogPhoto?.fields?.file?.url}`,
        contentType: fieldRow.blogPhoto?.fields?.file?.contentType,
        title: fieldRow.blogPhoto?.fields?.title,
        description: fieldRow.blogPhoto?.fields?.description,
        width: fieldRow.blogPhoto?.fields?.file?.details.image?.width,
        height: fieldRow.blogPhoto?.fields?.file?.details.image?.height,
        fileName: fieldRow.blogPhoto?.fields?.file?.fileName,
      },
      socialPhoto: {
        url: `https:${fieldRow.socialPhoto?.fields?.file?.url}`,
        contentType: fieldRow.socialPhoto?.fields?.file?.contentType,
        title: fieldRow.socialPhoto?.fields?.title,
        description: fieldRow.socialPhoto?.fields?.description,
        width: fieldRow.socialPhoto?.fields?.file?.details.image?.width,
        height: fieldRow.socialPhoto?.fields?.file?.details.image?.height,
        fileName: fieldRow.socialPhoto?.fields?.file?.fileName,
      },
      featuredImage: {
        url: `https:${fieldRow.featuredImage?.fields?.file?.url}`,
        contentType: fieldRow.featuredImage?.fields?.file?.contentType,
        title: fieldRow.featuredImage?.fields?.title,
        description: fieldRow.featuredImage?.fields?.description,
        width: fieldRow.featuredImage?.fields?.file?.details.image?.width,
        height: fieldRow.featuredImage?.fields?.file?.details.image?.height,
        fileName: fieldRow.featuredImage?.fields?.file?.fileName,
      },
      video: {
        url: `https:${fieldRow.video?.fields?.file?.url}`,
        contentType: fieldRow.video?.fields?.file?.contentType,
        title: fieldRow.video?.fields?.title,
        description: fieldRow.video?.fields?.description,
        width: fieldRow.video?.fields?.file?.details.image?.width,
        height: fieldRow.video?.fields?.file?.details.image?.height,
        fileName: fieldRow.video?.fields?.file?.fileName,
      },
      content: fieldRow.content,
      keywords: fieldRow.keywords,
      description: fieldRow.description,
      title: fieldRow.title,
      dateCreated: createdAt,
      dateUpdated: updatedAt,
      slug: fieldRow.slug,
      hardRoute: fieldRow.hardRoute,
    })
  })
  return normalizedFields
}

export const useEntries = async ({
  limit = 10,
  skip = 0,
  contentType,
  order,
  slug,
}: {
  limit?: number
  skip?: number
  contentType?: ContentType
  order?: string
  slug?: string
}): Promise<NormalizedBlogState> => {
  const queryData: Record<string, unknown> = {
    content_type: contentType || process.env.CONTENTFUL_BLOG_ID,
    limit,
    skip,
    order: order || '-sys.createdAt',
  }

  if (slug) queryData['fields.slug'] = slug

  return await getClient()
    .getEntries(queryData)
    .then((entry) => {
      return {
        items: normalizeData(entry.items as contentful.Entry<BlogSkeleton>[]),
      }
    })
}
