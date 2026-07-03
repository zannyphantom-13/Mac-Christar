import React from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * SEO component — drop this inside any page to set per-page <title> and meta tags.
 * All props are optional; sensible defaults are provided for the store.
 */
export default function SEO({
  title,
  description,
  image = '/logo.jpeg',
  url,
  type = 'website',
  product, // optional: pass a product object {name, price, image} for product pages
}) {
  const siteName = 'Mac-Christar';
  const defaultTitle = `${siteName} | Premium Electronics in Nigeria`;
  const defaultDesc =
    'Shop the latest smartphones, laptops, TVs, gaming consoles, home appliances and more at Mac-Christar. Fast delivery across Nigeria. Flexible installment payment plans.';

  const resolvedTitle = title ? `${title} | ${siteName}` : defaultTitle;
  const resolvedDesc = description || defaultDesc;
  const resolvedUrl = url
    ? `https://the-electric-plug.onrender.com${url}`
    : 'https://the-electric-plug.onrender.com/';
  const resolvedImage = image?.startsWith('http')
    ? image
    : `https://the-electric-plug.onrender.com${image}`;

  // Build Product structured data if a product object is passed
  const productSchema = product
    ? JSON.stringify({
        '@context': 'https://schema.org/',
        '@type': 'Product',
        name: product.name,
        image: [product.image || product.imgUrl],
        description: product.description || `Buy ${product.name} at Mac-Christar Nigeria`,
        brand: { '@type': 'Brand', name: product.brand || 'Mac-Christar' },
        offers: {
          '@type': 'Offer',
          url: resolvedUrl,
          priceCurrency: 'NGN',
          price: product.price,
          availability: 'https://schema.org/InStock',
          seller: { '@type': 'Organization', name: siteName },
        },
      })
    : null;

  return (
    <Helmet>
      <title>{resolvedTitle}</title>
      <meta name="description" content={resolvedDesc} />
      <link rel="canonical" href={resolvedUrl} />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={resolvedUrl} />
      <meta property="og:title" content={resolvedTitle} />
      <meta property="og:description" content={resolvedDesc} />
      <meta property="og:image" content={resolvedImage} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={resolvedUrl} />
      <meta name="twitter:title" content={resolvedTitle} />
      <meta name="twitter:description" content={resolvedDesc} />
      <meta name="twitter:image" content={resolvedImage} />

      {/* Product structured data */}
      {productSchema && (
        <script type="application/ld+json">{productSchema}</script>
      )}
    </Helmet>
  );
}
