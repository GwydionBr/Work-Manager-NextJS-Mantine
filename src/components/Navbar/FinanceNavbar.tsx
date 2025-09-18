"use client";

import { useHotkeys } from "@mantine/hooks";
import { useFinanceStore } from "@/stores/financeStore";
import { useSettingsStore } from "@/stores/settingsStore";

import {
  ActionIcon,
  Group,
  Text,
  Divider,
  Box,
  Transition,
  Stack,
} from "@mantine/core";
import FinanceSection from "@/components/Finances/FinanceSection";
import NewCashFlowButton from "@/components/Finances/CashFlow/NewCashFlowButton";
import AdjustmentActionIcon from "@/components/UI/ActionIcons/AdjustmentActionIcon";
import { IconArrowBarRight } from "@tabler/icons-react";
import DelayedTooltip from "@/components/UI/DelayedTooltip";

import classes from "./Navbar.module.css";
import { SettingsTab } from "../Settings/SettingsModal";
import Shortcut from "../UI/Shortcut";

export default function FinanceNavbar() {
  const { singleCashFlows, isFetching } = useFinanceStore();
  const {
    setSelectedTab,
    setIsModalOpen,
    locale,
    isFinanceNavbarOpen,
    toggleFinanceNavbar,
  } = useSettingsStore();

  useHotkeys([["mod + J", () => toggleFinanceNavbar()]]);

  const incomeCashFlows = singleCashFlows.filter(
    (cashFlow) => cashFlow.type === "income"
  );

  const expenseCashFlows = singleCashFlows.filter(
    (cashFlow) => cashFlow.type === "expense"
  );

  return (
    <Box className={classes.main} w={isFinanceNavbarOpen ? 250 : 60}>
      <Group className={classes.title} align="center" justify="space-between">
        <Transition
          mounted={!isFinanceNavbarOpen}
          transition="fade"
          duration={200}
          enterDelay={200}
        >
          {(styles) => (
            <DelayedTooltip
              label={
                <Stack align="center">
                  <Text>Toggle Navbar</Text>
                  <Shortcut keys={["mod", "J"]} />
                </Stack>
              }
            >
              <ActionIcon
                onClick={() => toggleFinanceNavbar()}
                aria-label="Toggle navbar"
                variant="light"
                style={styles}
              >
                <IconArrowBarRight size={22} />
              </ActionIcon>
            </DelayedTooltip>
          )}
        </Transition>
        <Transition
          mounted={isFinanceNavbarOpen}
          transition="fade"
          duration={200}
          enterDelay={200}
        >
          {(styles) => (
            <Text style={styles}>
              {locale === "de-DE" ? "Finanzen" : "Finances"}
            </Text>
          )}
        </Transition>
        {!isFetching && (
          <>
            <Transition
              mounted={isFinanceNavbarOpen}
              transition="fade"
              duration={200}
              enterDelay={200}
            >
              {(styles) => (
                <Group gap={8} style={styles}>
                  <AdjustmentActionIcon
                    aria-label="Adjust finance settings"
                    tooltipLabel={
                      locale === "de-DE"
                        ? "Finanzeinstellungen anpassen"
                        : "Adjust finance settings"
                    }
                    size="md"
                    iconSize={20}
                    onClick={() => {
                      setIsModalOpen(true);
                      setSelectedTab(SettingsTab.FINANCE);
                    }}
                  />
                  <NewCashFlowButton />
                </Group>
              )}
            </Transition>
            <Transition
              mounted={!isFinanceNavbarOpen}
              transition="fade"
              duration={200}
              enterDelay={200}
            >
              {(styles) => (
                <Stack gap={8} style={styles} align="center" mt={10}>
                  <NewCashFlowButton />
                  <AdjustmentActionIcon
                    aria-label="Adjust finance settings"
                    tooltipLabel={
                      locale === "de-DE"
                        ? "Finanzeinstellungen anpassen"
                        : "Adjust finance settings"
                    }
                    size="md"
                    iconSize={20}
                    onClick={() => {
                      setIsModalOpen(true);
                      setSelectedTab(SettingsTab.FINANCE);
                    }}
                  />
                </Stack>
              )}
            </Transition>
          </>
        )}
      </Group>

      <Transition
        mounted={isFinanceNavbarOpen}
        transition="fade"
        duration={200}
        enterDelay={200}
      >
        {(styles) => (
          <Box className={classes.financeSections} style={styles}>
            <FinanceSection
              title={locale === "de-DE" ? "Einnahmen" : "Income"}
              cashFlows={incomeCashFlows}
              isFetching={isFetching}
            />
            <Divider className={classes.divider} />
            <FinanceSection
              title={locale === "de-DE" ? "Ausgaben" : "Expenses"}
              cashFlows={expenseCashFlows}
              isFetching={isFetching}
            />
          </Box>
        )}
      </Transition>

      <Group
        justify="flex-end"
        p={5}
        pr={15}
        align="center"
        w="100%"
        style={{
          position: "absolute",
          right: 0,
          bottom: 0,
          zIndex: 1000,
        }}
      >
        <DelayedTooltip
          label={
            <Stack align="center">
              <Text>Toggle Navbar</Text>
              <Shortcut keys={["mod", "J"]} />
            </Stack>
          }
        >
          <ActionIcon
            onClick={() => toggleFinanceNavbar()}
            aria-label="Toggle navbar"
            variant={isFinanceNavbarOpen ? "filled" : "light"}
          >
            <IconArrowBarRight
              size={22}
              style={{
                transform: isFinanceNavbarOpen ? "rotate(180deg)" : "none",
                transition: "transform 0.4s linear",
              }}
            />
          </ActionIcon>
        </DelayedTooltip>
      </Group>
    </Box>
  );
}
