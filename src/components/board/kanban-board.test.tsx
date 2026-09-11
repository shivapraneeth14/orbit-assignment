import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { KanbanBoard } from "@/components/board/kanban-board";
import type { Task } from "@/lib/types";

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: `t${Math.random().toString(36).slice(2, 8)}`,
    projectId: "p1",
    title: "Untitled task",
    description: null,
    status: "TODO",
    priority: "MEDIUM",
    assigneeId: null,
    dueDate: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("KanbanBoard", () => {
  it("renders all four columns", () => {
    render(
      <KanbanBoard
        tasks={[]}
        setTasks={vi.fn()}
        onAddTask={vi.fn()}
        onTaskClick={vi.fn()}
      />
    );
    for (const label of ["To Do", "In Progress", "In Review", "Done"]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it("groups tasks into their status columns", () => {
    const todoTask = makeTask({ title: "On deck" });
    const doneTask = makeTask({ title: "Shipped", status: "DONE" });
    render(
      <KanbanBoard
        tasks={[todoTask, doneTask]}
        setTasks={vi.fn()}
        onAddTask={vi.fn()}
        onTaskClick={vi.fn()}
      />
    );
    expect(
      document.querySelector('[data-status="TODO"]')!.querySelectorAll(
        '[data-task-id]'
      )
    ).toHaveLength(1);
    expect(
      document.querySelector('[data-status="DONE"]')!.querySelectorAll(
        '[data-task-id]'
      )
    ).toHaveLength(1);
  });

  it("opens the task that is clicked", () => {
    const task = makeTask({ title: "Click me" });
    const onTaskClick = vi.fn();
    render(
      <KanbanBoard
        tasks={[task]}
        setTasks={vi.fn()}
        onAddTask={vi.fn()}
        onTaskClick={onTaskClick}
      />
    );

    fireEvent.click(screen.getByText("Click me"));
    expect(onTaskClick).toHaveBeenCalledWith(task);
  });
});