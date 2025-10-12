"use client";

import { useMutation } from "@tanstack/react-query";
import { useSettingsStore } from "@/stores/settingsStore";
import { Tables } from "@/types/db.types";
import { FinanceProject, SingleCashFlow } from "@/types/finance.types";
import { payoutFinanceProject } from "@/actions/finance/payout/payout-finance-project";
import {
  showActionErrorNotification,
  showActionSuccessNotification,
} from "@/utils/notificationFunctions";
import { payoutFinanceAdjustment } from "@/actions/finance/payout/payout-finance-adjustment";
import { payoutHourlyTimerProject } from "@/actions/finance/payout/payout-hourly-timer-project";
import { CompleteWorkProject, WorkProject } from "@/types/work.types";

// Mutation to payout a finance project
export function usePayoutFinanceProjectMutation(
  onSuccess?: () => void,
  onError?: () => void
) {
  const { locale, getLocalizedText } = useSettingsStore();
  return useMutation({
    mutationKey: ["payoutFinanceProject"],
    mutationFn: ({
      financeProject,
      payoutWholeProject = false,
    }: {
      financeProject: FinanceProject;
      payoutWholeProject?: boolean;
    }) =>
      payoutFinanceProject(
        financeProject,
        getLocalizedText,
        payoutWholeProject
      ),
    onSuccess: (data, variables, onMutateResult, context) => {
      context.client.setQueryData(
        ["financeProjects"],
        (old: FinanceProject[]) =>
          old.map((p) =>
            p.id === data.financeProject.id ? data.financeProject : p
          )
      );
      context.client.setQueryData(
        ["singleCashFlows"],
        (old: SingleCashFlow[]) => [...data.cashflows, ...old]
      );
      context.client.invalidateQueries({ queryKey: ["financeProjects"] });
      context.client.invalidateQueries({ queryKey: ["singleCashFlows"] });
      showActionSuccessNotification(
        getLocalizedText(
          "Finanzprojekt erfolgreich ausgezahlt",
          "Finance project successfully paid out"
        ),
        locale
      );
      onSuccess?.();
    },
    onError: (error, variables, onMutateResult, context) => {
      showActionErrorNotification(
        getLocalizedText(
          "Finanzprojekt konnten nicht ausgezahlt werden",
          "Finance project could not be paid out"
        ),
        locale
      );
      onError?.();
    },
  });
}

// Mutation to payout a finance adjustment
export function usePayoutFinanceAdjustmentMutation(
  onSuccess?: () => void,
  onError?: () => void
) {
  const { locale, getLocalizedText } = useSettingsStore();
  return useMutation({
    mutationKey: ["payoutFinanceAdjustment"],
    mutationFn: ({
      adjustment,
      financeProject,
    }: {
      adjustment: Tables<"finance_project_adjustment">;
      financeProject: FinanceProject;
    }) => {
      const title = `${adjustment.description} (${getLocalizedText("für das Finanz Projekt:", "for the Finance Project:")} ${financeProject.title})`;
      return payoutFinanceAdjustment(adjustment, financeProject, title);
    },
    onSuccess: (data, variables, onMutateResult, context) => {
      context.client.setQueryData(
        ["financeProjects"],
        (old: FinanceProject[]) =>
          old.map((p) =>
            p.id === data.adjustment.finance_project_id
              ? {
                  ...p,
                  adjustments: p.adjustments.map((a) =>
                    a.id === data.adjustment.id ? data.adjustment : a
                  ),
                }
              : p
          )
      );
      context.client.setQueryData(
        ["singleCashFlows"],
        (old: SingleCashFlow[]) => [data.cashflow, ...old]
      );
      context.client.invalidateQueries({ queryKey: ["financeProjects"] });
      context.client.invalidateQueries({ queryKey: ["singleCashFlows"] });
      showActionSuccessNotification(
        getLocalizedText(
          "Finanzanpassung erfolgreich ausgezahlt",
          "Finance adjustment successfully paid out"
        ),
        locale
      );
      onSuccess?.();
    },
    onError: (error, variables, onMutateResult, context) => {
      showActionErrorNotification(
        getLocalizedText(
          "Finanzanpassung konnten nicht ausgezahlt werden",
          "Finance adjustment could not be paid out"
        ),
        locale
      );
      onError?.();
    },
  });
}

// Mutation to payout a hourly timer project
export function usePayoutHourlyTimerProjectMutation(
  onSuccess?: () => void,
  onError?: () => void
) {
  const { locale, getLocalizedText } = useSettingsStore();
  return useMutation({
    mutationKey: ["payoutHourlyTimerProject"],
    mutationFn: ({
      project,
      title,
      timeEntryIds,
    }: {
      project: CompleteWorkProject;
      title: string;
      timeEntryIds: string[];
    }) => payoutHourlyTimerProject({ project, title, timeEntryIds }),
    onSuccess: (data, variables, onMutateResult, context) => {
      context.client.setQueryData(
        ["singleCashFlows"],
        (old: SingleCashFlow[]) => [data.singleCashFlow, ...(old || [])]
      );
      context.client.invalidateQueries({ queryKey: ["singleCashFlows"] });
      // TODO: UPDATE TIMER PROJECT
      showActionSuccessNotification(
        getLocalizedText(
          "Projekt erfolgreich ausgezahlt",
          "Project successfully paid out"
        ),
        locale
      );
      onSuccess?.();
    },
    onError: (error, variables, onMutateResult, context) => {
      console.log(error);
      console.log(variables);
      showActionErrorNotification(
        getLocalizedText(
          "Projekt konnten nicht ausgezahlt werden",
          "Project could not be paid out"
        ),
        locale
      );
      onError?.();
    },
  });
}
