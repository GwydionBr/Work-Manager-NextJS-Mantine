"use client";

import { useState, useRef, useEffect } from "react";
import { useTaskStore } from "@/stores/taskStore";

import {
  Stack,
  Text,
  Group,
  Checkbox,
  CheckIcon,
  ActionIcon,
} from "@mantine/core";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { useHover } from "@mantine/hooks";

export default function TaskList() {
  const { tasks, toggleTask, deleteTask, createTask } = useTaskStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Focus management for editing
  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  // Focus management for new task creation
  useEffect(() => {
    if (isCreating && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isCreating]);

  const handleCreateTask = async () => {
    if (newTaskTitle.trim()) {
      setIsCreating(true);
      await createTask({ title: newTaskTitle.trim() });
      setNewTaskTitle("");
      setIsCreating(false);
    }
  };

  const handleUpdateTask = async (id: string, title: string) => {
    if (title.trim()) {
      await useTaskStore.getState().updateTask({ id, title: title.trim() });
    } else {
      // Delete empty tasks
      await deleteTask(id);
    }
    setEditingId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === "Enter") {
      e.preventDefault();
      action();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setEditingId(null);
      setNewTaskTitle("");
      setIsCreating(false);
    }
  };

  const startEditing = (id: string, currentTitle: string) => {
    setEditingId(id);
    setNewTaskTitle(currentTitle);
  };

  const startCreating = () => {
    setIsCreating(true);
    setNewTaskTitle("");
  };

  return (
    <Stack maw={600} align="center" w="100%" gap="md">
      <Text size="lg" fw={500} mb="xs">
        Tasks
      </Text>

      <Stack w="100%" gap="xs">
        {/* Existing tasks */}
        {tasks.map((task) => (
          <TaskRow
            key={task.id}
            task={task}
            isEditing={editingId === task.id}
            onToggle={toggleTask}
            onDelete={deleteTask}
            onEdit={startEditing}
            onUpdate={handleUpdateTask}
            onKeyDown={handleKeyDown}
            inputRef={editingId === task.id ? inputRef : null}
            editingTitle={editingId === task.id ? newTaskTitle : ""}
            setEditingTitle={setNewTaskTitle}
          />
        ))}

        {/* New task input */}
        {isCreating && (
          <NewTaskRow
            title={newTaskTitle}
            onTitleChange={setNewTaskTitle}
            onCreate={handleCreateTask}
            onCancel={() => setIsCreating(false)}
            onKeyDown={(e) => handleKeyDown(e, handleCreateTask)}
            inputRef={inputRef}
          />
        )}

        {/* Add new task button */}
        {!isCreating && (
          <Group
            justify="flex-start"
            w="100%"
            style={{
              borderRadius: "8px",
              border: "1px dashed var(--mantine-color-dark-3)",
              padding: "var(--mantine-spacing-sm)",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onClick={startCreating}
          >
            <ActionIcon variant="subtle" size="sm">
              <IconPlus size={16} />
            </ActionIcon>
            <Text size="sm" c="dimmed">
              Add new task
            </Text>
          </Group>
        )}
      </Stack>
    </Stack>
  );
}

interface TaskRowProps {
  task: any;
  isEditing: boolean;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, title: string) => void;
  onUpdate: (id: string, title: string) => void;
  onKeyDown: (e: React.KeyboardEvent, action: () => void) => void;
  inputRef: React.RefObject<HTMLInputElement | null> | null;
  editingTitle: string;
  setEditingTitle: (title: string) => void;
}

function TaskRow({
  task,
  isEditing,
  onToggle,
  onDelete,
  onEdit,
  onUpdate,
  onKeyDown,
  inputRef,
  editingTitle,
  setEditingTitle,
}: TaskRowProps) {
  const { hovered, ref } = useHover();

  if (isEditing) {
    return (
      <Group
        justify="space-between"
        w="100%"
        ref={ref}
        style={{
          borderRadius: "8px",
          border: "1px solid var(--mantine-color-blue-5)",
          padding: "var(--mantine-spacing-sm)",
          backgroundColor: "var(--mantine-color-blue-0)",
        }}
      >
        <Group style={{ flexGrow: 1 }}>
          <Checkbox
            icon={CheckIcon}
            checked={task.executed}
            onChange={() => onToggle(task.id)}
            disabled
          />
          <input
            ref={inputRef}
            type="text"
            value={editingTitle}
            onChange={(e) => setEditingTitle(e.target.value)}
            onKeyDown={(e) =>
              onKeyDown(e, () => onUpdate(task.id, editingTitle))
            }
            onBlur={() => onUpdate(task.id, editingTitle)}
            style={{
              border: "none",
              outline: "none",
              background: "transparent",
              fontSize: "14px",
              flexGrow: 1,
              color: "var(--mantine-color-text)",
            }}
          />
        </Group>
      </Group>
    );
  }

  return (
    <Group
      justify="space-between"
      w="100%"
      ref={ref}
      style={{
        borderRadius: "8px",
        border: "1px solid var(--mantine-color-dark-3)",
        padding: "var(--mantine-spacing-sm)",
        transition: "all 0.2s ease",
        cursor: "pointer",
      }}
      onClick={() => onEdit(task.id, task.title)}
    >
      <Group style={{ flexGrow: 1 }}>
        <Checkbox
          icon={CheckIcon}
          checked={task.executed}
          onChange={(e) => {
            e.stopPropagation();
            onToggle(task.id);
          }}
        />
        <Text
          size="sm"
          style={{
            textDecoration: task.executed ? "line-through" : "none",
            color: task.executed
              ? "var(--mantine-color-dimmed)"
              : "var(--mantine-color-text)",
          }}
        >
          {task.title}
        </Text>
      </Group>
      {hovered && (
        <ActionIcon
          variant="subtle"
          color="red"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(task.id);
          }}
        >
          <IconTrash size={14} />
        </ActionIcon>
      )}
    </Group>
  );
}

interface NewTaskRowProps {
  title: string;
  onTitleChange: (title: string) => void;
  onCreate: () => void;
  onCancel: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

function NewTaskRow({
  title,
  onTitleChange,
  onCreate,
  onCancel,
  onKeyDown,
  inputRef,
}: NewTaskRowProps) {
  return (
    <Group
      justify="space-between"
      w="100%"
      style={{
        borderRadius: "8px",
        border: "1px solid var(--mantine-color-blue-5)",
        padding: "var(--mantine-spacing-sm)",
        backgroundColor: "var(--mantine-color-blue-0)",
      }}
    >
      <Group style={{ flexGrow: 1 }}>
        <Checkbox icon={CheckIcon} checked={false} disabled />
        <input
          ref={inputRef}
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={onCancel}
          placeholder="New task..."
          style={{
            border: "none",
            outline: "none",
            background: "transparent",
            fontSize: "14px",
            flexGrow: 1,
            color: "var(--mantine-color-text)",
          }}
        />
      </Group>
    </Group>
  );
}
