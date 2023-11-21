'use client'

import {
  BLOCKS,
  MARKS,
  INLINES,
  Document,
  Block,
  Inline,
} from '@contentful/rich-text-types'
import {
  documentToReactComponents,
  Options,
} from '@contentful/rich-text-react-renderer'
import React, { MutableRefObject, useRef } from 'react'

import Code from './code'
import Image from 'next/image'
import Link from '../link'
import HR from '../hr'
import SectionTitle from '../section-title'

const options: Options = {
  renderMark: {
    [MARKS.BOLD]: (text: React.ReactNode) => <strong>{text}</strong>,
    [MARKS.CODE]: (text: React.ReactNode) => <Code>{text}</Code>,
  },
  renderNode: {
    [BLOCKS.EMBEDDED_ASSET]: (node: Block | Inline) => {
      const fields = node.data?.target?.fields || {}
      return (
        <div className="contentful-to-react-image-container py-5">
          <Image
            className="rounded-lg"
            width={fields.file?.details?.image?.width}
            height={fields.file?.details?.image?.height}
            src={`https:${fields.file?.url}`}
            alt={fields.title}
          />
          <p className="text-center text-sm pt-5">
            <em>{fields.description}</em>
          </p>
        </div>
      )
    },
    [BLOCKS.UL_LIST]: (node: Block | Inline, children: React.ReactNode) => (
      <ul className="list-disc pr-10 pl-10 py-5">{children}</ul>
    ),
    [BLOCKS.LIST_ITEM]: (node: Block | Inline, children: React.ReactNode) => (
      <li className="py-2">{children}</li>
    ),
    [BLOCKS.HR]: () => <HR />,
    [INLINES.HYPERLINK]: (node: Block | Inline, children: React.ReactNode) => (
      <Link
        className="contentful-link"
        href={node.data.uri}
        target="_blank"
        rel="noreferrer"
      >
        {children}
      </Link>
    ),
    [BLOCKS.PARAGRAPH]: (node: Block | Inline, children: React.ReactNode) => {
      return <div className="pb-2">{children}</div>
    },
    [BLOCKS.HEADING_2]: (node: Block | Inline, children: React.ReactNode) => {
      return <SectionTitle>{children}</SectionTitle>
    },

    [BLOCKS.HEADING_3]: (node: Block | Inline, children: React.ReactNode) => {
      return (
        <h3 className="text-purple-700 text-2xl font-bold underline underline-offset-8 pb-4 pt-8">
          {children}
        </h3>
      )
    },
    [BLOCKS.EMBEDDED_ENTRY]: (node: Block | Inline) => {
      return node.data?.target?.sys?.contentType?.sys?.id === 'iframe' ? (
        <div
          className="extra-iframe"
          dangerouslySetInnerHTML={{
            __html: node.data?.target?.fields?.html,
          }}
        ></div>
      ) : (
        <></>
      )
    },
  },
  renderText: (text: string) => {
    try {
      return text.split('\n').flatMap((sentence, i) => [
        i > 0 && <br key={i} />,
        sentence.startsWith('<iframe ') ? (
          <div
            dangerouslySetInnerHTML={{
              __html: sentence,
            }}
          />
        ) : (
          sentence
        ),
      ])
    } catch (e) {
      console.info(e)
      return text
    }
  },
}

const selectWithCodeWrapper = (content: Document): Document => {
  const { content: nodes } = content
  try {
    for (let i = nodes.length - 1; i > -1; i--) {
      if (
        nodes[i] &&
        nodes[i - 1] &&
        nodes[i].nodeType === BLOCKS.PARAGRAPH &&
        (nodes[i].content[0] as any)?.marks?.[0]?.type === MARKS.CODE &&
        (nodes[i - 1].content[0] as any)?.marks?.[0]?.type === MARKS.CODE
      ) {
        ;(nodes[i - 1].content[0] as any).value +=
          `\r` + (nodes[i]?.content[0] as any).value
        delete nodes[i]
      }
    }
    return {
      ...content,
      content: nodes,
    }
  } catch (e) {
    console.error(e)
  }
  return content
}

const ContentfulToReact: React.FC<{ content: Document }> = ({ content }) => {
  const ref = useRef() as MutableRefObject<HTMLDivElement>

  return (
    <div ref={ref}>
      {documentToReactComponents(selectWithCodeWrapper(content), options)}
    </div>
  )
}

export default ContentfulToReact
