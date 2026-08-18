import sanitizeHtml from "sanitize-html";

export const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "h2",
    "h3",
    "h4", // KHÔNG h1 - h1 do trang render
    "p",
    "br",
    "hr",
    "strong",
    "b",
    "em",
    "i",
    "u",
    "s",
    "ul",
    "ol",
    "li",
    "blockquote",
    // Trình soạn thảo có nút chèn khối code (toggleCodeBlock của Tiptap) sinh ra
    // <pre><code>. Thiếu hai thẻ này thì bấm nút xong, lưu lại là mất hết định dạng.
    "pre",
    "code",
    "a",
    "span",
    "div",
    "table",
    "thead",
    "tbody",
    "tr",
    "th",
    "td",
    "img",
    "figure",
    "figcaption",
  ],
  allowedAttributes: {
    a: ["href", "title", "target", "rel", "class", "style"],
    img: ["src", "alt", "width", "height", "class", "style"],
    h2: ["id", "class", "style"],
    h3: ["id", "class", "style"],
    h4: ["id", "class", "style"],
    p: ["class", "style"],
    span: ["class", "style"],
    div: ["class", "style"],
    td: ["colspan", "rowspan", "class", "style"],
    pre: ["class"],
    code: ["class"],
    th: ["colspan", "rowspan", "class", "style"],
  },
  allowedStyles: {
    "*": {
      "text-align": [/^left$/, /^right$/, /^center$/, /^justify$/],
      "font-size": [/.*/],
      "font-weight": [/.*/],
      "text-transform": [/.*/],
      "color": [/.*/],
    },
  },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowedSchemesAppliedToAttributes: ["href", "src"],
  allowProtocolRelative: false, // Chặn //evil.com
  disallowedTagsMode: "discard",
  transformTags: {
    a: (tagName, attribs) => {
      const href = attribs.href || "";
      const isExternal =
        href.startsWith("http://") ||
        href.startsWith("https://") ||
        href.startsWith("//");
      return {
        tagName,
        attribs: isExternal
          ? {
              ...attribs,
              target: "_blank",
              rel: "noopener noreferrer nofollow",
            }
          : attribs,
      };
    },
  },
};

/**
 * Làm sạch HTML từ người soạn bài.
 * Trả về HTML đã sạch và danh sách các thẻ/thuộc tính đã bị loại bỏ.
 */
export function sanitizeArticleHtml(raw: string): {
  html: string;
  removedTags: string[];
} {
  const removedTagsSet = new Set<string>();

  // Thu thập các thẻ không nằm trong allowlist
  const rawTagMatches = raw.match(/<\/?([a-z0-9]+)[^>]*>/gi) || [];
  const allowedSet = new Set((SANITIZE_OPTIONS.allowedTags || []) as string[]);

  for (const tagMatch of rawTagMatches) {
    const tagNameMatch = tagMatch.match(/<\/?([a-z0-9]+)/i);
    if (tagNameMatch) {
      const tag = tagNameMatch[1].toLowerCase();
      if (!allowedSet.has(tag)) {
        removedTagsSet.add(tag);
      }
    }
  }

  if (/style\s*=/i.test(raw)) {
    removedTagsSet.add("style attribute");
  }
  if (/on[a-z]+\s*=/i.test(raw)) {
    removedTagsSet.add("event handler (onerror/onclick...)");
  }

  const cleanHtml = sanitizeHtml(raw, SANITIZE_OPTIONS);

  return {
    html: cleanHtml,
    removedTags: Array.from(removedTagsSet),
  };
}

/**
 * Kiểm tra xem các thẻ <img> có trỏ về host được phép (R2 CDN hoặc local /uploads/) hay không.
 */
/** Host được phép chứa ảnh bài viết: CDN R2 của mình, cộng localhost khi chạy dev. */
function allowedImageHosts(): Set<string> {
  const hosts = new Set(["localhost", "127.0.0.1"]);
  const r2Url = process.env.R2_PUBLIC_URL;
  if (r2Url) {
    try {
      hosts.add(new URL(r2Url).hostname);
    } catch {
      // R2_PUBLIC_URL sai định dạng thì coi như không có host nào được thêm.
    }
  }
  return hosts;
}

export function assertLocalImages(html: string): void {
  const hosts = allowedImageHosts();
  const imgMatches = html.match(/<img[^>]+src=["']([^"']+)["']/gi) || [];

  for (const imgTag of imgMatches) {
    const srcMatch = imgTag.match(/src=["']([^"']+)["']/i);
    const src = srcMatch?.[1];
    if (!src) continue;

    // Đường dẫn tương đối do LocalStorageDriver sinh ra.
    if (src.startsWith("/uploads/")) continue;

    // So khớp theo hostname, KHÔNG dùng startsWith trên cả URL:
    // "https://cdn.oalpha.vn.ke-gian.com/x.jpg" vẫn qua được phép so sánh tiền tố.
    let hostname: string;
    try {
      hostname = new URL(src).hostname;
    } catch {
      throw new Error(`Ảnh (${src}) có địa chỉ không hợp lệ.`);
    }

    if (!hosts.has(hostname)) {
      throw new Error(
        `Ảnh (${src}) không nằm trên hệ thống lưu trữ của OAlpha. Vui lòng upload ảnh trực tiếp qua trình soạn thảo.`
      );
    }
  }
}

/**
 * Bọc mỗi <table> trong nội dung bài viết vào một khung cuộn ngang riêng.
 *
 * Bảng rộng hơn màn hình điện thoại làm tràn cả trang: người đọc vuốt ngang là
 * kéo lệch toàn bộ bố cục, còn nếu body chặn tràn thì phần bảng bị cắt mất và
 * không cách nào xem được. Bọc lại thì chỉ riêng bảng cuộn, trang đứng yên.
 *
 * Chạy lúc render chứ không lúc lưu, để các bài viết đã có trong database cũng
 * được sửa mà không phải lưu lại từng bài.
 */
export function wrapResponsiveTables(html: string): string {
  if (!html.includes("<table")) return html;
  return html.replace(
    /<table(\s[^>]*)?>([\s\S]*?)<\/table>/gi,
    (match) => `<div class="table-scroll">${match}</div>`
  );
}
