import { useEffect } from 'react'

const defaultDescription =
  'Discover and search published articles, FAQs, products, and case studies from Drupal and WordPress in one place.'

function upsertMeta(selector, attribute, key, content) {
  let element = document.head.querySelector(selector)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, key)
    document.head.append(element)
  }
  element.setAttribute('content', content)
}

function pageMetadata(pathname, query, item) {
  if (pathname.startsWith('/content/')) {
    if (!item) {
      return {
        title: 'Content | BrandHub',
        description: defaultDescription,
        robots: 'noindex,follow',
        type: 'website',
      }
    }

    return {
      title: `${item.title} | BrandHub`,
      description: item.summary || item.plainText || defaultDescription,
      robots: item.status === 'published' ? 'index,follow' : 'noindex,follow',
      type: 'article',
      image: item.heroImage,
    }
  }

  if (pathname === '/search') {
    return {
      title: query ? `Search: ${query} | BrandHub` : 'Search Content | BrandHub',
      description: query
        ? `Search BrandHub content for ${query}, including articles, FAQs, products, and case studies.`
        : 'Search published articles, FAQs, products, and case studies from Drupal and WordPress.',
      robots: 'noindex,follow',
      type: 'website',
    }
  }

  if (pathname === '/demo') {
    return {
      title: 'Book a Demo | BrandHub',
      description: 'Request a BrandHub demo and discover unified search across your content sources.',
      robots: 'index,follow',
      type: 'website',
    }
  }

  return {
    title: 'BrandHub | Unified Content Portal',
    description: defaultDescription,
    robots: 'index,follow',
    type: 'website',
  }
}

export function SeoMetadata({ pathname, query = '', item = null }) {
  useEffect(() => {
    const metadata = pageMetadata(pathname, query, item)
    const canonicalUrl = `${window.location.origin}${pathname}`
    const description = metadata.description.replace(/\s+/g, ' ').trim().slice(0, 300)

    document.title = metadata.title
    upsertMeta('meta[name="description"]', 'name', 'description', description)
    upsertMeta('meta[name="robots"]', 'name', 'robots', metadata.robots)
    upsertMeta('meta[property="og:title"]', 'property', 'og:title', metadata.title)
    upsertMeta('meta[property="og:description"]', 'property', 'og:description', description)
    upsertMeta('meta[property="og:type"]', 'property', 'og:type', metadata.type)
    upsertMeta('meta[property="og:url"]', 'property', 'og:url', canonicalUrl)
    upsertMeta('meta[name="twitter:title"]', 'name', 'twitter:title', metadata.title)
    upsertMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description)

    if (metadata.image && /^https?:\/\//i.test(metadata.image)) {
      upsertMeta('meta[property="og:image"]', 'property', 'og:image', metadata.image)
      upsertMeta('meta[name="twitter:image"]', 'name', 'twitter:image', metadata.image)
    } else {
      document.head.querySelector('meta[property="og:image"]')?.remove()
      document.head.querySelector('meta[name="twitter:image"]')?.remove()
    }

    let canonical = document.head.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.append(canonical)
    }
    canonical.href = canonicalUrl

    if (pathname === '/') {
      let structuredData = document.getElementById('brandhub-structured-data')
      if (!structuredData) {
        structuredData = document.createElement('script')
        structuredData.id = 'brandhub-structured-data'
        structuredData.type = 'application/ld+json'
        document.head.append(structuredData)
      }
      structuredData.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'BrandHub',
        description,
        url: `${window.location.origin}/`,
        potentialAction: {
          '@type': 'SearchAction',
          target: `${window.location.origin}/search?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      })
    } else {
      document.getElementById('brandhub-structured-data')?.remove()
    }
  }, [pathname, query, item])

  return null
}
