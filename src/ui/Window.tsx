import React from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";
import { Bevel } from "./Bevel";
import { TitleBar } from "./TitleBar";

/** The retro window: frame bevel + gradient title bar + padded body. */
export function Window({
  title,
  icon,
  actions,
  children,
  style,
  bodyStyle,
}: {
  title: string;
  icon?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  bodyStyle?: StyleProp<ViewStyle>;
}) {
  return (
    <Bevel variant="frame" style={style}>
      <TitleBar title={title} icon={icon} actions={actions} />
      <View style={[{ padding: 10 }, bodyStyle]}>{children}</View>
    </Bevel>
  );
}
