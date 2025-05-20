"use server";

import { createClient } from "@/utils/supabase/server";
import { TablesInsert, TablesUpdate } from "@/types/db.types";
import {
  ApiResponseList,
  ApiResponseSingle,
  DeleteResponse,
} from "@/types/action.types";

export async function getAllGroceryItems({
  groupId,
}: {
  groupId: string;
}): Promise<ApiResponseList<"grocery_item">> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("grocery_item")
    .select("*")
    .eq("group_id", groupId);

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data, error: null };
}

export async function getGroceryItemsByGroup({
  groupId,
}: {
  groupId: string;
}): Promise<ApiResponseList<"grocery_item">> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("grocery_item")
    .select("*")
    .eq("group_id", groupId);

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data, error: null };
}

export async function getGroceryItemById({
  itemId,
}: {
  itemId: string;
}): Promise<ApiResponseSingle<"grocery_item">> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("grocery_item")
    .select("*")
    .eq("id", itemId)
    .single();

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data, error: null };
}

export async function createGroceryItem({
  item,
}: {
  item: TablesInsert<"grocery_item">;
}): Promise<ApiResponseSingle<"grocery_item">> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      data: null,
      error: "User not found",
      success: false,
    };
  }

  const { data, error } = await supabase
    .from("grocery_item")
    .insert(item)
    .select()
    .single();

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data, error: null };
}

export async function updateGroceryItem({
  item,
}: {
  item: TablesUpdate<"grocery_item">;
}): Promise<ApiResponseSingle<"grocery_item">> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("grocery_item")
    .update(item)
    .eq("id", item.id!)
    .select()
    .single();

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data, error: null };
}

export async function deleteGroceryItem({
  itemId,
}: {
  itemId: string;
}): Promise<DeleteResponse> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("grocery_item")
    .delete()
    .eq("id", itemId);

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data: null, error: null };
}
