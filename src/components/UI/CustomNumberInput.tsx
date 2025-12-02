"use client";

import { useMemo } from "react";

import { NumberInput, NumberInputProps } from "@mantine/core";

export default function CustomNumberInput(props: NumberInputProps) {
  const { value, ...rest } = props;

  const localValue = useMemo(() => {
    let v = value;
    if (typeof value === "number") {
      v = value > 0 ? value : undefined;
    }
    return v;
  }, [value]);

  return <NumberInput value={localValue} placeholder="0" allowLeadingZeros={false} {...rest} />;
}
