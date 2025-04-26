import ogs from 'open-graph-scraper'
import type { SuccessResult } from 'open-graph-scraper/types'

type LinkMetadataResponse =
  | {
      success: true
      title?: string
      description: string
      faviconUrl?: string
      requestUrl?: string
      image?: {
        url: string
        alt?: string
        width?: number
        height?: number
      }
    }
  | { success: false }

const getOgImageData = (data: SuccessResult['result']) => {
  const { twitterImage, ogImage } = data

  if (!ogImage && !twitterImage) return
  if (ogImage?.length === 0 && twitterImage?.length === 0) return

  const _twitterImage = (twitterImage ?? [])[0]
  const _ogImage = (ogImage ?? [])[0]

  return {
    url: _twitterImage?.url ?? _ogImage?.url,
    alt: _twitterImage?.alt ?? data.ogTitle,
    width: _twitterImage?.width ?? _ogImage?.width,
    height: _twitterImage?.height ?? _ogImage?.height
  }
}

const getLinkMetadata = async (url: string): Promise<LinkMetadataResponse> => {
  const data = await ogs({ url })

  if (data.error || !data.result) return { success: false }

  return {
    success: !!data.result.success,
    title: data.result.twitterTitle ?? data.result.ogTitle,
    description:
      data.result.twitterDescription ?? data.result.ogDescription ?? '',
    faviconUrl: data.result.favicon?.startsWith('/')
      ? data.result.ogUrl + data.result.favicon
      : data.result.favicon,
    requestUrl: data.result.requestUrl,
    image: getOgImageData(data.result)
  }
}

export default getLinkMetadata
