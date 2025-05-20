"use client";

import { useState } from "react";
import { Stack } from "@mantine/core";
import GroceryRow from "./GroceryRow";
import GroceryInput from "./GroceryInput";
import { useGroupStore } from "@/stores/groupStore";

export default function GroceryList() {
  const [inputValue, setInputValue] = useState("");
  const { addGroceryItem, activeGroup } = useGroupStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleInputSubmit() {
    setIsLoading(true);
    const response = await addGroceryItem({
      title: inputValue,
      amount: 1,
      unit: "amount",
      group_id: activeGroup?.id || "",
    });
    if (response) {
      setIsLoading(false);
      setInputValue("");
    } else {
      setError("Failed to add item");
      setIsLoading(false);
    }
  }

  const GroceryRows = activeGroup?.groceryItems.map((item) => (
    <GroceryRow key={item.id} item={item} />
  ));

  return (
    <Stack maw={600} align="center" w="100%">
      <GroceryInput
        placeholder="Add an item"
        onValueChange={(value) => setInputValue(value)}
        value={inputValue}
        onSubmit={handleInputSubmit}
        clearInput={() => setInputValue("")}
        isLoading={isLoading}
        error={error}
        onCloseError={() => setError(null)}
      />
      {GroceryRows}
    </Stack>
  );
}
