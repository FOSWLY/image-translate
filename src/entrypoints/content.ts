import { onMessage } from "@/utils/messaging";

const originalSrcMap = new Map();

export default defineContentScript({
  registration: "runtime",
  main() {
    console.log("Hello content.");
    onMessage("ping", () => ({ ok: true }));

    onMessage("isTranslatedImage", (message) => {
      const src = message.data;
      return (
        document.querySelectorAll<HTMLImageElement>(
          `img[src="${src}"][data-ya-translated="true"]`,
        ).length > 0
      );
    });

    onMessage("translateImagesBySrc", (message) => {
      const data = message.data;
      const images = document.querySelectorAll<HTMLImageElement>(
        `img[src="${data.src}"]`,
      );
      for (const img of images) {
        const isTranslated = img.dataset.yaTranslated === "true";
        if (!isTranslated) {
          originalSrcMap.set(img, data.src);
        }

        img.src = isTranslated ? originalSrcMap.get(img) : data.newSrc;
        img.dataset.yaTranslated = String(!isTranslated);
        if (isTranslated && originalSrcMap.has(img)) {
          originalSrcMap.delete(img);
        }
      }
    });
  },
});
