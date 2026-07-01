export type Chapter = {
  slug: string;
  title: string;
  available: boolean;
};

export type GuideImage = {
  src: string;
  alt: string;
};

export type ContentBlock =
  | {
      type: "lead" | "paragraph";
      text: string;
    }
  | {
      type: "callout";
      variant: "example" | "tip" | "warning";
      title?: string;
      text: string;
      href?: string;
      linkLabel?: string;
    }
  | {
      type: "bulletedList" | "numberedList" | "todoList";
      items: string[];
    }
  | {
      type: "image";
      src: string;
      alt?: string;
    }
  | {
      type: "toggle";
      title: string;
      text?: string;
    }
  | {
      type: "rawTable";
      text: string;
    }
  | {
      type: "steps";
      title: string;
      items: string[];
    }
  | {
      type: "checklist";
      title?: string;
      items: string[];
    }
  | {
      type: "quote";
      text: string;
      byline?: string;
      authorName?: string;
      authorTitle?: string;
      authorImage?: GuideImage;
    }
  | {
      type: "table";
      columns: string[];
      rows: string[][];
    }
  | {
      type: "pathway";
      title: string;
      items: string[];
      cta: string;
    }
  | {
      type: "related";
      previous: string;
      next: string;
    };

export type GuideSection = {
  id: string;
  eyebrow?: string;
  title: string;
  headingLevel?: 2 | 3;
  image?: GuideImage;
  blocks: ContentBlock[];
  children?: GuideSection[];
};

export type GuideChapter = {
  slug: string;
  title: string;
  subtitle?: string;
  updatedAt?: string;
  readTime?: string;
  coverImage?: GuideImage;
  blocks?: ContentBlock[];
  sections: GuideSection[];
};

export type GuideNavigationItem = Chapter & {
  active?: boolean;
};
