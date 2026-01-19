"use client";

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { GripVertical, Plus, Clock, User } from "lucide-react";

import { TaskRead, TaskStatus } from "@/client";
import { 
  createTaskMutation, 
  readTasksOptions, 
  reorderTaskMutation 
} from "@/client/@tanstack/react-query.gen";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface KanbanBoardProps {
  projectId: number;
  tasks: TaskRead[];
}

interface KanbanColumnProps {
  id: TaskStatus;
  title: string;
  tasks: TaskRead[];
  projectId: number;
}

interface KanbanTaskProps {
  task: TaskRead;
}

const COLUMN_CONFIG: { id: TaskStatus; title: string; color: string }[] = [
  { id: TaskStatus.TODO, title: "To Do", color: "bg-gray-100 border-gray-300" },
  { id: TaskStatus.IN_PROGRESS, title: "In Progress", color: "bg-blue-50 border-blue-300" },
  { id: TaskStatus.WAITING, title: "Waiting", color: "bg-amber-50 border-amber-300" },
  { id: TaskStatus.DONE, title: "Done", color: "bg-green-50 border-green-300" },
];

function KanbanTask({ task }: KanbanTaskProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "bg-white rounded-lg border shadow-sm p-3 mb-2 cursor-grab active:cursor-grabbing",
        isDragging && "opacity-50"
      )}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start gap-2">
        <GripVertical className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium line-clamp-2">{task.title}</p>
          {task.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
              {task.description}
            </p>
          )}
          <div className="flex items-center gap-3 mt-2">
            {task.estimated_hours && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{task.estimated_hours}h</span>
              </div>
            )}
            {task.assignee && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <User className="h-3 w-3" />
                <span className="truncate max-w-[80px]">{task.assignee.name}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TaskOverlay({ task }: { task: TaskRead }) {
  return (
    <div className="bg-white rounded-lg border shadow-lg p-3 cursor-grabbing opacity-90">
      <div className="flex items-start gap-2">
        <GripVertical className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium line-clamp-2">{task.title}</p>
        </div>
      </div>
    </div>
  );
}

function KanbanColumn({ id, title, tasks, projectId }: KanbanColumnProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const queryClient = useQueryClient();

  const config = COLUMN_CONFIG.find((c) => c.id === id);

  const { mutate: createTask, isPending } = useMutation({
    ...createTaskMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: readTasksOptions({ query: { project_id: projectId } }).queryKey,
      });
      setNewTaskTitle("");
      setIsAdding(false);
      toast.success("Task created");
    },
    onError: () => {
      toast.error("Failed to create task");
    },
  });

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    createTask({
      body: {
        title: newTaskTitle.trim(),
        project_id: projectId,
        status: id,
        order: tasks.length,
      },
    });
  };

  return (
    <div className={cn("rounded-lg border-2 p-3 min-h-[200px]", config?.color)}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-sm flex items-center gap-2">
          {title}
          <Badge variant="secondary" className="text-xs h-5 px-1.5">
            {tasks.length}
          </Badge>
        </h3>
      </div>

      <SortableContext
        items={tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-0">
          {tasks.map((task) => (
            <KanbanTask key={task.id} task={task} />
          ))}
        </div>
      </SortableContext>

      {isAdding ? (
        <div className="mt-2 space-y-2">
          <Input
            autoFocus
            placeholder="Task title..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddTask();
              if (e.key === "Escape") {
                setIsAdding(false);
                setNewTaskTitle("");
              }
            }}
            disabled={isPending}
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAddTask} disabled={isPending || !newTaskTitle.trim()}>
              Add
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setIsAdding(false);
                setNewTaskTitle("");
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className="w-full mt-2 text-muted-foreground hover:text-foreground"
          onClick={() => setIsAdding(true)}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add task
        </Button>
      )}
    </div>
  );
}

export function KanbanBoard({ projectId, tasks }: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<TaskRead | null>(null);
  const queryClient = useQueryClient();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const { mutate: reorderTask } = useMutation({
    ...reorderTaskMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: readTasksOptions({ query: { project_id: projectId } }).queryKey,
      });
    },
    onError: () => {
      toast.error("Failed to move task");
    },
  });

  // Group tasks by status
  const tasksByStatus = COLUMN_CONFIG.reduce((acc, col) => {
    acc[col.id] = tasks
      .filter((t) => t.status === col.id)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    return acc;
  }, {} as Record<TaskStatus, TaskRead[]>);

  const findContainer = (id: string | number): TaskStatus | undefined => {
    if (typeof id === "string" && id in TaskStatus) {
      return id as TaskStatus;
    }

    const task = tasks.find((t) => t.id === id);
    return task?.status;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id as number;
    const overId = over.id;

    const activeTask = tasks.find((t) => t.id === activeId);
    if (!activeTask) return;

    // Determine target status
    let targetStatus: TaskStatus;
    let targetOrder: number;

    // Check if dropped on a column header
    if (typeof overId === "string" && Object.values(TaskStatus).includes(overId as TaskStatus)) {
      targetStatus = overId as TaskStatus;
      targetOrder = tasksByStatus[targetStatus].length;
    } else {
      // Dropped on or near another task
      const overTask = tasks.find((t) => t.id === overId);
      if (!overTask) return;

      targetStatus = overTask.status ?? TaskStatus.TODO;
      const overIndex = tasksByStatus[targetStatus].findIndex((t) => t.id === overId);
      targetOrder = overIndex >= 0 ? overIndex : tasksByStatus[targetStatus].length;
    }

    // Only update if something changed
    if (activeTask.status !== targetStatus || activeTask.order !== targetOrder) {
      reorderTask({
        path: { task_id: activeId },
        body: {
          status: targetStatus,
          order: targetOrder,
        },
      });
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {COLUMN_CONFIG.map((col) => (
          <KanbanColumn
            key={col.id}
            id={col.id}
            title={col.title}
            tasks={tasksByStatus[col.id] || []}
            projectId={projectId}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? <TaskOverlay task={activeTask} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
