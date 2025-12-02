"use client";

import { useForm } from "@mantine/form";
import { useFormatter } from "@/hooks/useFormatter";

import { Fieldset, Select, Stack, TextInput } from "@mantine/core";

import { z } from "zod";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { currencies } from "@/constants/settings";
import CreateButton from "@/components/UI/Buttons/CreateButton";
import UpdateButton from "@/components/UI/Buttons/UpdateButton";
import { Tables } from "@/types/db.types";
import { Currency } from "@/types/settings.types";
import CancelButton from "@/components/UI/Buttons/CancelButton";
import {
  useAddFinanceClientMutation,
  useUpdateFinanceClientMutation,
} from "@/utils/queries/finances/use-finance-client";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  currency: z.enum(
    currencies.map((currency) => currency.value) as [string, ...string[]]
  ),
});

interface FinanceClientFormProps {
  onClose?: () => void;
  onSuccess?: (client: Tables<"finance_client">) => void;
  client?: Tables<"finance_client">;
}

export default function FinanceClientForm({
  onClose,
  onSuccess,
  client,
}: FinanceClientFormProps) {
  const { getLocalizedText } = useFormatter();

  const { mutate: addFinanceClientMutation, isPending: isAddingFinanceClient } =
    useAddFinanceClientMutation({
      onSuccess: (client: Tables<"finance_client">) => {
        onSuccess?.(client);
        handleClose();
      },
    });
  const {
    mutate: updateFinanceClientMutation,
    isPending: isUpdatingFinanceClient,
  } = useUpdateFinanceClientMutation({ onSuccess: () => handleClose() });
  const form = useForm({
    initialValues: {
      name: client?.name || "",
      description: client?.description || "",
      email: client?.email || "",
      phone: client?.phone || "",
      address: client?.address || "",
      currency: client?.currency || "USD",
    },
    validate: zod4Resolver(schema),
  });

  const handleClose = () => {
    form.reset();
    onClose?.();
  };

  function handleSubmit(values: z.infer<typeof schema>) {
    if (client) {
      updateFinanceClientMutation({
        ...client,
        ...values,
        currency: values.currency as Currency,
      });
    } else {
      addFinanceClientMutation({
        ...values,
        currency: values.currency as Currency,
      });
    }
  }

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack>
        <Fieldset legend={getLocalizedText("Kunden Details", "Client details")}>
          <Stack>
            <TextInput
              withAsterisk
              label={getLocalizedText("Name", "Name")}
              {...form.getInputProps("name")}
              data-autofocus
            />
            <TextInput
              label={getLocalizedText("Beschreibung", "Description")}
              {...form.getInputProps("description")}
            />
          </Stack>
        </Fieldset>
        <Fieldset legend={getLocalizedText("Kontakt", "Contact")}>
          <TextInput
            label={getLocalizedText("Email", "Email")}
            {...form.getInputProps("email")}
          />
          <TextInput
            label={getLocalizedText("Telefon", "Phone")}
            {...form.getInputProps("phone")}
          />
          <TextInput
            label={getLocalizedText("Adresse", "Address")}
            {...form.getInputProps("address")}
          />
        </Fieldset>
        <Fieldset legend={getLocalizedText("Finanzen", "Finances")}>
          <Select
            label={getLocalizedText("Währung", "Currency")}
            data={currencies}
            {...form.getInputProps("currency")}
          />
        </Fieldset>
        {client ? (
          <UpdateButton
            type="submit"
            onClick={form.onSubmit(handleSubmit)}
            loading={isUpdatingFinanceClient}
          />
        ) : (
          <CreateButton
            type="submit"
            onClick={form.onSubmit(handleSubmit)}
            loading={isAddingFinanceClient}
          />
        )}
        {onClose && <CancelButton onClick={handleClose} />}
      </Stack>
    </form>
  );
}
