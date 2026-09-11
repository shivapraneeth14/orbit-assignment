import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DndContext } from "@dnd-kit/core";
import { KanbanColumn } from "@/components/board/kanban-column";
import type { Task, TaskStatus } from "@/lib/types";

const tasks: Task[] = [
  {
    id: "t1",
    projectId: "p1",
    title: "Draft copy",
    description: null,
    status: "TODO",
    priority: "LOW",
    assigneeId: null,
    dueDate: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "t2",
    projectId: "p1",
    title: "Pick colors",
    description: null,
    status: "TODO",
    priority: "MEDIUM",
    assigneeId: null,
    dueDate: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
];

function renderColumn({
  onAddTask = vi.fn(),
  columnTasks = tasks,
}: { onAddTask?: (s: TaskStatus) => void; columnTasks?: Task[] } = {}) {
  return render(
    <DndContext>
      <KanbanColumn
        status="TODO"
        label="To Do"
        accent="bg-status-todo"
        tasks={columnTasks}
        onAddTask={onAddTask}
        onTaskClick={vi.fn()}
      />
    </DndContext>
  );
}

describe("KanbanColumn", () => {
  it("renders the label and task count", () => {
    renderColumn();
    expect(screen.getByText("To Do")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("exposes the status for automation", () => {
    renderColumn();
    expect(document.querySelector('[data-status="TODO"]')).toHaveAttribute(
      "data-status",
      "TODO"
    );
  });

  it("calls onAddTask with its status", async () => {
    const user = userEvent.setup();
    const onAddTask = vi.fn();
    renderColumn({ onAddTask });

    await user.click(screen.getByRole("button", { name: "Add task to To Do" }));
    expect(onAddTask).toHaveBeenCalledWith("TODO");
  });

  it("shows the empty drop hint when there are no tasks", () => {
    renderColumn({ columnTasks: [] });
    expect(screen.getByText("Drop tasks here")).toBeInTheDocument();
  });
});