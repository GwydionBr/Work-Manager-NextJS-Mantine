"use client";

import { useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRecurringCashflowQuery } from "@/utils/queries/finances/use-recurring-cashflow";
import { useSingleCashflowQuery } from "@/utils/queries/finances/use-single-cashflow";
import { processRecurringCashFlows } from "@/utils/helper/processRecurringCashflows";
import { createMultipleSingleCashFlows } from "@/actions/finance/singleCashflow/create-multiple-single-cashflows";
import { useSettingsStore } from "@/stores/settingsStore";
import {
  showActionErrorNotification,
  showActionSuccessNotification,
} from "@/utils/notificationFunctions";
import { SingleCashFlow } from "@/types/finance.types";

const LAST_PROCESSED_KEY = "lastRecurringCashflowProcessed";

export function useProcessRecurringCashflows() {
  const queryClient = useQueryClient();
  const { locale, getLocalizedText } = useSettingsStore();
  const lastProcessedRef = useRef<Date | null>(null);

  // Get recurring and single cashflows
  const { data: recurringCashFlows = [] } = useRecurringCashflowQuery();
  const { data: singleCashFlows = [] } = useSingleCashflowQuery();

  // Mutation to create multiple single cashflows
  const createMultipleMutation = useMutation<
    SingleCashFlow[],
    Error,
    Parameters<typeof createMultipleSingleCashFlows>[0]
  >({
    mutationKey: ["createMultipleSingleCashFlows"],
    mutationFn: createMultipleSingleCashFlows,
    onSuccess: (data) => {
      // Update the single cashflows cache
      queryClient.setQueryData(["singleCashFlows"], (old: any[]) => [
        ...data,
        ...(old || []),
      ]);

      // Invalidate to ensure fresh data
      queryClient.invalidateQueries({
        queryKey: ["singleCashFlows"],
      });

      if (data.length > 0) {
        showActionSuccessNotification(
          getLocalizedText(
            `${data.length} wiederkehrende Cashflows verarbeitet`,
            `${data.length} recurring cashflows processed`
          ),
          locale
        );
      }
    },
    onError: (error) => {
      console.error("Error processing recurring cashflows:", error);
      showActionErrorNotification(
        getLocalizedText(
          "Fehler beim Verarbeiten der wiederkehrenden Cashflows",
          "Error processing recurring cashflows"
        ),
        locale
      );
    },
  });

  // Check if we need to process recurring cashflows (check if already processed today)
  const shouldProcess = () => {
    if (typeof window === "undefined") return false;

    const today = new Date();
    const todayString = today.toDateString(); // Format: "Mon Jan 01 2024"
    const lastProcessed = localStorage.getItem(LAST_PROCESSED_KEY);

    if (!lastProcessed) {
      return true;
    }

    const lastProcessedDate = new Date(lastProcessed);
    const lastProcessedString = lastProcessedDate.toDateString();

    // Return true if not processed today
    return lastProcessedString !== todayString;
  };

  // Process recurring cashflows
  const processRecurringCashflows = async () => {
    if (recurringCashFlows.length === 0) {
      return;
    }

    try {
      // Get cashflows that need to be created
      const cashFlowsToCreate = processRecurringCashFlows(
        recurringCashFlows,
        singleCashFlows
      );

      if (cashFlowsToCreate.length === 0) {
        // Update last processed time even if no cashflows to create
        if (typeof window !== "undefined") {
          localStorage.setItem(LAST_PROCESSED_KEY, new Date().toISOString());
        }
        return;
      }

      // Create the single cashflows (the action expects the original format)
      await createMultipleMutation.mutateAsync({
        cashFlows: cashFlowsToCreate,
        recurringCashFlows,
      });

      // Update last processed time
      if (typeof window !== "undefined") {
        localStorage.setItem(LAST_PROCESSED_KEY, new Date().toISOString());
      }
    } catch (error) {
      console.error("Error in processRecurringCashflows:", error);
    }
  };

  // Effect to run the check when component mounts and data is available
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (
      recurringCashFlows.length > 0 &&
      singleCashFlows.length >= 0 &&
      shouldProcess() &&
      !createMultipleMutation.isPending
    ) {
      processRecurringCashflows();
    }
  }, [recurringCashFlows, singleCashFlows]);

  // Optional: Manual trigger function
  const triggerProcessing = () => {
    processRecurringCashflows();
  };

  return {
    isProcessing: createMultipleMutation.isPending,
    triggerProcessing,
    lastProcessed:
      typeof window !== "undefined"
        ? localStorage.getItem(LAST_PROCESSED_KEY)
        : null,
    error: createMultipleMutation.error,
  };
}
