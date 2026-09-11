import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DndContext } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { TaskCard } from "@/components/board/task-card";
import type { Task } from "@/lib/types";

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: "t1",
    projectId: "p1",
    title: "Ship admin panel",
    description: null,
    status: "TODO",
    priority: "HIGH",
    assigneeId: null,
    dueDate: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function renderCard(task: Task, onClick = vi.fn()) {
  render(
    <DndContext>
      <SortableContext items={[task.id]} strategy={verticalListSortingStrategy}>
        <TaskCard task={task} onClick={onClick} />
      </SortableContext>
    </DndContext>
  );
  return onClick;
}

describe("TaskCard", () => {
  it("renders the task title", () => {
    renderCard(makeTask());
    expect(screen.getByText("Ship admin panel")).toBeInTheDocument();
  });

  it("shows the formatted due date", () => {
    renderCard(
      makeTask({ dueDate: "2026-02-15T00:00:00.000Z", status: "TODO" })
    );
    expect(screen.getByText(/Feb 15/i)).toBeInTheDocument();
  });

  it("flags overdue tasks", () => {
    const dueDate = new Date(Date.now() - 86400000 * 2).toISOString();
    const { container } = render(
      <DndContext>
        <SortableContext items={["t1"]} strategy={verticalListSortingStrategy}>
          <TaskCard task={makeTask({ dueDate, status: "TODO" })} onClick={vi.fn()} />
        </SortableContext>
      </DndContext>
    );
    expect(container.querySelector(".text-priority-high")).toBeInTheDocument();
  });

  it("renders the assignee avatar initials", () => {
    renderCard(
      makeTask({ assignee: { id: "u1", name: "Demo User", avatarColor: "#111" } })
    );
    expect(screen.getByTitle("Demo User")).toHaveTextContent("DU");
  });

  it("includes a description icon when a description exists", () => {
    const { container } = render(
      <DndContext>
        <SortableContext
          items={["t1"]}
          strategy={verticalListSortingStrategy}
        >
          <TaskCard task={makeTask({ description: "Some notes" })} onClick={vi.fn()} />
        </SortableContext>
      </DndContext>
    );
    expect(container.querySelectorAll("svg")).toHaveLength(1);
  });

  it("opens the task on click", () => {
    const task = makeTask();
    const onClick = renderCard(task);

    fireEvent.click(screen.getByText("Ship admin panel"));
    expect(onClick).toHaveBeenCalledWith(task);
  });
});