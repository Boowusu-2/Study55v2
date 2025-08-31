import Head from "next/head";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
}

export default function SEO({
  title = "study.ai - AI-Powered Quiz Generator",
  description = "Transform your documents into interactive quizzes with AI. Upload PDFs, DOCX, and more to generate personalized quizzes instantly. Perfect for students, teachers, and professionals.",
  keywords = "AI quiz generator, study tools, document to quiz, PDF quiz, learning platform, educational technology, AI-powered learning, quiz maker, study assistant",
  image = "/og-image.png",
  url = "https://study.ai",
  type = "website",
  author = "study.ai",
  publishedTime,
  modifiedTime,
  section = "Education",
  tags = ["AI", "Education", "Quiz", "Learning", "Technology"],
}: SEOProps) {
  const fullTitle =
    title === "study.ai - AI-Powered Quiz Generator"
      ? title
      : `${title} | study.ai`;

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />

      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="study.ai" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:site" content="@studyai" />
      <meta name="twitter:creator" content="@studyai" />

      {/* Article Meta Tags (for blog posts) */}
      {type === "article" && (
        <>
          <meta property="article:published_time" content={publishedTime} />
          <meta property="article:modified_time" content={modifiedTime} />
          <meta property="article:section" content={section} />
          {tags.map((tag, index) => (
            <meta key={index} property="article:tag" content={tag} />
          ))}
        </>
      )}

      {/* Additional Meta Tags */}
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, maximum-scale=5"
      />
      <meta name="theme-color" content="#8B5CF6" />
      <meta name="msapplication-TileColor" content="#8B5CF6" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="study.ai" />

      {/* Canonical URL */}
      <link rel="canonical" href={url} />

      {/* Favicon and App Icons */}
      <link rel="icon" href="/favicon.ico" />
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href="/apple-touch-icon.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href="/favicon-32x32.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href="/favicon-16x16.png"
      />
      <link rel="manifest" href="/site.webmanifest" />

      {/* Preconnect to external domains for performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link rel="preconnect" href="https://www.google-analytics.com" />
      <link rel="preconnect" href="https://www.googletagmanager.com" />

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "study.ai",
            description: description,
            url: url,
            applicationCategory: "EducationalApplication",
            operatingSystem: "Web Browser",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
              description: "Free tier with 3 quiz generations",
            },
            author: {
              "@type": "Organization",
              name: "study.ai",
              url: url,
            },
            publisher: {
              "@type": "Organization",
              name: "study.ai",
              url: url,
            },
            featureList: [
              "AI-powered quiz generation",
              "Document upload and processing",
              "Multiple AI providers",
              "Real-time question generation",
              "Progressive loading",
              "Mobile responsive design",
            ],
            screenshot: image,
            softwareVersion: "1.0.0",
            datePublished: "2024-01-01",
            dateModified: "2025-08-31",
          }),
        }}
      />

      {/* Additional Structured Data for Organization */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "study.ai",
            url: url,
            logo: `${url}/logo.png`,
            sameAs: [
              "https://twitter.com/studyai",
              "https://linkedin.com/company/studyai",
              "https://github.com/studyai",
            ],
            contactPoint: {
              "@type": "ContactPoint",
              contactType: "customer service",
              email: "support@study.ai",
              availableLanguage: "English",
            },
          }),
        }}
      />
    </Head>
  );
}
