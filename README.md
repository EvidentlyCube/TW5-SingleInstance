# Single Instance [TiddlyWiki5 Plugin]

A simple plugin that prevents you from accidentally editing the wiki in two different tabs/browsers/machines at the same time.

When you open the wiki in a new tab the server will inform the previously open instance that another one has taken over the focus.

## Requirements:

 * Server must have `ws` installed and accessible via `require`
 * After the installation the server must be restarted
 * It will only work with wikis started with the `--server` command