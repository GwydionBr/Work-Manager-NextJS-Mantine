"use client";

import { useState } from "react";
import { useDisclosure, useClickOutside } from "@mantine/hooks";
import { useWorkStore } from "@/stores/workManagerStore";

import { Popover, Button, Box } from "@mantine/core";
import ProjectColorPicker from "@/components/UI/ProjectColorPicker";

import { VisibleProject } from "@/types/workCalendar.types";

interface CalendarLegendButtonProps {
  p: VisibleProject;
}

export default function CalendarLegendButton({ p }: CalendarLegendButtonProps) {
  const { updateProject } = useWorkStore();
  const [selectedColor, setSelectedColor] = useState<string>(p.color);
  const [isOpen, { open, close }] = useDisclosure(false);

  const ref = useClickOutside(() => {
    close();
  });

  return (
    <Popover
      opened={isOpen}
      onOpen={() => {
        setSelectedColor(p.color);
      }}
      onClose={() => {
        close();
        updateProject({
          id: p.id,
          color: selectedColor,
        });
      }}
    >
      <Popover.Target>
        <Button
          c="light-dark(var(--mantine-color-black), var(--mantine-color-white))"
          variant="subtle"
          size="xs"
          onClick={() => {
            open();
          }}
          leftSection={
            <Box
              style={{
                width: 10,
                height: 10,
                borderRadius: 10,
                background: p.color,
                boxShadow: `0 0 0 1px ${p.color}`,
              }}
            />
          }
        >
          {p.title}
        </Button>
      </Popover.Target>
      <Popover.Dropdown ref={ref}>
        <ProjectColorPicker
          value={selectedColor}
          onChange={setSelectedColor}
          onClose={() => {
            updateProject({
              id: p.id,
              color: selectedColor,
            });
            close();
          }}
        />
      </Popover.Dropdown>
    </Popover>
  );
}