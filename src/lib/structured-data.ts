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

/**
 * A branch office, as a place Google can put on a map.
 *
 * This is the richest page the site has for local search — it carries a street
 * address, coordinates and a phone number, which is exactly what a local result
 * is built from. `RealEstateAgent` is a subtype of `LocalBusiness`, so it earns
 * the same treatment while saying what the business actually is.
 *
 * Fields are omitted rather than guessed: a branch with no coordinates gets no
 * `geo`, because inventing one would put a pin in the wrong street.
 */
export function branchSchema(branch: {
  numericId: number;
  name: string;
  address?: string;
  phone?: string;
  lat?: number;
  lng?: number;
  coverImage?: string;
  description?: string;
  city?: { name: string };
  workingHours?: { days: string; hours: string; closed?: boolean }[];
}) {
  const url = absoluteUrl(routes.branch(branch.numericId));

  return {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "@id": url,
    url,
    name: branch.name,
    description: branch.description,
    image: branch.coverImage ? [branch.coverImage] : undefined,
    telephone: branch.phone,
    address: branch.address
      ? {
          "@type": "PostalAddress",
          streetAddress: branch.address,
          addressLocality: branch.city?.name ?? "قم",
          addressCountry: "IR",
        }
      : undefined,
    geo:
      branch.lat !== undefined && branch.lng !== undefined
        ? {
            "@type": "GeoCoordinates",
            latitude: branch.lat,
            longitude: branch.lng,
          }
        : undefined,
    // Only the days the branch is actually open; a closed row is not an
    // opening hour, and listing it would advertise the opposite of the truth.
    openingHours: branch.workingHours
      ?.filter((entry) => !entry.closed && entry.hours)
      .map((entry) => `${entry.days} ${entry.hours}`),
    parentOrganization: { "@id": ORGANIZATION_ID },
    inLanguage: "fa-IR",
  };
}

/** An agent, as a person who works for the organization. */
export function agentSchema(agent: {
  id: number;
  name: string;
  photo?: string;
  title?: string;
  phone?: string;
  branchName?: string;
}) {
  const url = absoluteUrl(routes.agent(agent.id));

  return {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "@id": url,
    url,
    name: agent.name,
    image: agent.photo ? [agent.photo] : undefined,
    jobTitle: agent.title,
    telephone: agent.phone,
    worksFor: agent.branchName
      ? { "@type": "Organization", name: agent.branchName }
      : { "@id": ORGANIZATION_ID },
    inLanguage: "fa-IR",
  };
}

/**
 * The home page's FAQ.
 *
 * Every answer is already in the prerendered HTML, which is the condition
 * Google sets: `FAQPage` describes content the visitor can see, not content
 * added for the crawler.
 */
export function faqSchema(items: { question: string; answer: string }[]) {
  if (items.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}
