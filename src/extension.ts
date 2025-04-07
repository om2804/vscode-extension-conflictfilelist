import * as vscode from "vscode";
import { Change, GitExtension, Repository } from "./api/git";

export function activate(context: vscode.ExtensionContext) {

	const disposable = vscode.commands.registerCommand('extension.insertConflictFileList', async (uri?: any) => {

		vscode.commands.executeCommand("workbench.view.scm");

		const repository = getGitRepository(uri);
		if (!repository) {
			vscode.window.showErrorMessage('No Git repository found.');
			return;
		}

		const state = repository.state;
		const conflictedFiles = state.mergeChanges.filter((change: any) => change.status === 18);

		if (conflictedFiles.length === 0) {
			vscode.window.showInformationMessage('No conflicted files found.');
			return;
		}

		const repositoryPathLength = repository.rootUri.fsPath.length + 1;
		const fileList = conflictedFiles.map(change => `* ${change.uri.fsPath.substring(repositoryPathLength)}`).join('\n');

		repository.inputBox.value = `${repository.inputBox.value}\nConflicts:\n${fileList}`;

		vscode.window.showInformationMessage('Conflict files inserted into commit message.');
	});

	context.subscriptions.push(disposable);
}

function getGitExtension() {
	const vscodeGit = vscode.extensions.getExtension<GitExtension>("vscode.git");
	const gitExtension = vscodeGit && vscodeGit.exports;
	return gitExtension && gitExtension.getAPI(1);
}

function getGitRepository(resourceUri?: any): Repository | undefined {
	const git = getGitExtension();
	if (!git) {
		vscode.window.showErrorMessage("Unable to load Git Extension");
		return;
	}

	if (git.repositories.length <= 0) {
		vscode.window.showErrorMessage('No Git repository found.');
		return;
	}

	if (!resourceUri) {
		return git.repositories[0];
	}

	return git.repositories.find(repository =>
		resourceUri.rootUri.fsPath.startsWith(repository.rootUri.fsPath));
}

export function deactivate() { }