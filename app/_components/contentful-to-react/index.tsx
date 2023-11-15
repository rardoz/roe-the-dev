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
import React, { MutableRefObject, useEffect, useRef } from 'react'
import './styles.scss'
import { basicSetup, EditorView } from 'codemirror'
import { EditorState, Compartment } from '@codemirror/state'
import { javascript } from '@codemirror/lang-javascript'
import Code from './code'
import style from './style.module.css'
import Image from 'next/image'

const tabSize = new Compartment()

const options: Options = {
  renderMark: {
    [MARKS.BOLD]: (text: React.ReactNode) => <strong>{text}</strong>,
    [MARKS.CODE]: (text: React.ReactNode) => <Code>{text}</Code>,
  },
  renderNode: {
    [BLOCKS.EMBEDDED_ASSET]: (node: Block | Inline) => {
      const fields = node.data?.target?.fields || {}
      return (
        <div className="contentful-to-react-image-container">
          <Image loading="lazy" src={fields.file?.url} alt={fields.title} />
          <p>
            <em>{fields.description}</em>
          </p>
        </div>
      )
    },
    [INLINES.HYPERLINK]: (node: Block | Inline, children: React.ReactNode) => (
      <a href={node.data.uri} target="_blank" rel="noreferrer">
        {children}
      </a>
    ),
    [BLOCKS.PARAGRAPH]: (node: Block | Inline, children: React.ReactNode) => (
      <p>{children}</p>
    ),
    [BLOCKS.EMBEDDED_ENTRY]: (node: Block | Inline) => {
      console.log(node)
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
        i > 0 && <br />,
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
  const nodes = [...content.content] || []
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

function decodeHtml(html: string): string {
  const txt = document.createElement('textarea')
  txt.innerHTML = html
  return txt.value.replaceAll('<br>', '\n')
}

const ContentfulToReact: React.FC<{ content: Document }> = ({ content }) => {
  const ref = useRef() as MutableRefObject<HTMLDivElement>

  useEffect(() => {
    if (ref.current)
      Array.from(ref.current.getElementsByClassName('code')).forEach((code) => {
        const text = code.innerHTML
        code.innerHTML = ''

        const view = new EditorView({
          parent: code,
          extensions: [
            basicSetup,
            javascript(),
            tabSize.of(EditorState.tabSize.of(4)),
          ],
          doc: decodeHtml(text),
        })

        const iFrame = code.parentNode?.querySelectorAll(
          'iframe',
        )?.[0] as HTMLIFrameElement

        const defaultIframeWrite = (): void =>
          iFrame?.contentDocument?.write(`
        <body></body>
            <script type="text/javascript">
            console.info = (...log) => {
              setTimeout(() => {
                window.scrollTo(window.scrollX, window.outerHeight * 10);
              })
              return log[0]
            };
            console.log = (...log) => {
                document.getElementsByTagName('body')[0].innerText += ">> " + log.join(\`
            \`);
            document.getElementsByTagName('body')[0].innerText +=\`
            \`;
            window.scrollTo(window.scrollX, window.outerHeight * 10);
              }
              console.error = console.log;
              </script>
          `)
        if (iFrame) iFrame.onload = defaultIframeWrite
        defaultIframeWrite()
        code.parentNode
          ?.querySelectorAll('.code-reset-btn')[0]
          .addEventListener('click', () => {
            iFrame?.contentWindow?.location.reload()
          })

        code.parentNode
          ?.querySelectorAll('.code-run-btn')[0]
          .addEventListener('click', () => {
            const escapedString = encodeURIComponent(
              view.state.doc as unknown as string,
            )
            iFrame?.contentDocument?.write(`
            <script type="text/javascript">
         
              try {
                const retVal = eval(decodeURIComponent("${escapedString}"));
  
                if(retVal) {
                  document.getElementsByTagName('body')[0].innerText += ">> " + JSON.stringify(retVal);
                  document.getElementsByTagName('body')[0].innerText += \`
                  \`;
                } else if(retVal === undefined) {
                  console.log('undefined')
                }
                
              } catch(e) {
                
                document.getElementsByTagName('body')[0].innerText +=  ">> "  + (e.message || JSON.stringify(e.message)) + \`\r\n\`;
              }
              window.scrollTo(window.scrollX, window.outerHeight * 10)
            </script>
            `)
          })

        //view.state.doc
      })
  }, [])

  return (
    <div className={style.contentful} ref={ref}>
      {documentToReactComponents(selectWithCodeWrapper(content), options)}
    </div>
  )
}

export default ContentfulToReact
