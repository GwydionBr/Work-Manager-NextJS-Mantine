"use client";

import { useState, useEffect } from "react";
import { useTransition, animated } from "@react-spring/web";
import { useGroupStore } from "@/stores/groupStore";

import { Divider, Stack } from "@mantine/core";
import GroceryRow from "./GroceryRow";
import GroceryInput from "./GroceryInput";

import { Tables } from "@/types/db.types";

import styles from "./Grocery.module.css";

export default function GroceryList() {
  const {
    addGroceryItem,
    activeGroupId,
    toggleGroceryItem,
    deleteGroceryItem,
  } = useGroupStore();
  const activeGroup = useGroupStore((state) =>
    state.groups.find((g) => g.id === activeGroupId)
  );

  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<Tables<"grocery_item">[]>([]);

  useEffect(() => {
    if (activeGroup) {
      const sortedItems = activeGroup.groceryItems.sort((a, b) => {
        if (a.checked && !b.checked) return 1;
        if (!a.checked && b.checked) return -1;
        return 0;
      });
      setItems(sortedItems);
    }
  }, [activeGroup]);

  let height = 0;
  const transitions = useTransition(
    items.map((data) => ({ ...data, y: (height += 60) - 60 })),
    {
      key: (item: Tables<"grocery_item">) => item.id,
      from: { height: 0, opacity: 0 },
      leave: { height: 0, opacity: 0 },
      enter: ({ y }) => ({ y, height: 60, opacity: 1 }),
      update: ({ y }) => ({ y, height: 60 }),
    }
  );

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
      <Stack w="100%" className={styles.list}>
        {transitions((style, item, t, index) => (
          <animated.div
            className={styles.card}
            style={{ zIndex: items.length - index, ...style }}
          >
            <div className={styles.cell}>
            <GroceryRow
              key={item.id}
              item={item}
                handleCheckChange={toggleGroceryItem}
                onDelete={() => deleteGroceryItem(item.id)}
              />
            </div>
          </animated.div>
        ))}
      </Stack>
    </Stack>
  );
}
