import React, { useState } from 'react'
import { Stage, Layer, Rect, Text, Group } from 'react-konva'

const pages = [
  { id: 1, content: 'Page 1 Content' },
  { id: 2, content: 'Page 2 Content' },
  { id: 3, content: 'Page 3 Content' },
]

const SketchBook = () => {
  const [currentPage, setCurrentPage] = useState(0)

  const handleNextPage = () => {
    setCurrentPage((prevPage) => (prevPage + 1) % pages.length)
  }

  const handlePrevPage = () => {
    setCurrentPage((prevPage) => (prevPage - 1 + pages.length) % pages.length)
  }

  return (
    <div>
      <Stage width={window.innerWidth} height={window.innerHeight}>
        <Layer>
          <Group>
            <Rect
              x={50}
              y={50}
              width={300}
              height={400}
              fill="white"
              shadowBlur={10}
              cornerRadius={10}
            />
            <Text
              x={70}
              y={70}
              text={pages[currentPage].content}
              fontSize={24}
              fill="black"
            />
          </Group>
        </Layer>
      </Stage>
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <button onClick={handlePrevPage}>Previous</button>
        <button onClick={handleNextPage}>Next</button>
      </div>
    </div>
  )
}

export default SketchBook
