const guideCopy = {
  ru: {
    pageContents: "На этой странице",
    search: {
      label: "Поиск по гайду",
      placeholder: "Поиск по гайду…",
      close: "Закрыть поиск",
      suggested: "Предлагаемые главы",
      chapters: "Главы",
      sections: "Разделы",
      textMatches: "Совпадения в тексте",
      noResults: "Ничего не найдено",
    },
    menu: {
      title: "Главы гайда",
      close: "Закрыть навигацию",
    },
    checklist: {
      progress: (done: number, total: number) => `${done} из ${total}`,
      complete: "Все пункты отмечены",
      reset: "Сбросить",
    },
    table: {
      scrollRegion: "Прокручиваемая таблица",
    },
  },
  en: {
    pageContents: "On this page",
    search: {
      label: "Search the guide",
      placeholder: "Search the guide…",
      close: "Close search",
      suggested: "Suggested chapters",
      chapters: "Chapters",
      sections: "Sections",
      textMatches: "Text matches",
      noResults: "No results",
    },
    menu: {
      title: "Guide chapters",
      close: "Close navigation",
    },
    checklist: {
      progress: (done: number, total: number) => `${done} of ${total}`,
      complete: "All items checked",
      reset: "Reset",
    },
    table: {
      scrollRegion: "Scrollable table",
    },
  },
} as const;

export type GuideCopyLocale = keyof typeof guideCopy;

export function getGuideCopy(locale: GuideCopyLocale) {
  return guideCopy[locale];
}
