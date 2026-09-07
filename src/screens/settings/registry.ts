import type { ComponentType } from "react";
import { CategoriesPanel } from "./panels/CategoriesPanel";
import { CustomFieldsPanel } from "./panels/CustomFieldsPanel";
import { DisplayPanel } from "./panels/DisplayPanel";
import { JournalQuestionsPanel } from "./panels/JournalQuestionsPanel";

/**
 * To add a settings section:
 *   1. Drop a self-contained panel in ./panels (it loads and saves its own data).
 *   2. Add one entry below.
 * The Control Panel grid, its search box and the item counts all read from this array.
 */
export interface SettingsSection {
  id: string;
  icon: string;
  title: string;
  /** Shown under the title in the opened panel, and searched. */
  description: string;
  group: string;
  /** Extra search terms not present in the title or description. */
  keywords?: string[];
  /** Table to head-count for the tile's "n items" label. Omit for sections with no list. */
  countTable?: string;
  Panel: ComponentType;
}

export const SETTINGS_SECTIONS: SettingsSection[] = [
  {
    id: "categories",
    icon: "🏷️",
    title: "Goal Categories",
    description: "Colour-coded categories used to group and filter goals.",
    group: "Personalization",
    keywords: ["colour", "color", "label", "tag"],
    countTable: "categories",
    Panel: CategoriesPanel,
  },
  {
    id: "journal-questions",
    icon: "💭",
    title: "Journal Questions",
    description: "The reflection prompts on the daily and weekly journal pages.",
    group: "Personalization",
    keywords: ["prompt", "reflection", "daily", "weekly"],
    countTable: "journal_questions",
    Panel: JournalQuestionsPanel,
  },
  {
    id: "custom-fields",
    icon: "🧩",
    title: "Custom Fields",
    description: "Extra fields added to the Task and Goal property dialogs.",
    group: "Personalization",
    keywords: ["field", "property", "task", "goal", "select"],
    countTable: "field_definitions",
    Panel: CustomFieldsPanel,
  },
  {
    id: "display",
    icon: "🎨",
    title: "Display",
    description: "Choose the typeface and the colour scheme.",
    group: "Personalization",
    keywords: ["theme", "colour", "color", "dark", "light", "appearance", "font", "text", "typeface"],
    Panel: DisplayPanel,
  },
];

/** Case-insensitive match across title, description, group and keywords. */
export function sectionMatches(section: SettingsSection, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [section.title, section.description, section.group, ...(section.keywords ?? [])].some((value) =>
    value.toLowerCase().includes(q),
  );
}
