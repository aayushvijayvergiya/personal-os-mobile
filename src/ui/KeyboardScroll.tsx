import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Keyboard, ScrollView, TextInput, type ScrollViewProps } from "react-native";

type ScrollToInput = (input: React.ElementRef<typeof TextInput> | null) => void;

const KeyboardScrollContext = createContext<ScrollToInput | null>(null);

/** Used by `Input`/`TextArea` to bring themselves above the keyboard when focused. No-op outside a `KeyboardScrollView`. */
export function useKeyboardScroll(): ScrollToInput {
  return useContext(KeyboardScrollContext) ?? (() => {});
}

const EXTRA_SPACE = 16;

/**
 * Drop-in replacement for `ScrollView` that scrolls a focused `Input`/`TextArea` above the
 * keyboard. Opening the keyboard doesn't shrink or pan this view at all — it's drawn as an
 * overlay on top of the existing layout, so the `ScrollView` has no extra room to scroll a
 * bottom field into. While the keyboard is up, this pads the content by the keyboard's height
 * (creating that room) and scrolls the focused field above it, measuring both in absolute
 * on-screen coordinates so it holds regardless of device size.
 */
export function KeyboardScrollView({ children, onScroll, contentContainerStyle, ...rest }: ScrollViewProps) {
  const scrollRef = useRef<ScrollView>(null);
  const scrollOffsetY = useRef(0);
  const keyboardScreenY = useRef<number | null>(null);
  const pendingInput = useRef<React.ElementRef<typeof TextInput> | null>(null);
  const [keyboardPad, setKeyboardPad] = useState(0);

  const reveal = useCallback(() => {
    const input = pendingInput.current;
    const scrollView = scrollRef.current;
    const scrollNode = scrollView?.getNativeScrollRef();
    if (!input || !scrollView || !scrollNode || keyboardScreenY.current == null) return;
    const keyboardY = keyboardScreenY.current;

    scrollNode.measureInWindow((_sx, scrollScreenY, _sw, scrollViewHeight) => {
      input.measureInWindow((_ix, inputScreenY, _iw, inputHeight) => {
        const visibleBottom = Math.min(keyboardY, scrollScreenY + scrollViewHeight);
        const overlap = inputScreenY + inputHeight - visibleBottom + EXTRA_SPACE;
        if (overlap > 0) {
          scrollView.scrollTo({ y: scrollOffsetY.current + overlap, animated: true });
        }
      });
    });
  }, []);

  useEffect(() => {
    const onShow = (e: { endCoordinates: { screenY: number; height: number } }) => {
      keyboardScreenY.current = e.endCoordinates.screenY;
      setKeyboardPad(e.endCoordinates.height);
      // Wait a frame so the extra bottom padding has landed before measuring/scrolling against it.
      requestAnimationFrame(reveal);
    };
    const onHide = () => {
      keyboardScreenY.current = null;
      setKeyboardPad(0);
    };
    const subShow = Keyboard.addListener("keyboardDidShow", onShow);
    const subHide = Keyboard.addListener("keyboardDidHide", onHide);
    return () => {
      subShow.remove();
      subHide.remove();
    };
  }, [reveal]);

  const scrollToInput = useCallback<ScrollToInput>(
    (input) => {
      pendingInput.current = input;
      // Keyboard already up (moving focus between fields) — no show event will fire, so reveal now.
      if (keyboardScreenY.current != null) reveal();
    },
    [reveal],
  );

  return (
    <KeyboardScrollContext.Provider value={scrollToInput}>
      <ScrollView
        ref={scrollRef}
        scrollEventThrottle={16}
        onScroll={(e) => {
          scrollOffsetY.current = e.nativeEvent.contentOffset.y;
          onScroll?.(e);
        }}
        contentContainerStyle={[contentContainerStyle, keyboardPad ? { paddingBottom: keyboardPad } : null]}
        {...rest}
      >
        {children}
      </ScrollView>
    </KeyboardScrollContext.Provider>
  );
}
