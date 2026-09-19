export function getSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL;
  const vercelProductionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  const vercelUrl = process.env.VERCEL_URL;
  const raw = configuredUrl || (
    vercelProductionUrl
      ? `https://${vercelProductionUrl}`
      : vercelUrl
        ? `https://${vercelUrl}`
        : 'http://localhost:3000'
  );
  return raw.replace(/\/$/, '');
}

export function getGoogleSiteVerification() {
  return process.env.GOOGLE_SITE_VERIFICATION?.trim() || undefined;
}

export function serializeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

export function buildHomeJsonLd() {
  const siteUrl = getSiteUrl();
  const description = 'Nền tảng quản lý phòng trọ, chia chi phí và hỗ trợ cuộc sống ở ghép. For Better Balance.';

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${siteUrl}/#organization`,
        name: '4B Platform',
        alternateName: 'For Better Balance',
        url: siteUrl,
        logo: `${siteUrl}/logo.png`,
        email: '4bforbetterbalance@gmail.com',
      },
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        name: '4B Platform',
        url: siteUrl,
        description,
        inLanguage: 'vi-VN',
        publisher: { '@id': `${siteUrl}/#organization` },
      },
      {
        '@type': 'SoftwareApplication',
        name: '4B Platform',
        url: siteUrl,
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'Web',
        description,
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'VND',
        },
      },
    ],
  };
}
