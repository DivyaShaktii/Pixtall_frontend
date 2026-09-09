import React from "react";
import { render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import Sidebar from "./Sidebar";

it("shows workspace identity without presenting it as a control", () => {
  render(
    <Sidebar
      active="studio"
      onNavigate={vi.fn()}
      currentUser={{ workspace: "Personal Workspace" }}
      wallet={{ available_credits: 20, reserved_credits: 0, lifetime_consumed_credits: 0 }}
    />,
  );

  const workspaceName = screen.getByText("Personal Workspace");
  expect(workspaceName.closest("button")).toBeNull();
  expect(screen.queryByText(/^Main$/i)).not.toBeInTheDocument();
});
