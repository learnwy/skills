import * as vscode from "vscode";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import * as path from "node:path";

const execFileAsync = promisify(execFile);

type WorkspaceSummary = {
  storage_root: string;
  exports_dir: string;
  supported_artifacts: string[];
  supported_targets: string[];
};

export function activate(context: vscode.ExtensionContext): void {
  const output = vscode.window.createOutputChannel("Intelligent Rule Manager");
  const clientPath = path.join(context.extensionPath, "client");
  const clientSpecPath = path.join(clientPath, "docs", "spec.md");

  context.subscriptions.push(output);

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "intelligentRuleManager.openClientFolder",
      async () => {
        await vscode.commands.executeCommand(
          "vscode.openFolder",
          vscode.Uri.file(clientPath),
          true,
        );
      },
    ),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "intelligentRuleManager.openClientSpec",
      async () => {
        const document = await vscode.workspace.openTextDocument(clientSpecPath);
        await vscode.window.showTextDocument(document, {
          preview: false,
        });
      },
    ),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "intelligentRuleManager.runWorkspaceSummary",
      async () => {
        try {
          output.clear();
          output.appendLine("Running rule-cli workspace-summary...");

          const { stdout, stderr } = await execFileAsync(
            "cargo",
            [
              "run",
              "-p",
              "rule-cli",
              "--manifest-path",
              path.join(clientPath, "Cargo.toml"),
              "--",
              "workspace-summary",
            ],
            {
              cwd: clientPath,
            },
          );

          if (stderr.trim()) {
            output.appendLine(stderr.trim());
          }

          output.appendLine(stdout.trim());
          output.show(true);
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Unknown cargo command error";
          output.appendLine(message);
          output.show(true);
          void vscode.window.showErrorMessage(
            `Failed to run workspace summary: ${message}`,
          );
        }
      },
    ),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "intelligentRuleManager.openRulesRoot",
      async () => {
        try {
          const summary = await runWorkspaceSummary(clientPath);
          await vscode.commands.executeCommand(
            "vscode.openFolder",
            vscode.Uri.file(summary.storage_root),
            true,
          );
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Unknown rules root error";
          output.appendLine(message);
          output.show(true);
          void vscode.window.showErrorMessage(
            `Failed to open rules root: ${message}`,
          );
        }
      },
    ),
  );
}

export function deactivate(): void {}

async function runWorkspaceSummary(clientPath: string): Promise<WorkspaceSummary> {
  const { stdout } = await execFileAsync(
    "cargo",
    [
      "run",
      "-p",
      "rule-cli",
      "--manifest-path",
      path.join(clientPath, "Cargo.toml"),
      "--",
      "workspace-summary",
    ],
    {
      cwd: clientPath,
    },
  );

  return JSON.parse(stdout) as WorkspaceSummary;
}

