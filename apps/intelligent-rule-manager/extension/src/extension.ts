import * as vscode from "vscode";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import * as path from "node:path";
import { normalizeLocale, translate, type Locale } from "./i18n";

const execFileAsync = promisify(execFile);

type WorkspaceSummary = {
  storage_root: string;
  exports_dir: string;
  supported_artifacts: string[];
  supported_targets: string[];
};

type RuleListItem = {
  id: string;
  title: string;
  summary: string;
  groups: string[];
  tags: string[];
  resolved_tags?: string[];
  targets: string[];
  file: string;
};

type RuleDocument = RuleListItem & {
  complexity: number;
  update_frequency: string;
  maintenance_cost: string;
  priority: number;
  last_reviewed: string;
  body: string;
};

type RuleLibraryStats = {
  count: number;
  average_complexity: number;
  average_update_frequency: number;
  average_maintenance_cost: number;
  tag_count: number;
  group_count: number;
};

type VisualizationRecommendation = {
  recommendation: string;
  score: number;
  stats: RuleLibraryStats;
  reasons: string[];
  suggested_features: string[];
};

type AppContext = {
  appRoot: string;
  clientPath: string;
  cliManifestPath: string;
  docsPath: string;
  extensionPath: string;
  locale: Locale;
  output: vscode.OutputChannel;
};

export function activate(context: vscode.ExtensionContext): void {
  const locale = normalizeLocale(vscode.env.language);
  const output = vscode.window.createOutputChannel(
    translate(locale, "channel.name"),
  );
  const appRoot = path.resolve(context.extensionPath, "..");
  const app: AppContext = {
    appRoot,
    clientPath: path.join(appRoot, "client"),
    cliManifestPath: path.join(appRoot, "cli", "Cargo.toml"),
    docsPath: path.join(appRoot, "docs"),
    extensionPath: context.extensionPath,
    locale,
    output,
  };

  context.subscriptions.push(output);

  const register = (
    command: string,
    handler: () => Promise<void>,
  ) => context.subscriptions.push(vscode.commands.registerCommand(command, handler));

  register("intelligentRuleManager.openClientFolder", async () => {
    await vscode.commands.executeCommand(
      "vscode.openFolder",
      vscode.Uri.file(app.clientPath),
      true,
    );
  });

  register("intelligentRuleManager.openCliFolder", async () => {
    await vscode.commands.executeCommand(
      "vscode.openFolder",
      vscode.Uri.file(path.join(app.appRoot, "cli")),
      true,
    );
  });

  register("intelligentRuleManager.openExtensionFolder", async () => {
    await vscode.commands.executeCommand(
      "vscode.openFolder",
      vscode.Uri.file(app.extensionPath),
      true,
    );
  });

  register("intelligentRuleManager.openWorkspaceOverview", async () => {
    await openTextDocument(path.join(app.appRoot, "README.md"));
  });

  register("intelligentRuleManager.openClientSpec", async () => {
    await openTextDocument(path.join(app.docsPath, "spec.md"));
  });

  register("intelligentRuleManager.runWorkspaceSummary", async () => {
    const summary = await runRuleCliJson<WorkspaceSummary>(app, [
      "workspace-summary",
    ]);

    app.output.clear();
    app.output.appendLine(translate(app.locale, "output.workspaceSummary"));
    app.output.appendLine(JSON.stringify(summary, null, 2));
    app.output.show(true);

    void vscode.window.showInformationMessage(
      translate(app.locale, "info.rulesRoot", { path: summary.storage_root }),
    );
  });

  register("intelligentRuleManager.openRulesRoot", async () => {
    const summary = await runRuleCliJson<WorkspaceSummary>(app, [
      "workspace-summary",
    ]);
    await vscode.commands.executeCommand(
      "vscode.openFolder",
      vscode.Uri.file(summary.storage_root),
      true,
    );
  });

  register("intelligentRuleManager.listRules", async () => {
    const rule = await pickRule(app);
    if (!rule) {
      return;
    }

    await openTextDocument(rule.file);
  });

  register("intelligentRuleManager.inspectRule", async () => {
    const rule = await pickRule(app);
    if (!rule) {
      return;
    }

    const document = await runRuleCliJson<RuleDocument>(app, [
      "inspect",
      "--file",
      rule.file,
    ]);

    app.output.clear();
    app.output.appendLine(translate(app.locale, "output.ruleDetail", { title: document.title }));
    app.output.appendLine(JSON.stringify(document, null, 2));
    app.output.show(true);

    await openTextDocument(document.file);
  });

  register("intelligentRuleManager.createRule", async () => {
    const title = await vscode.window.showInputBox({
      ignoreFocusOut: true,
      placeHolder: translate(app.locale, "input.create.title.placeholder"),
      prompt: translate(app.locale, "input.create.title.prompt"),
    });
    if (!title?.trim()) {
      return;
    }

    const summary = await vscode.window.showInputBox({
      ignoreFocusOut: true,
      placeHolder: translate(app.locale, "input.create.summary.placeholder"),
      prompt: translate(app.locale, "input.create.summary.prompt"),
    });
    const groups = await askForCsv(
      app,
      translate(app.locale, "field.groups.label"),
      translate(app.locale, "field.groups.placeholder"),
    );
    const tags = await askForCsv(
      app,
      translate(app.locale, "field.tags.label"),
      translate(app.locale, "field.tags.placeholder"),
    );
    const targets = await askForCsv(
      app,
      translate(app.locale, "field.targets.label"),
      translate(app.locale, "field.targets.placeholder"),
    );

    const args = ["create", "--title", title];
    if (summary?.trim()) {
      args.push("--summary", summary.trim());
    }
    if (groups.length > 0) {
      args.push("--groups", groups.join(","));
    }
    if (tags.length > 0) {
      args.push("--tags", tags.join(","));
    }
    if (targets.length > 0) {
      args.push("--targets", targets.join(","));
    }

    const created = await runRuleCliJson<RuleDocument>(app, args);
    await openTextDocument(created.file);
    void vscode.window.showInformationMessage(
      translate(app.locale, "info.createdRule", { title: created.title }),
    );
  });

  register("intelligentRuleManager.showStats", async () => {
    const stats = await runRuleCliJson<RuleLibraryStats>(app, ["stats"]);
    app.output.clear();
    app.output.appendLine(translate(app.locale, "output.ruleLibraryStats"));
    app.output.appendLine(JSON.stringify(stats, null, 2));
    app.output.show(true);

    void vscode.window.showInformationMessage(
      translate(app.locale, "info.statsSummary", {
        count: stats.count,
        tagCount: stats.tag_count,
        groupCount: stats.group_count,
      }),
    );
  });

  register("intelligentRuleManager.showVisualizationRecommendation", async () => {
    const recommendation = await runRuleCliJson<VisualizationRecommendation>(app, [
      "recommend-visualization",
    ]);
    app.output.clear();
    app.output.appendLine(translate(app.locale, "output.visualizationRecommendation"));
    app.output.appendLine(JSON.stringify(recommendation, null, 2));
    app.output.show(true);

    void vscode.window.showInformationMessage(
      translate(app.locale, "info.recommendationSummary", {
        recommendation: recommendation.recommendation,
        score: recommendation.score,
      }),
    );
  });
}

