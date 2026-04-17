import { useState } from "react";
import {
  detectBrowserLocale,
  recommendationLabel,
  translate,
  type Locale,
} from "../lib/i18n";
import { AppHeader } from "./components/AppHeader";
import { AppSidebar } from "./components/AppSidebar";
import { useRuleManager } from "./hooks/useRuleManager";
import { ComposeView } from "./views/ComposeView";
import { EditorView } from "./views/EditorView";
import { LibraryView } from "./views/LibraryView";
import { OverviewView } from "./views/OverviewView";
import type { ViewMeta, ViewTab, WorkspaceView } from "./types";

export default function App() {
  const [locale, setLocale] = useState<Locale>(detectBrowserLocale());
  const [activeView, setActiveView] = useState<WorkspaceView>("overview");
  const t = (
    key: Parameters<typeof translate>[1],
    variables?: Record<string, string | number>,
  ) => translate(locale, key, variables);

  const manager = useRuleManager({ locale, t });

  const panels = [
    {
      title: t("panel.library.title"),
      body: t("panel.library.body"),
    },
    {
      title: t("panel.workspace.title"),
      body: t("panel.workspace.body"),
    },
    {
      title: t("panel.inspector.title"),
      body: t("panel.inspector.body"),
    },
  ];

  const milestones = [
    t("milestone.composeExport"),
    t("milestone.previewPolish"),
    t("milestone.smokeTest"),
  ];

  const activeViewMeta: Record<WorkspaceView, ViewMeta> = {
    overview: {
      label: t("tabs.overview"),
      description: t("hero.lede"),
      eyebrow: t("workspace.label"),
    },
    library: {
      label: t("tabs.library"),
      description: t("library.resultsBody"),
      eyebrow: t("workspace.label"),
    },
    editor: {
      label: t("tabs.editor"),
      description: panels[1].body,
      eyebrow: t("workspace.label"),
    },
    compose: {
      label: t("tabs.compose"),
      description: t("compose.exportBody"),
      eyebrow: t("workspace.label"),
    },
  };

  const viewTabs: ViewTab[] = [
    { id: "overview", label: t("tabs.overview") },
    { id: "library", label: t("tabs.library") },
    { id: "editor", label: t("tabs.editor") },
    { id: "compose", label: t("tabs.compose") },
  ];

  function openCreateFlow() {
    manager.beginCreateFlow();
    setActiveView("editor");
  }

  function openComposeView() {
    setActiveView("compose");
  }

  function openEditorView() {
    setActiveView("editor");
  }

  function openLibraryView() {
    setActiveView("library");
  }

  return (
    <div className="app-shell">
      <div className="app-frame">
        <AppSidebar
          activeView={activeView}
          activeViewMeta={activeViewMeta}
          availableGroupsCount={manager.availableGroups.length}
          availableTagsCount={manager.availableTags.length}
          composeMatchingCount={manager.composeMatchingRules.length}
          filteredRulesCount={manager.filteredRules.length}
          heroBody={t("hero.lede")}
          heroEyebrow={t("hero.eyebrow")}
          heroTitle={t("hero.title")}
          isDirty={manager.isDirty}
          isSaving={manager.isSaving}
          onChangeView={setActiveView}
          onOpenCompose={openComposeView}
          onOpenCreate={openCreateFlow}
          onOpenEditor={openEditorView}
          onSave={() => void manager.handleSaveRule()}
          rulesCount={manager.rules.length}
          selectedRule={manager.selectedRule}
          selectedSummary={manager.selectedSummary}
          selectedTags={manager.selectedFilterTags}
          t={t}
          viewTabs={viewTabs}
        />

        <main className="app-main">
          <AppHeader
            activeView={activeView}
            activeViewMeta={activeViewMeta}
            locale={locale}
            onLocaleChange={setLocale}
            t={t}
          />

          <section className="status-pills">
            <article className="status-pill accent">
              <span>{t("status.runtime")}</span>
              <strong>{manager.runtimeMode}</strong>
              <p>{manager.runtimeLayer}</p>
            </article>
            <article className="status-pill">
              <span>{t("status.storage")}</span>
              <strong>
                {manager.summary
                  ? manager.summary.storage_root
                  : t("status.storageLoading")}
              </strong>
            </article>
            <article className="status-pill">
              <span>
                {t("facts.recommendation", {
                  value: recommendationLabel(
                    locale,
                    manager.recommendation?.recommendation,
                  ),
                })}
              </span>
              <strong>{manager.recommendation?.score ?? 0}</strong>
              <p>{t("facts.score", { value: manager.recommendation?.score ?? 0 })}</p>
            </article>
          </section>

          {manager.error ? <div className="error-banner">{manager.error}</div> : null}

          {activeView === "overview" ? (
            <OverviewView
              composeMatchingCount={manager.composeMatchingRules.length}
              locale={locale}
              milestones={milestones}
              onOpenCompose={openComposeView}
              onOpenEditor={openEditorView}
              onOpenLibrary={openLibraryView}
              panels={panels}
              previewBody={manager.previewBody}
              recommendation={manager.recommendation}
              rulesCount={manager.rules.length}
              selectedFile={manager.selectedFile}
              selectedRule={manager.selectedRule}
              selectedSummary={manager.selectedSummary}
              stats={manager.stats}
              summary={manager.summary}
              t={t}
            />
          ) : null}

          {activeView === "library" ? (
            <LibraryView
              activeFilters={manager.activeFilters}
              availableGroups={manager.availableGroups}
              availableTags={manager.availableTags}
              availableTargets={manager.availableTargets}
              filteredRules={manager.filteredRules}
              groupFilter={manager.groupFilter}
              isLoadingDocument={manager.isLoadingDocument}
              isLoadingWorkspace={manager.isLoadingWorkspace}
              onGroupFilterChange={manager.setGroupFilter}
              onOpenEditor={openEditorView}
              onSearchChange={manager.setSearchQuery}
              onSelectRule={manager.setSelectedRuleId}
              onTagFilterChange={manager.setTagFilter}
              onTargetFilterChange={manager.setTargetFilter}
              previewBody={manager.previewBody}
              rules={manager.rules}
              searchQuery={manager.searchQuery}
              selectedFile={manager.selectedFile}
              selectedRule={manager.selectedRule}
              selectedSummary={manager.selectedSummary}
              selectedTags={manager.selectedFilterTags}
              t={t}
              tagFilter={manager.tagFilter}
              targetFilter={manager.targetFilter}
            />
          ) : null}

          {activeView === "editor" ? (
            <EditorView
              createForm={manager.createForm}
              draftDocument={manager.draftDocument}
              isCreateOpen={manager.isCreateOpen}
              isCreating={manager.isCreating}
              isDirty={manager.isDirty}
              isLoadingDocument={manager.isLoadingDocument}
              onCancelCreate={manager.cancelCreateFlow}
              onChangeCreateForm={manager.setCreateForm}
              onChangeDraftDocument={manager.setDraftDocument}
              onCreateRule={() => void manager.handleCreateRule()}
              onOpenCreate={openCreateFlow}
              panels={panels}
              selectedFile={manager.selectedFile}
              t={t}
            />
          ) : null}

          {activeView === "compose" ? (
            <ComposeView
              availableTags={manager.availableTags}
              composeMatchingRules={manager.composeMatchingRules}
              composeResult={manager.composeResult}
              composeTarget={manager.composeTarget}
              filteredRules={manager.filteredRules}
              isComposing={manager.isComposing}
              onClearSelection={manager.clearComposeSelection}
              onCompose={() => void manager.handleComposeExport()}
              onComposeTargetChange={manager.setComposeTarget}
              onToggleRule={manager.toggleComposeRule}
              onToggleTag={manager.toggleComposeTag}
              selectedComposeRuleIds={manager.selectedComposeRuleIds}
              selectedComposeTags={manager.selectedComposeTags}
              t={t}
            />
          ) : null}
        </main>
      </div>
    </div>
  );
}
