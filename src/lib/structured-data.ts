import type { EstateDetailView } from "@/app/properties/_types/estate-detail.types";
import { routes } from "@/lib/routes";
import { absoluteUrl, siteUrl } from "@/lib/site-url";

/**
 * schema.org graphs for the pages that can earn a rich result.
 *
 * Kept out of the components so the shapes stay comparable and a field only
 * has to be got right once. Everything here is derived from data already on
 * the page — nothing fetches, and nothing is asserted that the page does not
 * actually show, which is what Google's structured-data policy requires.
 */

const ORGANIZATION_ID = `${siteUrl}/#organization`;

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "@id": ORGANIZATION_ID,
    name: "گروه املاک کومه",
    url: siteUrl,
    areaServed: { "@type": "City", name: "قم" },
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    url: siteUrl,
    name: "کومه",
    inLanguage: "fa-IR",
    publisher: { "@id": ORGANIZATION_ID },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: absoluteUrl("/properties?q={search_term_string}"),
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbSchema(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((step, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: step.name,
      item: absoluteUrl(step.path),
    })),
  };
}

/** `Apartment`, `House`… — the closest schema.org type per listing kind. */
const RESIDENCE_TYPE: Record<EstateDetailView["propertyType"], string> = {
  apartment: "Apartment",
  villa: "House",
  land: "LandLot",
  commercial: "LocalBusiness",
  office: "LocalBusiness",
  industrial: "LocalBusiness",
};

/**
 * A listing as `RealEstateListing`.
 *
 * Rent carries two figures in this market — a deposit (رهن) and a monthly rent
 * — which has no single schema.org field, so the deposit becomes the offer
 * price and the monthly rent is expressed as a `UnitPriceSpecification`. A
 * listing with no numeric price gets no `offers` at all rather than a zero:
 * inventing a price is exactly what earns a structured-data penalty.
 */
export function estateListingSchema(detail: EstateDetailView) {
  const url = absoluteUrl(routes.property(detail.id));
  const isRent = detail.dealType === "rent";
  const amount = isRent ? detail.rent?.mortgage : detail.price?.amount;

  const monthlyRent = isRent && detail.rent?.amount
    ? {
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: detail.rent.amount,
          priceCurrency: "IRT",
          unitCode: "MON",
        },
      }
    : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "@id": url,
    url,
    name: detail.title,
    description: detail.description ?? undefined,
    // No `datePosted`: the view model only carries `publishedLabel`, which is
    // a relative phrase ("۳ روز پیش"), not a date this could honestly assert.
    image: detail.media.coverImage ? [detail.media.coverImage] : undefined,
    provider: { "@id": ORGANIZATION_ID },
    about: {
      "@type": RESIDENCE_TYPE[detail.propertyType],
      name: detail.title,
      ...(detail.area
        ? {
            floorSize: {
              "@type": "QuantitativeValue",
              value: detail.area,
              unitCode: "MTK",
            },
          }
        : {}),
      address: {
        "@type": "PostalAddress",
        addressCountry: "IR",
        addressLocality: detail.location.cityName ?? "قم",
        ...(detail.location.districtName
          ? { addressRegion: detail.location.districtName }
          : {}),
        ...(detail.location.addressLabel
          ? { streetAddress: detail.location.addressLabel }
          : {}),
      },
      ...(detail.location.lat && detail.location.lng
        ? {
            geo: {
              "@type": "GeoCoordinates",
              latitude: detail.location.lat,
              longitude: detail.location.lng,
            },
          }
        : {}),
    },
    ...(amount
      ? {
          offers: {
            "@type": "Offer",
            price: amount,
            priceCurrency: "IRT",
            availability: detail.status.isExpired
              ? "https://schema.org/SoldOut"
              : "https://schema.org/InStock",
            ...monthlyRent,
          },
        }
      : {}),
  };
}

export function articleSchema(article: {
  id: string | number;
  title: string;
  summary?: string;
  image?: string;
  publishedAt?: string;
}) {
  const url = absoluteUrl(routes.article(article.id));

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": url,
    url,
    headline: article.title,
    description: article.summary,
    image: article.image ? [article.image] : undefined,
    datePublished: article.publishedAt,
    inLanguage: "fa-IR",
    publisher: { "@id": ORGANIZATION_ID },
  };
}