export function deactivate(): void {}

async function pickRule(app: AppContext): Promise<RuleListItem | undefined> {
  const rules = await runRuleCliJson<RuleListItem[]>(app, ["list"]);
  if (rules.length === 0) {
    void vscode.window.showInformationMessage(translate(app.locale, "info.noRulesFound"));
    return undefined;
  }

  return vscode.window.showQuickPick(
    rules.map((rule) => ({
      label: rule.title,
      description: rule.id,
      detail: rule.summary || rule.file,
      rule,
    })),
    {
      ignoreFocusOut: true,
      placeHolder: translate(app.locale, "quickPick.selectRule"),
    },
  ).then((item) => item?.rule);
}

async function askForCsv(
  app: AppContext,
  label: string,
  placeholder: string,
): Promise<string[]> {
  const response = await vscode.window.showInputBox({
    ignoreFocusOut: true,
    placeHolder: placeholder,
    prompt: translate(app.locale, "input.csv.prompt", {
      label: label.toLowerCase(),
    }),
  });

  return (response ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

async function openTextDocument(filePath: string): Promise<void> {
  const document = await vscode.workspace.openTextDocument(filePath);
  await vscode.window.showTextDocument(document, {
    preview: false,
  });
}

async function runRuleCliJson<T>(app: AppContext, args: string[]): Promise<T> {
  try {
    const { stdout, stderr } = await execFileAsync(
      "cargo",
      [
        "run",
        "-p",
        "rule-cli",
        "--manifest-path",
        app.cliManifestPath,
        "--",
        ...args,
      ],
      {
        cwd: app.appRoot,
      },
    );

    if (stderr.trim()) {
      app.output.appendLine(stderr.trim());
    }

    return JSON.parse(stdout) as T;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : translate(app.locale, "error.unknownCargoCommand");
    app.output.appendLine(message);
    app.output.show(true);
    void vscode.window.showErrorMessage(message);
    throw error;
  }
}
