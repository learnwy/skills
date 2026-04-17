import { startTransition, useEffect, useState } from "react";
import {
  composeRules,
  createRule,
  getWorkspaceSnapshot,
  loadRule,
  saveRule,
  type NewRuleInput,
  type RuleDocument,
  type RuleLibraryStats,
  type RuleListItem,
  type VisualizationRecommendation,
  type WorkspaceSummary,
} from "../../lib/tauri";
import type { Locale } from "../../lib/i18n";
import {
  defaultCreateForm,
  getSelectedRulePresentation,
  joinValues,
  splitCommaSeparated,
} from "../helpers";
import type { TranslateFn } from "../types";
import { useComposeSelection } from "./useComposeSelection";
import { useRuleFilters } from "./useRuleFilters";

type UseRuleManagerParams = {
  locale: Locale;
  t: TranslateFn;
};

export function useRuleManager({ locale, t }: UseRuleManagerParams) {
  const [summary, setSummary] = useState<WorkspaceSummary | null>(null);
  const [rules, setRules] = useState<RuleListItem[]>([]);
  const [stats, setStats] = useState<RuleLibraryStats | null>(null);
  const [recommendation, setRecommendation] =
    useState<VisualizationRecommendation | null>(null);
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<RuleDocument | null>(null);
  const [draftDocument, setDraftDocument] = useState<RuleDocument | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<NewRuleInput>(defaultCreateForm);
  const [isLoadingWorkspace, setIsLoadingWorkspace] = useState(true);
  const [isLoadingDocument, setIsLoadingDocument] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const [runtimeMode, setRuntimeMode] = useState<"tauri" | "browser">("browser");
  const [runtimeLayer, setRuntimeLayer] = useState<string>("loading");
  const [error, setError] = useState<string | null>(null);
  const filters = useRuleFilters(rules);
  const compose = useComposeSelection(rules);

  const selectedRule =
    rules.find((rule) => rule.id === selectedRuleId) ?? filters.filteredRules[0] ?? null;

  const isDirty =
    JSON.stringify(selectedDocument) !== JSON.stringify(draftDocument) &&
    draftDocument !== null;
  const { selectedSummary, selectedFile, previewBody, selectedFilterTags } =
    getSelectedRulePresentation(draftDocument, selectedDocument, selectedRule, t);

  async function refreshWorkspace(preferredRuleId?: string) {
    setIsLoadingWorkspace(true);

    try {
      const snapshot = await getWorkspaceSnapshot(locale);

      startTransition(() => {
        setRuntimeMode(snapshot.mode);
        setRuntimeLayer(snapshot.healthcheck.layer);
        setSummary(snapshot.summary);
        setRules(snapshot.rules);
        setStats(snapshot.stats);
        setRecommendation(snapshot.recommendation);
        setSelectedRuleId(
          preferredRuleId ??
            snapshot.rules.find((rule) => rule.id === selectedRuleId)?.id ??
            snapshot.rules[0]?.id ??
            null,
        );
        setError(null);
      });
    } catch (loadError) {
      startTransition(() => {
        setError(
          loadError instanceof Error ? loadError.message : t("errors.workspaceLoad"),
        );
      });
    } finally {
      setIsLoadingWorkspace(false);
    }
  }

  useEffect(() => {
    void refreshWorkspace();
  }, [locale]);

  useEffect(() => {
    if (!selectedRule?.file) {
      setSelectedDocument(null);
      setDraftDocument(null);
      return;
    }

    let isActive = true;
    setIsLoadingDocument(true);

    async function loadSelectedRule() {
      try {
        const document = await loadRule(selectedRule.file, locale);
        if (!isActive) {
          return;
        }

        startTransition(() => {
          setSelectedDocument(document);
          setDraftDocument(document);
        });
      } catch (loadError) {
        if (!isActive) {
          return;
        }

        startTransition(() => {
          setError(
            loadError instanceof Error ? loadError.message : t("errors.ruleLoad"),
          );
        });
      } finally {
        if (isActive) {
          setIsLoadingDocument(false);
        }
      }
    }

    void loadSelectedRule();

    return () => {
      isActive = false;
    };
  }, [locale, selectedRule?.file]);

  useEffect(() => {
    if (filters.filteredRules.length === 0) {
      return;
    }

    if (!filters.filteredRules.some((rule) => rule.id === selectedRuleId)) {
      setSelectedRuleId(filters.filteredRules[0]?.id ?? null);
    }
  }, [filters.filteredRules, selectedRuleId]);

  async function handleCreateRule() {
    setIsCreating(true);

    try {
      const created = await createRule(
        {
          ...createForm,
          groups: splitCommaSeparated(joinValues(createForm.groups)),
          tags: splitCommaSeparated(joinValues(createForm.tags)),
          targets: splitCommaSeparated(joinValues(createForm.targets)),
        },
        locale,
      );
      await refreshWorkspace(created.id);
      setSelectedRuleId(created.id);
      setCreateForm(defaultCreateForm);
      setIsCreateOpen(false);
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : t("errors.createRule"),
      );
    } finally {
      setIsCreating(false);
    }
  }

  async function handleSaveRule() {
    if (!draftDocument) {
      return;
    }

    setIsSaving(true);

    try {
      const saved = await saveRule({
        ...draftDocument,
        groups: splitCommaSeparated(joinValues(draftDocument.groups)),
        tags: splitCommaSeparated(joinValues(draftDocument.tags)),
        targets: splitCommaSeparated(joinValues(draftDocument.targets)),
      });
      setSelectedDocument(saved);
      setDraftDocument(saved);
      await refreshWorkspace(saved.id);
      setSelectedRuleId(saved.id);
      setError(null);
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : t("errors.saveRule"),
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleComposeExport() {
    setIsComposing(true);

    try {
      const composed = await composeRules({
        target: compose.composeTarget,
        rule_ids: compose.selectedComposeRuleIds,
        tags: compose.selectedComposeTags,
      });
      compose.setComposeResult(composed);
      setError(null);
    } catch (composeError) {
      setError(
        composeError instanceof Error
          ? composeError.message
          : t("errors.composeRule"),
      );
    } finally {
      setIsComposing(false);
    }
  }

  function beginCreateFlow() {
    setCreateForm(defaultCreateForm);
    setIsCreateOpen(true);
  }

  function cancelCreateFlow() {
    setCreateForm(defaultCreateForm);
    setIsCreateOpen(false);
  }

  return {
    summary,
    rules,
    stats,
    recommendation,
    selectedRuleId,
    setSelectedRuleId,
    selectedRule,
    selectedDocument,
    draftDocument,
    setDraftDocument,
    searchQuery: filters.searchQuery,
    setSearchQuery: filters.setSearchQuery,
    groupFilter: filters.groupFilter,
    setGroupFilter: filters.setGroupFilter,
    tagFilter: filters.tagFilter,
    setTagFilter: filters.setTagFilter,
    targetFilter: filters.targetFilter,
    setTargetFilter: filters.setTargetFilter,
    isCreateOpen,
    createForm,
    setCreateForm,
    isLoadingWorkspace,
    isLoadingDocument,
    isSaving,
    isCreating,
    isComposing,
    runtimeMode,
    runtimeLayer,
    error,
    composeTarget: compose.composeTarget,
    setComposeTarget: compose.setComposeTarget,
    selectedComposeTags: compose.selectedComposeTags,
    selectedComposeRuleIds: compose.selectedComposeRuleIds,
    composeResult: compose.composeResult,
    availableGroups: filters.availableGroups,
    availableTags: filters.availableTags,
    availableTargets: filters.availableTargets,
    filteredRules: filters.filteredRules,
    composeMatchingRules: compose.composeMatchingRules,
    isDirty,
    selectedSummary,
    selectedFile,
    previewBody,
    selectedFilterTags,
    activeFilters: filters.activeFilters,
    refreshWorkspace,
    handleCreateRule,
    handleSaveRule,
    handleComposeExport,
    beginCreateFlow,
    cancelCreateFlow,
    toggleComposeTag: compose.toggleComposeTag,
    toggleComposeRule: compose.toggleComposeRule,
    clearComposeSelection: compose.clearComposeSelection,
  };
}
