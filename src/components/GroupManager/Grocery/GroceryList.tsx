"use client";

import { useState } from "react";
import { Stack } from "@mantine/core";
import GroceryRow from "./GroceryRow";
import GroceryInput from "./GroceryInput";

export default function GroceryList() {
  const [inputValue, setInputValue] = useState("");

  function handleInputSubmit() {
    console.log(inputValue);
    setInputValue("");
  }

  return (
    <Stack maw={600} align="center" w="100%">
      <GroceryInput
        placeholder="Add an item"
        onValueChange={(value) => setInputValue(value)}
        value={inputValue}
        onSubmit={handleInputSubmit}
        clearInput={() => setInputValue("")}
      />
      <GroceryRow />
    </Stack>
  );
}
