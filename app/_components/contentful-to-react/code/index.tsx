import React, { useEffect, useRef } from 'react'
import { EditorView, basicSetup } from 'codemirror'
import { EditorState, Compartment } from '@codemirror/state'
import { javascript } from '@codemirror/lang-javascript'
import CodeButtonGroup from '../code-button-group'
const tabSize = new Compartment()

function decodeHtml(html: string): string {
  return html
    .replaceAll('<br>', '\n')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
}

const Code: React.FC<React.PropsWithChildren> = ({ children }) => {
  const iFrameRef = useRef<HTMLIFrameElement>(null)
  const codeRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<EditorView>()

  useEffect(() => {
    const iFrame = iFrameRef.current
    const code = codeRef.current
    const editor = editorRef.current

    if (iFrame && code && !editor && !!code.innerHTML) {
      const text = code.innerHTML
      code.innerHTML = ''

      editorRef.current = new EditorView({
        parent: code.parentElement as HTMLElement,
        extensions: [
          basicSetup,
          javascript(),
          tabSize.of(EditorState.tabSize.of(4)),
        ],
        doc: decodeHtml(text),
      })

      const defaultIframeWrite = (): void =>
        iFrame.contentDocument?.write(`
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
    }
  }, [])
  return (
    <div>
      <div className="mt-10 mb-6">
        <div ref={codeRef}>{children}</div>
      </div>
      <div className="mb-10">
        <iframe
          className="h-20 bg-slate-50 w-full border-dashed border-purple-400 border-2"
          ref={iFrameRef}
        />
        <CodeButtonGroup
          onPlay={() => {
            const escapedString = encodeURIComponent(
              editorRef?.current?.state.doc as unknown as string,
            )
            iFrameRef.current?.contentDocument?.write(`
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
          }}
          onReset={() => iFrameRef?.current?.contentDocument?.location.reload()}
        />
      </div>
    </div>
  )
}

export default Code
