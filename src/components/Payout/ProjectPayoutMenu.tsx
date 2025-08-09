"use client";

import { useState } from "react";
import { useWorkStore } from "@/stores/workManagerStore";

import {
  Button,
  Text,
  Stack,
  Divider,
  Alert,
  NumberInput,
  Switch,
} from "@mantine/core";
import { IconBrandCashapp, IconAlertCircle } from "@tabler/icons-react";

import * as helper from "@/utils/workHelperFunctions";
import type { Tables } from "@/types/db.types";

interface ProjectPayoutMenuProps {
  project: Tables<"timer_project">;
  availablePayout: number;
  useCustomAmount: boolean;
  payoutAmount: number;
  closeMenu: () => void;
  openModal: () => void;
  setUseCustomAmount: (value: boolean) => void;
  setPayoutAmount: (value: number) => void;
}

export default function ProjectPayoutMenu({
  project,
  availablePayout,
  useCustomAmount,
  payoutAmount,
  closeMenu,
  openModal,
  setUseCustomAmount,
  setPayoutAmount,
}: ProjectPayoutMenuProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { payoutProjectSalary } = useWorkStore();

  const handleProjectSalaryPayout = async () => {
    closeMenu();
    openModal();
    // const amount = useCustomAmount ? payoutAmount : availablePayout;
    // if (amount <= 0 || amount > availablePayout) return;

    // setIsProcessing(true);
    // try {
    //   const success = await payoutProjectSalary(project.id, amount);
    //   if (success) {
    //     // Reset form
    //     setPayoutAmount(0);
    //     setUseCustomAmount(false);
    //   }
    // } finally {
    //   setIsProcessing(false);
    // }
  };
  return (
    <Stack p="md" gap="md">
      <Text size="sm" fw={500}>
        Project Salary Payout
      </Text>

      <Stack gap="xs">
        <Text size="sm" c="dimmed">
          Total Salary: {helper.formatMoney(project.salary, project.currency)}
        </Text>
        <Text size="sm" c="dimmed">
          Already Paid:{" "}
          {helper.formatMoney(project.total_payout || 0, project.currency)}
        </Text>
        <Text size="sm" fw={500} c="teal">
          Available: {helper.formatMoney(availablePayout, project.currency)}
        </Text>
      </Stack>

      {availablePayout > 0 ? (
        <>
          <Divider />

          <Switch
            label="Custom Amount"
            checked={useCustomAmount}
            onChange={(event) =>
              setUseCustomAmount(event.currentTarget.checked)
            }
          />

          {useCustomAmount ? (
            <NumberInput
              allowLeadingZeros={false}
              label="Payout Amount"
              placeholder="Enter amount"
              min={0}
              max={availablePayout}
              step={0.01}
              value={payoutAmount}
              onChange={(value) =>
                setPayoutAmount(typeof value === "number" ? value : 0)
              }
              rightSection={
                <Text size="xs" c="dimmed">
                  {helper.getCurrencySymbol(project.currency)}
                </Text>
              }
            />
          ) : (
            <Text size="sm" c="dimmed">
              Will payout full available amount:{" "}
              {helper.formatMoney(availablePayout, project.currency)}
            </Text>
          )}

          <Button
            onClick={handleProjectSalaryPayout}
            loading={isProcessing}
            disabled={
              useCustomAmount
                ? payoutAmount <= 0 || payoutAmount > availablePayout
                : false
            }
            fullWidth
            color="teal"
            leftSection={<IconBrandCashapp size={16} />}
          >
            {isProcessing
              ? "Processing..."
              : `Payout ${useCustomAmount ? helper.formatMoney(payoutAmount, project.currency) : helper.formatMoney(availablePayout, project.currency)}`}
          </Button>
        </>
      ) : (
        <Alert icon={<IconAlertCircle size={16} />} color="blue">
          No payout available - project salary already fully paid
        </Alert>
      )}
    </Stack>
  );
}
