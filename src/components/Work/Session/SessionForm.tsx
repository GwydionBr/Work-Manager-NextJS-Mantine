import { Button, NumberInput, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { DateTimePicker } from '@mantine/dates';

interface NewSession{
  start_time: Date;
  active_seconds: number;
  paused_seconds: number;
  currency: string;
  salary: number;
}

interface SessionFormProps {
  initialValues: NewSession;
  onSubmit: (values: NewSession) => void;
  onCancel: () => void;
  newSession: boolean;
}

export default function SessionForm({ initialValues, onSubmit, onCancel, newSession }: SessionFormProps) {
  const form = useForm({
    initialValues,
    validate: {
      active_seconds: (value) => (value >= 1 ? null : 'Active seconds must be bigger than 0'),
      paused_seconds: (value) => (value >= 0 ? null : 'Paused seconds must be positive'),
      currency: (value) => (value ? null : 'Currency is required'),
      salary: (value) => (value >= 0 ? null : 'Salary must be positive'),
    },
  });

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <Stack>
        <DateTimePicker
          label="Start Time"
          value={form.values.start_time}
          {...form.getInputProps('start_time')}
        />
        <NumberInput
          label="Active Seconds"
          min={0}
          step={1}
          {...form.getInputProps('active_seconds')}
        />
        <NumberInput
          label="Paused Seconds"
          min={0}
          step={1}
          {...form.getInputProps('paused_seconds')}
        />
        <NumberInput
          label="Salary"
          min={0}
          step={0.01}
          {...form.getInputProps('salary')}
        />
        <TextInput 
          label="Currency" 
          placeholder="€, $, etc." 
          {...form.getInputProps('currency')} 
        />

        <Button type="submit">{newSession ? 'Create Session' : 'Save Changes'}</Button>
        <Button onClick={onCancel} color="red" variant="outline">
          Cancel
        </Button>
      </Stack>
    </form>
  );
}