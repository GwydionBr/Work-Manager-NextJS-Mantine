import { Autocomplete } from "@mantine/core";
import { Tables } from "@/types/db.types";

interface SearchProfilesProps {
  profiles: Tables<"profiles">[] | null;
  search: string;
  setSearch: (search: string) => void;
}

export default function SearchProfiles({
  profiles,
  search,
  setSearch,
}: SearchProfilesProps) {
  return (
    <Autocomplete
      label="Search for a profile"
      placeholder="Search for a profile"
      data={profiles?.map((profile) => profile.username) || []}
      value={search}
      onChange={(e) => setSearch(e)}
    />
  );
}
