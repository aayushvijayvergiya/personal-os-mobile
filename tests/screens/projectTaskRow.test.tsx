import React from "react";
import { renderWithProviders } from "../helpers/render";
import { makeTask } from "../helpers/fixtures";
import { ProjectTaskRow } from "@/screens/projects/ProjectTaskRow";

describe("ProjectTaskRow", () => {
  it("renders the title exactly once (the checkbox must not echo it as a caption)", async () => {
    const task = makeTask({ title: "Improvements in Vision Board" });
    const { getAllByText, getByRole } = await renderWithProviders(
      <ProjectTaskRow task={task} today="2026-07-19" onToggle={() => {}} onOpen={() => {}} />,
    );
    expect(getAllByText("Improvements in Vision Board")).toHaveLength(1);
    expect(getByRole("checkbox").props.accessibilityLabel).toBe("Improvements in Vision Board");
  });
});
