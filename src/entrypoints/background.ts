import OCRClient from "ya-ocr";

import { sendMessage } from "@/utils/messaging";

const MENU_ITEM_ID = "ya-translate-image";

const client = new OCRClient({
  withTranslate: true,
  translateLang: "ru",
  headers: {
    "Access-Control-Allow-Origin": "*",
  },
});
const cachedImages = new Map<string, string>();

function toBase64(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary);
}

async function getTranslatedImage(isTranslatedImage: boolean, src: string) {
  if (isTranslatedImage) {
    return undefined;
  }

  if (cachedImages.has(src)) {
    return cachedImages.get(src);
  }

  const res = await client.scanByUrl(src);
  const newSrc = `data:image/svg+xml;base64,${toBase64(res.svg as string)}`;
  cachedImages.set(src, newSrc);
  return newSrc;
}

const isInvalidSrc = (src: string) => {
  return ["blob:", "file:", "data:"].some((proto) => src.startsWith(proto));
};

async function translateImgBySrc(tabId: number, src: string) {
  const isTranslatedImage = await sendMessage("isTranslatedImage", src, tabId);
  if (isInvalidSrc(src) && !isTranslatedImage) {
    return console.error(
      "Blob images can't be translated. Please use a direct image URL.",
    );
  }

  const newSrc = await getTranslatedImage(isTranslatedImage, src);
  await sendMessage(
    "translateImagesBySrc",
    {
      src,
      newSrc,
    },
    tabId,
  );

  return true;
}

async function onClickHandler(
  info: Browser.contextMenus.OnClickData,
  tab?: Browser.tabs.Tab,
) {
  if (info.menuItemId !== MENU_ITEM_ID || !tab?.id || !info.srcUrl) {
    return;
  }

  try {
    await sendMessage("ping", undefined, tab.id);
  } catch {
    await browser.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["/content-scripts/content.js"],
    });
  }

  await translateImgBySrc(tab.id, info.srcUrl);
}

export default defineBackground(() => {
  void initExtensionFetch();
  browser.contextMenus.create({
    id: MENU_ITEM_ID,
    title: "Toggle image translate",
    contexts: ["image"],
  });

  browser.contextMenus.onClicked.addListener(onClickHandler);
});
