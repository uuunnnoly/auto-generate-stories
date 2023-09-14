const vscode = require('vscode');
const fs = require('fs');
const generateStoriesTemplate = require('./generateStories');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	let disposable = vscode.commands.registerCommand('autoGenerateStories', function (uri) {
		return generateStories(uri?.fsPath);
	});

	context.subscriptions.push(disposable);
}

function deactivate() { }

async function generateStories(path) {
	if (!path) {
    path = vscode.window.activeTextEditor?.document.uri.fsPath ?? "";
  }
  const stats = fs.statSync(path);

  if (stats.isDirectory()) {
		const stories = generateStoriesTemplate(path);
		fs.writeFile(`${path}/index.stories.tsx`, stories,
      (err) => {
        if (err) throw err;
      });
	}
}

module.exports = {
	activate,
	deactivate
}
