import React from 'react'

interface VideoBGProps {
  videoSrc: string
  fixed?: boolean
}

const VideoBG: React.FC<VideoBGProps> = ({ videoSrc, fixed }) => {
  return (
    <div
      className={`top-0 left-0 w-full h-full -z-10 ${
        fixed ? 'fixed' : 'absolute'
      }`}
    >
      <video
        autoPlay
        muted
        playsInline
        loop
        className="bg-gradient-to-b from-purple-950 to-black object-cover w-full h-full"
      >
        <source src={videoSrc} type="video/mp4" />
      </video>
    </div>
  )
}

export default VideoBG
