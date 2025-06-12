"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roadmapSchema = void 0;
const zod_1 = require("zod");
const typeOfLinkEnum = zod_1.z.enum([
    "course",
    "single_video",
    "documentation",
    "pdf",
    "book",
    "tutorial",
    "practice",
    "project",
    "article",
    "tool",
    "playlist",
]);
const itemSchema = zod_1.z.object({
    title: zod_1.z.string(),
    link: zod_1.z.string().nullable().optional(),
    duration: zod_1.z.string(),
    type_of_link: typeOfLinkEnum,
    completed: zod_1.z.boolean().default(false),
});
const categorySchema = zod_1.z.object({
    category_title: zod_1.z.string(),
    items: zod_1.z.array(itemSchema),
});
const stepSchema = zod_1.z.object({
    step_number: zod_1.z.number(),
    step_title: zod_1.z.string(),
    description: zod_1.z.string(),
    link: zod_1.z.string().nullable().optional(),
    completed: zod_1.z.boolean().default(false),
    categories: zod_1.z.array(categorySchema),
});
exports.roadmapSchema = zod_1.z.object({
    title: zod_1.z.string(),
    introduction: zod_1.z.string(),
    steps: zod_1.z.array(stepSchema),
});
