import { onMessage } from "@/utils/messaging";

const originalSrcMap = new WeakMap<HTMLImageElement, string>();

function getImagesBySrc(src: string): HTMLImageElement[] {
  return Array.from(document.images).filter((img) => img.src === src);
}

function disableImgTranslate(img: HTMLImageElement) {
  const originalSrc = originalSrcMap.get(img);
  if (!originalSrc) {
    return;
  }

  img.setAttribute("src", originalSrc);
  img.dataset.yaTranslated = "false";
  originalSrcMap.delete(img);
}

function enableImgTranslate(
  img: HTMLImageElement,
  src: string,
  newSrc?: string,
) {
  if (!newSrc) {
    return;
  }

  originalSrcMap.set(img, src);
  img.src = newSrc;
  img.dataset.yaTranslated = "true";
}

function getImageBlob(img: HTMLImageElement): Promise<Blob | null> {
  const canvas = document.createElement("canvas");
  // biome-ignore lint/style/noNonNullAssertion: trust me
  const ctx = canvas.getContext("2d")!;
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  ctx.drawImage(img, 0, 0);
  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    });
  });
}

export default defineContentScript({
  registration: "runtime",
  main() {
    onMessage("ping", () => ({ ok: true }));

    onMessage("isTranslatedImage", (message) => {
      const src = message.data;
      return getImagesBySrc(src).some(
        (img) => img.dataset.yaTranslated === "true",
      );
    });

    onMessage("getImageBlob", async (message) => {
      const src = message.data;
      const images = getImagesBySrc(src);
      if (!images.length) {
        return null;
      }

      const img = images[0];
      if (!img) {
        return null;
      }

      return await getImageBlob(img);
    });

    onMessage("translateImagesBySrc", async (message) => {
      const data = message.data;
      const images = getImagesBySrc(data.src);
      for (const img of images) {
        const isTranslated = img.dataset.yaTranslated === "true";
        if (isTranslated) {
          disableImgTranslate(img);
          continue;
        }

        enableImgTranslate(img, data.src, data.newSrc);
      }
    });
  },
});
