import { z } from "zod";

const typeOfLinkEnum = z.enum(["course", "single_video", "article", "project"]);

const itemSchema = z.object({
  title: z.string(),
  link: z.string().nullable(),
  duration: z.string(),
  type_of_link: typeOfLinkEnum,
  completed: z.boolean().default(false),
});

const categorySchema = z.object({
  category_title: z.string(),
  items: z.array(itemSchema),
});

const stepSchema = z.object({
  step_number: z.number(),
  step_title: z.string(),
  description: z.string(),
  link: z.string().nullable(),
  completed: z.boolean().default(false),
  categories: z.array(categorySchema),
});

export const roadmapSchema = z.object({
  title: z.string(),
  introduction: z.string(),
  steps: z.array(stepSchema),
});
