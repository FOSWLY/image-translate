import { onMessage } from "@/utils/messaging";

type ImageData = { src: string; srcset: string };

const originalSrcMap = new WeakMap<HTMLImageElement, ImageData>();

function getImagesBySrc(src: string): HTMLImageElement[] {
  return Array.from(document.images).filter(
    (img) => img.src === src || img.currentSrc === src,
  );
}

function disableImgTranslate(img: HTMLImageElement) {
  const originalSrc = originalSrcMap.get(img);
  if (!originalSrc) {
    return;
  }

  const { src, srcset } = originalSrc;
  img.src = src;
  img.srcset = srcset;
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

  originalSrcMap.set(img, { src, srcset: img.srcset });
  img.src = newSrc;
  img.srcset = "";
  img.dataset.yaTranslated = "true";
}

function getImageBlob(img: HTMLImageElement): Promise<Blob | null> {
  const canvas = document.createElement("canvas");
  // biome-ignore lint/style/noNonNullAssertion: trust me
  const ctx = canvas.getContext("2d")!;
  const rect = img.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
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

      try {
        return await getImageBlob(img);
      } catch {
        return null;
      }
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
