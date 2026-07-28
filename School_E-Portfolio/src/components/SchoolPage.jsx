import React from 'react'
import { useLocation } from 'react-router-dom'
import { SCHOOL_CONTENT } from '../content/schoolContent'
import { mediaUrl } from '../utils/eaeBridge'
import '../styles/SchoolPage.css'

// Renders one migrated page. Every heading, paragraph and image comes verbatim
// from the archived Google Sites export via src/content/schoolContent.js.
export default function SchoolPage({ path, title }) {
  const location = useLocation()
  const key = path || location.pathname
  const page = SCHOOL_CONTENT[key]

  const heading = page?.title || title || 'Page'
  const blocks = page?.blocks || []

  return (
    <article className="school-page">
      <h1 className="school-page-title">{heading}</h1>

      {blocks.length === 0 && (
        <p className="school-page-empty">
          This page had no content in the original school portfolio export.
        </p>
      )}

      {blocks.map((block, index) => {
        if (block.type === 'image') {
          return (
            <figure className="school-page-figure" key={index}>
              <img
                src={mediaUrl(block.src)}
                alt={block.alt || `Photo from ${heading}`}
                loading="lazy"
                decoding="async"
              />
              {block.alt ? <figcaption>{block.alt}</figcaption> : null}
            </figure>
          )
        }

        if (block.type === 'heading') {
          const Tag = `h${Math.min(Math.max(block.level || 2, 2), 4)}`
          return <Tag className="school-page-heading" key={index}>{block.text}</Tag>
        }

        return <p className="school-page-text" key={index}>{block.text}</p>
      })}
    </article>
  )
}
