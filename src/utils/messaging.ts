import { defineExtensionMessaging } from "@webext-core/messaging";

type ImageDataProps = {
  src: string;
  newSrc?: string;
};

type ProtocolMap = {
  ping(): {
    ok: true;
  };
  translateImagesBySrc(data: ImageDataProps): void;
  isTranslatedImage(src: string): boolean;
  getImageBlob(src: string): Promise<Blob | null>;
  translateError(message: string): void;
};

export const { sendMessage, onMessage } =
  defineExtensionMessaging<ProtocolMap>();
