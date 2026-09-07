import { THEME_LIST } from "@/theme/themes";
import { COLOR_TOKENS, METRIC_TOKENS } from "@/theme/tokens";
import { DEFAULT_FONT_ID, FONT_CHOICES } from "@/theme/fontNames";

function luminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  const ch = [n >> 16, (n >> 8) & 255, n & 255].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
}
function contrast(a: string, b: string): number {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

describe("themes", () => {
  it("ships exactly the three planned themes", () => {
    expect(THEME_LIST.map((t) => t.id)).toEqual(["chicago", "luna", "slate"]);
  });

  it.each(THEME_LIST.map((t) => [t.id, t] as const))("%s defines every token", (_id, theme) => {
    for (const k of COLOR_TOKENS) expect(typeof theme.color[k]).toBe("string");
    for (const k of METRIC_TOKENS) expect(typeof theme.metric[k]).toBe("number");
    expect(theme.metric.tap).toBeGreaterThanOrEqual(44);
  });

  it.each(THEME_LIST.map((t) => [t.id, t] as const))("%s meets 4.5:1 contrast on text and title bars", (_id, theme) => {
    expect(contrast(theme.color.text, theme.color.paper)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(theme.color.text, theme.color.face)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(theme.color.titleText, theme.color.titleA)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(theme.color.highlightText, theme.color.highlight)).toBeGreaterThanOrEqual(4.5);
  });
});

describe("typeface choices", () => {
  it("offers the bundled face and a system fallback", () => {
    expect(FONT_CHOICES.map((f) => f.id)).toEqual(["plex", "system"]);
    expect(DEFAULT_FONT_ID).toBe("plex");
  });

  it("the system choice declares no font family, so the platform face is used", () => {
    const system = FONT_CHOICES.find((f) => f.id === "system");
    expect(system?.family).toBeUndefined();
    expect(system?.bold).toBeUndefined();
  });
});
