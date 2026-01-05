import React from 'react'

interface TitleProps {
  heading: string
  subheading?: string
}

const Title: React.FC<TitleProps> = ({ heading, subheading }) => {
  return (
    <div>
      <h2 className='text-lg md:text-2xl text-primaryText font-bold'>
        {heading}
      </h2>
      {subheading && (
        <p className='text-sm md:text-base text-text80'>
          {subheading}
        </p>
      )}
    </div>
  )
}

export default Title
