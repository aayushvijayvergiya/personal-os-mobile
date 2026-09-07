import { fireEvent } from "@testing-library/react-native";
import React from "react";
import { renderWithProviders } from "../helpers/render";
import { Btn } from "@/ui/Btn";
import { Check } from "@/ui/Check";
import { DateField } from "@/ui/DateField";
import { Dialog } from "@/ui/Dialog";
import { MonthField } from "@/ui/PeriodFields";
import { Progress } from "@/ui/Progress";
import { Select } from "@/ui/Select";
import { TabBar } from "@/ui/TabBar";

describe("Btn", () => {
  it("fires onPress", async () => {
    const onPress = jest.fn();
    const { getByText } = await renderWithProviders(<Btn onPress={onPress}>OK</Btn>);
    await fireEvent.press(getByText("OK"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("does not fire when disabled", async () => {
    const onPress = jest.fn();
    const { getByText } = await renderWithProviders(
      <Btn disabled onPress={onPress}>
        OK
      </Btn>,
    );
    await fireEvent.press(getByText("OK"));
    expect(onPress).not.toHaveBeenCalled();
  });
});

describe("Check", () => {
  it("toggles and reports its state", async () => {
    const onChange = jest.fn();
    const { getByRole } = await renderWithProviders(
      <Check checked={false} onChange={onChange} label="Read" />,
    );
    const box = getByRole("checkbox");
    expect(box.props.accessibilityState.checked).toBe(false);
    await fireEvent.press(box);
    expect(onChange).toHaveBeenCalledWith(true);
  });
});

describe("TabBar", () => {
  it("marks the active tab and reports selections", async () => {
    const onSelect = jest.fn();
    const { getByText } = await renderWithProviders(
      <TabBar
        active="today"
        onSelect={onSelect}
        tabs={[
          { key: "today", label: "Today" },
          { key: "week", label: "This Week" },
        ]}
      />,
    );
    await fireEvent.press(getByText("This Week"));
    expect(onSelect).toHaveBeenCalledWith("week");
  });
});

describe("Select", () => {
  it("shows the current label, opens, and picks an option", async () => {
    const onChange = jest.fn();
    const { getByText, queryByText } = await renderWithProviders(
      <Select
        title="Priority"
        value="2"
        onChange={onChange}
        options={[
          { value: "1", label: "P1" },
          { value: "2", label: "P2" },
        ]}
      />,
    );
    expect(queryByText("P1")).toBeNull();
    await fireEvent.press(getByText("P2"));
    await fireEvent.press(getByText("P1"));
    expect(onChange).toHaveBeenCalledWith("1");
  });
});

describe("Dialog", () => {
  it("renders nothing when closed and closes via ✕", async () => {
    const onClose = jest.fn();
    const closed = await renderWithProviders(
      <Dialog title="Task Properties" open={false} onClose={onClose}>
        <Btn onPress={() => {}}>Inside</Btn>
      </Dialog>,
    );
    expect(closed.queryByText("Inside")).toBeNull();

    const open = await renderWithProviders(
      <Dialog title="Task Properties" open onClose={onClose}>
        <Btn onPress={() => {}}>Inside</Btn>
      </Dialog>,
    );
    expect(open.getByText("Inside")).toBeTruthy();
    await fireEvent.press(open.getByLabelText("Close"));
    expect(onClose).toHaveBeenCalled();
  });
});

describe("DateField", () => {
  it("formats the value and clears it", async () => {
    const onChange = jest.fn();
    const { getByText, getByLabelText } = await renderWithProviders(
      <DateField value="2026-07-19" onChange={onChange} allowClear />,
    );
    expect(getByText("Sun, Jul 19")).toBeTruthy();
    await fireEvent.press(getByLabelText("Clear date"));
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it("shows the placeholder when empty", async () => {
    const { getByText } = await renderWithProviders(<DateField value={null} onChange={() => {}} />);
    expect(getByText("—")).toBeTruthy();
  });
});

describe("MonthField", () => {
  it("emits YYYY-MM when a month is picked", async () => {
    const onChange = jest.fn();
    const { getByText } = await renderWithProviders(<MonthField value="2026-07" onChange={onChange} />);
    await fireEvent.press(getByText("July 2026"));
    await fireEvent.press(getByText("Mar"));
    expect(onChange).toHaveBeenCalledWith("2026-03");
  });
});

describe("Progress", () => {
  it("reports its value to accessibility services", async () => {
    const { getByRole } = await renderWithProviders(<Progress value={3} max={8} />);
    expect(getByRole("progressbar").props.accessibilityValue).toEqual({ now: 3, min: 0, max: 8 });
  });
});
