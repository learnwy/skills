import { useMemo, useState } from "react";
import type { RuleListItem } from "../../lib/tauri";
import { getFilterTags } from "../helpers";

export function useRuleFilters(rules: RuleListItem[]) {
  const [searchQuery, setSearchQuery] = useState("");
  const [groupFilter, setGroupFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("all");
  const [targetFilter, setTargetFilter] = useState("all");

  const availableGroups = useMemo(
    () => Array.from(new Set(rules.flatMap((rule) => rule.groups))).sort(),
    [rules],
  );
  const availableTags = useMemo(
    () => Array.from(new Set(rules.flatMap((rule) => getFilterTags(rule)))).sort(),
    [rules],
  );
  const availableTargets = useMemo(
    () => Array.from(new Set(rules.flatMap((rule) => rule.targets))).sort(),
    [rules],
  );

  const filteredRules = useMemo(
    () =>
      rules.filter((rule) => {
        const filterTags = getFilterTags(rule);
        const haystack = [
          rule.id,
          rule.title,
          rule.summary,
          rule.groups.join(" "),
          filterTags.join(" "),
          rule.targets.join(" "),
        ]
          .join(" ")
          .toLowerCase();

        const matchesSearch = haystack.includes(searchQuery.trim().toLowerCase());
        const matchesGroup = groupFilter === "all" || rule.groups.includes(groupFilter);
        const matchesTag = tagFilter === "all" || filterTags.includes(tagFilter);
        const matchesTarget =
          targetFilter === "all" || rule.targets.includes(targetFilter);

        return matchesSearch && matchesGroup && matchesTag && matchesTarget;
      }),
    [groupFilter, rules, searchQuery, tagFilter, targetFilter],
  );

  const activeFilters = [groupFilter, tagFilter, targetFilter].filter(
    (value) => value !== "all",
  );

  return {
    searchQuery,
    setSearchQuery,
    groupFilter,
    setGroupFilter,
    tagFilter,
    setTagFilter,
    targetFilter,
    setTargetFilter,
    availableGroups,
    availableTags,
    availableTargets,
    filteredRules,
    activeFilters,
  };
}
