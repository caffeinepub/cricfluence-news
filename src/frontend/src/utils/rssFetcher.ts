export interface FetchedItem {
  title: string;
  description: string;
  imageUrl: string;
  publishedDate: string;
  sourceUrl: string;
  sourceName: string;
  detectedCategory: string;
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function detectCategory(text: string): string {
  const lower = text.toLowerCase();

  if (/cricket|ipl|bcci|test match|odi|t20|rohit|kohli|dhoni/.test(lower)) {
    return "Cricket";
  }
  if (
    /influencer|youtube|youtuber|tiktok|instagram|creator|vlog|viral/.test(
      lower,
    )
  ) {
    return "Influencers";
  }
  if (
    /football|tennis|basketball|fifa|nba|sport|athlete|olympics/.test(lower)
  ) {
    return "Sports";
  }
  if (
    /international|global|world|foreign|\bun\b|nato|europe|america|china|us /.test(
      lower,
    )
  ) {
    return "InternationalNews";
  }
  if (/india|modi|delhi|mumbai|bjp|congress|rupee|election/.test(lower)) {
    return "NationalNews";
  }
  if (
    /accident|incident|crime|disaster|flood|fire|earthquake|killed|injured|crash/.test(
      lower,
    )
  ) {
    return "Incidents";
  }

  return "Cricket";
}

function extractImageUrl(item: Element, rawDescription: string): string {
  // 1. <enclosure url="...">
  const enclosure = item.querySelector("enclosure");
  if (enclosure) {
    const url = enclosure.getAttribute("url");
    if (url && /\.(jpg|jpeg|png|gif|webp)/i.test(url)) return url;
  }

  // 2. <media:content url="..."> — querySelector may not support namespaced
  //    selectors in all environments; iterate children instead
  const allChildren = Array.from(item.children);
  for (const child of allChildren) {
    if (
      child.tagName.toLowerCase().includes("content") &&
      child.tagName.toLowerCase().includes("media")
    ) {
      const url = child.getAttribute("url");
      if (url) return url;
    }
    if (child.tagName.toLowerCase() === "media:content") {
      const url = child.getAttribute("url");
      if (url) return url;
    }
  }

  // Also try getElementsByTagNameNS / getElementsByTagName with various namespace combos
  const mediaContent =
    item.getElementsByTagName("media:content")[0] ||
    item.getElementsByTagName("media:thumbnail")[0];
  if (mediaContent) {
    const url = mediaContent.getAttribute("url");
    if (url) return url;
  }

  // 3. img src from raw description HTML
  const imgMatch = /<img[^>]+src=["']([^"']+)["']/i.exec(rawDescription);
  if (imgMatch?.[1]) return imgMatch[1];

  return "";
}

function getTextContent(item: Element, tagName: string): string {
  const el = item.getElementsByTagName(tagName)[0];
  if (!el) return "";
  return (el.textContent ?? "").trim();
}

function parsePublishedDate(pubDateStr: string): string {
  if (!pubDateStr) return new Date().toISOString().split("T")[0];
  try {
    const d = new Date(pubDateStr);
    if (Number.isNaN(d.getTime()))
      return new Date().toISOString().split("T")[0];
    return d.toISOString().split("T")[0];
  } catch {
    return new Date().toISOString().split("T")[0];
  }
}

export async function fetchRssFeed(
  url: string,
  sourceName: string,
): Promise<FetchedItem[]> {
  const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;

  const response = await fetch(proxyUrl);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch feed "${sourceName}": HTTP ${response.status}`,
    );
  }

  const json = (await response.json()) as { contents?: string };
  const contents = json.contents;
  if (!contents) {
    throw new Error(`No content returned for feed "${sourceName}"`);
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(contents, "text/xml");

  const parserError = doc.querySelector("parsererror");
  if (parserError) {
    // Try HTML parse fallback
    const htmlDoc = parser.parseFromString(contents, "text/html");
    const items = Array.from(htmlDoc.getElementsByTagName("item"));
    if (items.length === 0) {
      throw new Error(
        `Could not parse RSS feed "${sourceName}". Make sure the URL is a valid RSS/XML feed.`,
      );
    }
  }

  const items = Array.from(doc.getElementsByTagName("item")).slice(0, 20);

  if (items.length === 0) {
    return [];
  }

  return items.map((item): FetchedItem => {
    const title = getTextContent(item, "title") || "(No title)";
    const rawDescription = getTextContent(item, "description");
    const description = stripHtml(rawDescription).slice(0, 300);
    const imageUrl = extractImageUrl(item, rawDescription);
    const pubDateStr = getTextContent(item, "pubDate");
    const publishedDate = parsePublishedDate(pubDateStr);
    const sourceUrl = getTextContent(item, "link");
    const detectedCategory = detectCategory(`${title} ${description}`);

    return {
      title,
      description,
      imageUrl,
      publishedDate,
      sourceUrl,
      sourceName,
      detectedCategory,
    };
  });
}
