import { useMemo, useState } from "react";
import type { ComposeResult, ComposeTarget, RuleListItem } from "../../lib/tauri";
import { getFilterTags } from "../helpers";

export function useComposeSelection(rules: RuleListItem[]) {
  const [composeTarget, setComposeTarget] = useState<ComposeTarget>("agents-md");
  const [selectedComposeTags, setSelectedComposeTags] = useState<string[]>([]);
  const [selectedComposeRuleIds, setSelectedComposeRuleIds] = useState<string[]>([]);
  const [composeResult, setComposeResult] = useState<ComposeResult | null>(null);

  const composeMatchingRules = useMemo(() => {
    return rules
      .filter((rule) => rule.targets.includes(composeTarget) || rule.targets.includes("generic"))
      .filter((rule) => {
        const matchesRule = selectedComposeRuleIds.includes(rule.id);
        const matchesTag = selectedComposeTags.some((tag) =>
          getFilterTags(rule).includes(tag),
        );

        return matchesRule || matchesTag;
      });
  }, [composeTarget, rules, selectedComposeRuleIds, selectedComposeTags]);

  function toggleComposeTag(tag: string) {
    setSelectedComposeTags((current) =>
      current.includes(tag)
        ? current.filter((item) => item !== tag)
        : [...current, tag],
    );
  }

  function toggleComposeRule(ruleId: string) {
    setSelectedComposeRuleIds((current) =>
      current.includes(ruleId)
        ? current.filter((item) => item !== ruleId)
        : [...current, ruleId],
    );
  }

  function clearComposeSelection() {
    setSelectedComposeTags([]);
    setSelectedComposeRuleIds([]);
    setComposeResult(null);
  }

  return {
    composeTarget,
    setComposeTarget,
    selectedComposeTags,
    selectedComposeRuleIds,
    composeResult,
    setComposeResult,
    composeMatchingRules,
    toggleComposeTag,
    toggleComposeRule,
    clearComposeSelection,
  };
}
