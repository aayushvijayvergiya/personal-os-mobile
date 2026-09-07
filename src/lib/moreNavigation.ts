import { router } from "expo-router";

type Href = Parameters<typeof router.push>[0];

/**
 * Opens a screen from another tab.
 *
 * Modules under the More tab need two steps. Pushing `/more/<module>` straight from another tab
 * makes that module the *bottom* of the More tab's stack, so the More tab afterwards shows the
 * module instead of its menu and Back has nowhere to go. Neither the stack's `initialRouteName`
 * nor the route's `anchor` changes this, because the stack is built from the resolved link.
 * Switching to `/more` first seeds the stack with the menu; pushing on the next tick lands the
 * module on top of it.
 */
export function openFromTab(href: string): void {
  if (!href.startsWith("/more/")) {
    router.navigate(href as Href);
    return;
  }
  router.navigate("/more");
  setTimeout(() => router.push(href as Href), 0);
}
