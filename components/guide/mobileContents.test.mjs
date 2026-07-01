import assert from "node:assert/strict";
import test from "node:test";

import { getMobileContentsItems } from "./mobileContents.mjs";

const navigation = [
  { slug: "intro", title: "Source intro", available: true },
  {
    slug: "zachem-tratit-vremya-na-issledovaniya",
    title: "Source why research",
    available: true,
  },
  {
    slug: "soprotivlenie-issledovaniyam-i-kak-s-etim-rabotat",
    title: "Source resistance",
    available: true,
    active: true,
  },
  {
    slug: "ob-udalennyh-issledovaniyah",
    title: "Source remote research",
    available: true,
  },
  {
    slug: "gotovimsya-k-issledovaniyu",
    title: "Source study setup",
    available: true,
  },
  {
    slug: "chek-list-o-chem-esche-podumat-pered-zapuskom",
    title: "Source checklist",
    available: true,
  },
  {
    slug: "auditoriya-kak-vybrat-i-poschitat-nuzhnoe-kolichestvo",
    title: "Source audience",
    available: true,
  },
  {
    slug: "metody-kak-vybrat-i-zapustit",
    title: "Source methods",
    available: true,
  },
  {
    slug: "prototipy-kakie-byvayut-i-kak-podgotovit-k-testirovaniyu",
    title: "Source prototypes",
    available: true,
  },
  {
    slug: "kak-rabotat-s-rezultatami",
    title: "Source results",
    available: true,
  },
  {
    slug: "chto-uchest-prezhde-chem-delat-vyvody",
    title: "Source conclusions",
    available: true,
  },
  {
    slug: "kak-vystroit-vse-tak-chtoby-pomogat-issledovaniyami-biznesu",
    title: "Source sharing",
    available: true,
  },
];

test("builds the mobile contents list in the guide chapter order", () => {
  const items = getMobileContentsItems(navigation);

  assert.deepEqual(
    items.map((item) => item.label),
    [
      "Source intro",
      "Source why research",
      "Source resistance",
      "Source remote research",
      "Source study setup",
      "Source checklist",
      "Source audience",
      "Source methods",
      "Source prototypes",
      "Source results",
      "Source conclusions",
      "Source sharing",
    ],
  );
});

test("marks only the current chapter as active in mobile contents", () => {
  const items = getMobileContentsItems(navigation);
  const activeItems = items.filter((item) => item.active);

  assert.equal(activeItems.length, 1);
  assert.equal(activeItems[0].label, "Source resistance");
  assert.equal(
    activeItems[0].href,
    "/guide/soprotivlenie-issledovaniyam-i-kak-s-etim-rabotat",
  );
});

test("builds localized mobile contents hrefs from a guide base path", () => {
  const items = getMobileContentsItems(navigation, "/en/guide");
  const activeItem = items.find((item) => item.active);

  assert.equal(
    activeItem.href,
    "/en/guide/soprotivlenie-issledovaniyam-i-kak-s-etim-rabotat",
  );
});
