"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
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
import { getAllPayouts } from "@/actions/finance/payout/get-all-payouts";
import { WorkProject, WorkTimeEntry } from "@/types/work.types";
import { CustomMutationProps } from "@/types/query.types";

// Query to get all payouts
export function usePayoutQuery() {
  return useQuery({
    queryKey: ["payouts"],
    queryFn: () => getAllPayouts(),
  });
}

// Mutation to payout a finance project
export const usePayoutFinanceProjectMutation = ({
  ...props
}: CustomMutationProps = {}) => {
  const { locale, getLocalizedText } = useSettingsStore();
  return useMutation({
    mutationKey: ["payoutFinanceProject"],
    mutationFn: ({
      financeProject,
      payoutWholeProject = false,
    }: {
      financeProject: FinanceProject;
      payoutWholeProject?: boolean;
    }) => payoutFinanceProject(financeProject, locale, payoutWholeProject),
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
      if (props.showNotification !== false) {
        showActionSuccessNotification(
          getLocalizedText(
            "Finanzprojekt erfolgreich ausgezahlt",
            "Finance project successfully paid out"
          ),
          locale
        );
      }
      props.onSuccess?.();
    },
    onError: (error, variables, onMutateResult, context) => {
      console.log("error", error);
      if (props.showNotification !== false) {
        showActionErrorNotification(
          getLocalizedText(
            "Finanzprojekt konnten nicht ausgezahlt werden",
            "Finance project could not be paid out"
          ),
          locale
        );
      }
      props.onError?.();
    },
  });
};

// Mutation to payout a finance adjustment
export const usePayoutFinanceAdjustmentMutation = ({
  ...props
}: CustomMutationProps = {}) => {
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
      console.log("data", data);
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
      if (props.showNotification !== false) {
        showActionSuccessNotification(
          getLocalizedText(
            "Finanzanpassung erfolgreich ausgezahlt",
            "Finance adjustment successfully paid out"
          ),
          locale
        );
      }
      props.onSuccess?.();
    },
    onError: (error, variables, onMutateResult, context) => {
      if (props.showNotification !== false) {
        showActionErrorNotification(
          getLocalizedText(
            "Finanzanpassung konnten nicht ausgezahlt werden",
            "Finance adjustment could not be paid out"
          ),
          locale
        );
      }
      props.onError?.();
    },
  });
};

// Mutation to payout a hourly timer project
export const usePayoutHourlyTimerProjectMutation = ({
  ...props
}: CustomMutationProps = {}) => {
  const { locale, getLocalizedText } = useSettingsStore();
  return useMutation({
    mutationKey: ["payoutHourlyTimerProject"],
    mutationFn: ({
      project,
      title,
      timeEntries,
    }: {
      project: WorkProject;
      title: string;
      timeEntries: WorkTimeEntry[];
    }) => payoutHourlyTimerProject({ project, title, timeEntries }),
    onSuccess: (data, variables, onMutateResult, context) => {
      context.client.setQueryData(
        ["singleCashFlows"],
        (old: SingleCashFlow[]) => [data.singleCashFlow, ...(old || [])]
      );
      const timeEntryIds = variables.timeEntries.map(
        (timeEntry) => timeEntry.id
      );
      context.client.setQueryData(
        ["workTimeEntries", variables.project.id],
        (old: WorkTimeEntry[]) =>
          old.map((timeEntry) =>
            timeEntryIds.includes(timeEntry.id)
              ? {
                  ...timeEntry,
                  single_cash_flow_id: data.singleCashFlow.id,
                }
              : timeEntry
          )
      );
      if (props.showNotification !== false) {
        showActionSuccessNotification(
          getLocalizedText(
            "Projekt erfolgreich ausgezahlt",
            "Project successfully paid out"
          ),
          locale
        );
      }
      props.onSuccess?.();
    },
    onError: (error, variables, onMutateResult, context) => {
      console.log("error", error);
      if (props.showNotification !== false) {
        showActionErrorNotification(
          getLocalizedText(
            "Projekt konnten nicht ausgezahlt werden",
            "Project could not be paid out"
          ),
          locale
        );
      }
      props.onError?.();
    },
  });
};
