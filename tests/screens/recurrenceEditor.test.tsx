import { fireEvent } from "@testing-library/react-native";
import React from "react";
import { renderWithProviders } from "../helpers/render";
import { RecurrenceEditor } from "@/screens/shared/RecurrenceEditor";
import type { Recurrence } from "@/lib/recurrence";

describe("RecurrenceEditor", () => {
  const weekly: Recurrence = { freq: "weekly", interval: 1, days: [0, 3] };

  it("toggles a weekday on", async () => {
    const onChange = jest.fn();
    const { getByLabelText } = await renderWithProviders(
      <RecurrenceEditor value={weekly} anchorIso="2026-10-05" onChange={onChange} />,
    );
    await fireEvent.press(getByLabelText("Tue"));
    expect(onChange).toHaveBeenCalledWith({ freq: "weekly", interval: 1, days: [0, 1, 3] });
  });

  it("toggles a weekday off", async () => {
    const onChange = jest.fn();
    const { getByLabelText } = await renderWithProviders(
      <RecurrenceEditor value={weekly} anchorIso="2026-10-05" onChange={onChange} />,
    );
    await fireEvent.press(getByLabelText("Thu"));
    expect(onChange).toHaveBeenCalledWith({ freq: "weekly", interval: 1, days: [0] });
  });

  it("edits the interval", async () => {
    const onChange = jest.fn();
    const { getByLabelText } = await renderWithProviders(
      <RecurrenceEditor value={{ freq: "daily", interval: 1 }} anchorIso="2026-10-05" onChange={onChange} />,
    );
    await fireEvent.changeText(getByLabelText("Repeat interval"), "3");
    expect(onChange).toHaveBeenCalledWith({ freq: "daily", interval: 3 });
  });

  it("shows the day-of-month for monthly rules and no weekday chips", async () => {
    const { getByText, queryByLabelText } = await renderWithProviders(
      <RecurrenceEditor value={{ freq: "monthly", interval: 1, day: 17 }} anchorIso="2026-10-17" onChange={jest.fn()} />,
    );
    expect(getByText("on day 17 (from the due date)")).toBeTruthy();
    expect(queryByLabelText("Mon")).toBeNull();
  });
});
