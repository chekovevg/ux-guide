const mobileContentsSlugOrder = [
  "intro",
  "zachem-tratit-vremya-na-issledovaniya",
  "soprotivlenie-issledovaniyam-i-kak-s-etim-rabotat",
  "ob-udalennyh-issledovaniyah",
  "gotovimsya-k-issledovaniyu",
  "chek-list-o-chem-esche-podumat-pered-zapuskom",
  "auditoriya-kak-vybrat-i-poschitat-nuzhnoe-kolichestvo",
  "metody-kak-vybrat-i-zapustit",
  "prototipy-kakie-byvayut-i-kak-podgotovit-k-testirovaniyu",
  "kak-rabotat-s-rezultatami",
  "chto-uchest-prezhde-chem-delat-vyvody",
  "kak-vystroit-vse-tak-chtoby-pomogat-issledovaniyami-biznesu",
];

const mobileContentsOrderBySlug = new Map(
  mobileContentsSlugOrder.map((slug, index) => [slug, index]),
);

export function getNavigationLabel(slug, fallback) {
  return fallback;
}

export function getMobileContentsItems(navigation) {
  return [...navigation]
    .sort((left, right) => {
      const leftIndex = mobileContentsOrderBySlug.get(left.slug);
      const rightIndex = mobileContentsOrderBySlug.get(right.slug);

      return (
        (leftIndex ?? Number.MAX_SAFE_INTEGER) -
        (rightIndex ?? Number.MAX_SAFE_INTEGER)
      );
    })
    .map((item) => ({
      ...item,
      active: item.active === true,
      href: item.available ? `/guide/${item.slug}` : "#",
      label: getNavigationLabel(item.slug, item.title),
    }));
}
