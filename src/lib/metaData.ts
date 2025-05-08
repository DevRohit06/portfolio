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
  title: "Hey, I'm Rohit Kushwaha | AI Enthusiast & Creative Developer",
  description:
    "Hi there! I'm Rohit, crafting digital vibes with AI and modern tech.{n}I love building smart, intuitive experiences that merge AI with React, Svelte, and Node.js.{nMd}When I'm not coding, I'm exploring how human creativity and artificial intelligence can create something amazing together.",
};
export const mainMetaData = metaDataSchema.parse(_mainMetaData);

const _projectMetaData: MetaDataInput = {
  title: "Cool stuff I've built{n}along the way",
  description:
    "Every project here tells a story about a problem I wanted to solve.{nMd}Dig in to see how I've tackled interesting challenges and what I've learned from them!",
};
export const projectMetaData: MetaData = metaDataSchema.parse(_projectMetaData);

const _blogMetaData: MetaDataInput = {
  title: "Learning, Building, and{nSm}Documenting",
  description:
    "Welcome to my digital garden! Here I share what I'm learning, building, and thinking about.{nSm}Join me as I navigate the ups and downs of development and share the cool stuff I discover.",
};
export const blogMetaData: MetaData = metaDataSchema.parse(_blogMetaData);
