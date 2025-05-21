"use client";

import { useState, useEffect } from "react";
import { useGroupStore } from "@/stores/groupStore";

import { Divider, Stack } from "@mantine/core";
import GroceryRow from "./GroceryRow";
import GroceryInput from "./GroceryInput";

import { Tables } from "@/types/db.types";

export default function GroceryList() {
  const { addGroceryItem, activeGroup, toggleGroceryItem, deleteGroceryItem } =
    useGroupStore();

  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uncheckedItems, setUncheckedItems] = useState<
    Tables<"grocery_item">[]
  >([]);
  const [checkedItems, setCheckedItems] = useState<Tables<"grocery_item">[]>(
    []
  );

  useEffect(() => {
    if (activeGroup) {
      setUncheckedItems(
        activeGroup.groceryItems.filter((item) => !item.checked)
      );
      setCheckedItems(activeGroup.groceryItems.filter((item) => item.checked));
    }
  }, [activeGroup]);

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

  return (
    <Stack maw={600} align="center" w="100%" gap="xl">
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
      <Stack w="100%">
        {uncheckedItems.map((item) => (
          <GroceryRow
            key={item.id}
            item={item}
            handleCheckChange={toggleGroceryItem}
            onDelete={() => deleteGroceryItem(item.id)}
          />
        ))}
        <Divider />
        {checkedItems.map((item) => (
          <GroceryRow
            key={item.id}
            item={item}
            handleCheckChange={toggleGroceryItem}
            onDelete={() => deleteGroceryItem(item.id)}
          />
        ))}
      </Stack>
    </Stack>
  );
}
