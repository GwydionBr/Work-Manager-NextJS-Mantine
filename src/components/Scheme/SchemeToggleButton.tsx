"use client";

import { useDisclosure } from "@mantine/hooks";
import { useEffect, useState } from "react";
import { useClickOutside } from "@mantine/hooks";

import { useMantineColorScheme, Transition, Stack } from "@mantine/core";
import LightSchemeButton from "./LightSchemeButton";
import DarkSchemeButton from "./DarkSchemeButton";
import SystemSchemeButton from "./SystemSchemeButton";

export default function SchemeToggle() {
  const [isOpen, { close, toggle }] = useDisclosure(false);
  const { setColorScheme, colorScheme } = useMantineColorScheme();
  const ref = useClickOutside(() => close());
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return null;
  }

  return (
    <Stack justify="center" ref={ref}>
      <Transition mounted={isOpen} transition="fade-up" duration={400}>
        {(transitionStyles) => (
          <Stack style={transitionStyles}>
            {colorScheme !== "dark" && (
              <DarkSchemeButton
                onClick={() => {
                  setColorScheme("dark");
                  toggle();
                }}
                active={false}
                navbarMode={true}
              />
            )}
            {colorScheme !== "light" && (
              <LightSchemeButton
                onClick={() => {
                  setColorScheme("light");
                  toggle();
                }}
                active={false}
                navbarMode={true}
              />
            )}
            {colorScheme !== "auto" && (
              <SystemSchemeButton
                onClick={() => {
                  setColorScheme("auto");
                  toggle();
                }}
                active={false}
                navbarMode={true}
              />
            )}
          </Stack>
        )}
      </Transition>
      {colorScheme === "dark" ? (
        <DarkSchemeButton
          onClick={() => {
            toggle();
          }}
          active={false}
          navbarMode={true}
        />
      ) : colorScheme === "light" ? (
        <LightSchemeButton
          onClick={() => {
            toggle();
          }}
          active={false}
          navbarMode={true}
        />
      ) : colorScheme === "auto" ? (
        <SystemSchemeButton
          onClick={() => {
            toggle();
          }}
          active={false}
          navbarMode={true}
        />
      ) : (
        <></>
      )}
    </Stack>
  );
}
