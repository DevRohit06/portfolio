import { z } from "astro/zod";

const LINE_BREAK = {
  "{n}": " <br /> ",
  "{nSm}": " <br class='max-sm:hidden'/> ",
  "{nMd}": " <br class='max-md:hidden'/> ",
  "{nLg}": " <br class='max-lg:hidden'/> ",
};

interface ParseTextOptions {
  isCleanText?: boolean;
}

const parseText = (text: string, opts?: ParseTextOptions): string => {
  let newText = text;
  Object.keys(LINE_BREAK).forEach((key) => {
    newText = newText.replaceAll(
      key,
      opts?.isCleanText ? " " : LINE_BREAK[key as keyof typeof LINE_BREAK]
    );
  });
  return newText;
};

const metaDataSchema = z
  .object({ title: z.string(), description: z.string() })
  .transform((value) => ({
    title: parseText(value.title, { isCleanText: true }),
    htmlTitle: parseText(value.title),
    description: parseText(value.description, { isCleanText: true }),
    htmlDescription: parseText(value.description),
  }));

type MetaData = z.output<typeof metaDataSchema>;
type MetaDataInput = z.input<typeof metaDataSchema>;

const _mainMetaData: MetaDataInput = {
  title: "Hey, I'm Rohit Kushwaha | Full-Stack & AI Tooling Engineer",
  description:
    "I'm Rohit, a full-stack engineer who ships end to end.{n}Svelte and React on the front, Python and Node on the back, and a lot of AI developer tooling in between.{nMd}I contribute to open-source AI-agent platforms and build my own tools like discli and Lito.",
};
export const mainMetaData = metaDataSchema.parse(_mainMetaData);

const _projectMetaData: MetaDataInput = {
  title: "Things I've built{n}and shipped",
  description:
    "Every project here started as a problem I wanted to solve, from AI dev tools to docs engines.{nMd}Dig in to see how I approached each one and what I learned along the way.",
};
export const projectMetaData: MetaData = metaDataSchema.parse(_projectMetaData);

const _blogMetaData: MetaDataInput = {
  title: "Learning, Building, and{nSm}Documenting",
  description:
    "Welcome to my digital garden! Here I share what I'm learning, building, and thinking about.{nSm}Join me as I navigate the ups and downs of development and share the cool stuff I discover.",
};
export const blogMetaData: MetaData = metaDataSchema.parse(_blogMetaData);
