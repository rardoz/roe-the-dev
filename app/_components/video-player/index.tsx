import React from 'react'

interface VideoPlayerProps {
  videoSrc: string
  posterSrc?: string
  contentType?: string
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoSrc,
  posterSrc,
  contentType = 'video/mp4',
}) => {
  return (
    <div className="border-2 border-gray-400 w-full h-full p-4 sm:p-10 bg-gradient-to-b from-gray-800 shadow-sm-light to-gray-950 rounded-3xl">
      {videoSrc && (
        <video
          poster={posterSrc}
          muted
          autoPlay
          loop
          playsInline
          className="object-cover w-full h-full"
        >
          <source src={videoSrc} type={contentType} />
        </video>
      )}
    </div>
  )
}

export default VideoPlayer
