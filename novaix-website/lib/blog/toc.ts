export type TocItem = { id: string; text: string; level: 2 | 3 };

/**
 * Bỏ dấu tiếng Việt, chuyển đ/Đ -> d/D trước NFD, thường hóa, thay ký tự đặc biệt bằng gạch nối.
 */
export function slugify(input: string): string {
  if (!input) return "";

  let str = input.trim();
  // Xử lý đ/Đ riêng trước vì NFD không tách được đ thành d
  str = str.replace(/đ/g, "d").replace(/Đ/g, "D");
  // Normalize NFD để tách các dấu thanh ra khỏi ký tự gốc
  str = str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  // Thường hóa và thay thế khoảng trắng/ký tự không thuộc a-z0-9 bằng gạch nối
  str = str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  return str;
}

/**
 * Rút mục lục từ HTML ĐÃ LÀM SẠCH và CHÈN `id` neo vào các thẻ h2, h3.
 * Chỉ H2 và H3 được đưa vào danh sách mục lục `toc`. H4 vẫn nhận `id` nếu có nhưng không liệt kê.
 */
export function extractToc(html: string): { html: string; toc: TocItem[] } {
  const toc: TocItem[] = [];
  const usedIds = new Map<string, number>();

  // Regex tìm các thẻ h2, h3, h4.
  // Cờ `s` để `.` khớp cả ký tự xuống dòng — trình soạn thảo hay xuống dòng
  // bên trong heading, thiếu cờ này thì heading đó mất khỏi mục lục.
  const headingRegex = /<h([234])([^>]*)>(.*?)<\/h\1>/gis;

  const newHtml = html.replace(
    headingRegex,
    (_match, levelStr, attribs, content) => {
      const level = parseInt(levelStr, 10) as 2 | 3 | 4;
      // Bỏ các tag HTML bên trong content để lấy plain text
      const plainText = content.replace(/<[^>]+>/g, "").trim();
      if (!plainText) return _match;

      // Kiểm tra nếu thẻ đã có id sẵn
      const idMatch = attribs.match(/id=["']([^"']+)["']/i);
      let id = idMatch ? idMatch[1] : "";

      if (!id) {
        let baseSlug = slugify(plainText);
        if (!baseSlug) baseSlug = `section-${toc.length + 1}`;

        const count = usedIds.get(baseSlug) || 0;
        if (count === 0) {
          id = baseSlug;
          usedIds.set(baseSlug, 1);
        } else {
          id = `${baseSlug}-${count + 1}`;
          usedIds.set(baseSlug, count + 1);
        }

        // Chèn id vào attribs
        attribs = ` id="${id}"${attribs}`;
      } else {
        usedIds.set(id, (usedIds.get(id) || 0) + 1);
      }

      if (level === 2 || level === 3) {
        toc.push({ id, text: plainText, level });
      }

      return `<h${level}${attribs}>${content}</h${level}>`;
    }
  );

  return { html: newHtml, toc };
}
