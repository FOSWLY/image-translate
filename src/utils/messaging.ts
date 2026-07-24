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
};

export const { sendMessage, onMessage } =
  defineExtensionMessaging<ProtocolMap>();
