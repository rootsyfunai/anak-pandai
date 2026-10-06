import { useState } from 'react'
import { cdnImage } from '../lib/config'

type Props = {
  /** Path on the CDN, e.g. `hero/keluarga.jpg`. */
  path: string
  alt: string
  className?: string
  /** Rendered when no CDN is configured or the image fails to load. */
  fallback?: React.ReactNode
  width?: number
  height?: number
  /** Above-the-fold images should set this so they are not lazy-loaded. */
  priority?: boolean
}

/**
 * Image served from the Cloudflare CDN.
 *
 * Railway must never serve image bytes, so this component is the only way
 * images enter the app. It degrades to `fallback` rather than showing a
 * broken image, which matters because the CDN URL is environment-specific
 * and will be absent in local development.
 */
export function CdnImage({
  path,
  alt,
  className,
  fallback = null,
  width,
  height,
  priority = false,
}: Props) {
  const [failed, setFailed] = useState(false)
  const src = cdnImage(path)

  if (!src || failed) return <>{fallback}</>

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      width={width}
      height={height}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={priority ? 'high' : 'auto'}
      onError={() => setFailed(true)}
    />
  )
}
