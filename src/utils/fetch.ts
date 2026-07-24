const REPLACED_HOST = "https://translate.yandex.ru";

export async function initExtensionFetch(): Promise<void> {
  await browser.declarativeNetRequest.updateSessionRules({
    removeRuleIds: [1],
    addRules: [
      {
        id: 1,
        priority: 1,
        action: {
          type: "modifyHeaders",
          requestHeaders: [
            {
              header: "origin",
              operation: "set",
              value: REPLACED_HOST,
            },
            {
              header: "referer",
              operation: "set",
              value: `${REPLACED_HOST}/`,
            },
          ],
        },
        condition: {
          requestDomains: ["translate.yandex.net", "translate.yandex.ru"],
          resourceTypes: ["xmlhttprequest"],
          tabIds: [browser.tabs.TAB_ID_NONE],
        },
      },
    ],
  } satisfies Browser.declarativeNetRequest.UpdateRuleOptions);
}
