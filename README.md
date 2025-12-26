# Flavortown CLI

A command-line interface for interacting with Hack Club Flavortown. This tool allows you to browse projects, view devlogs, and explore the store directly from your terminal.

## Installation

### Via NPM

Install the package globally using npm:

```bash
npm install -g flavortown-cli
```

### Compiled Releases

You can also download standalone executables for your platform from the [GitHub Releases](https://github.com/haumlab/flavortown-cli/releases) page.

*   **macOS**: `flavortown-cli-macos`
*   **Linux**: `flavortown-cli-linux`
*   **Windows**: `flavortown-cli-win.exe`

After downloading, you may need to make the file executable:
```bash
chmod +x flavortown-cli-macos
```

## Setup

Before using the CLI, you must configure your API key.

1. Log in to Flavortown.
2. Navigate to Settings.
3. Generate and copy your API key.
4. Run the setup command:

```bash
flavortown-cli setup
```

Follow the interactive prompt to paste your key.

## Commands

### Projects

List and view details of Flavortown projects.

*   **List projects**: `flavortown-cli projects list`
    *   Options:
        *   `--page <number>`: Specify page number.
        *   `--query <string>`: Search projects by title or description.
        *   `--sort <title|date>`: Sort results (default: date).
*   **Get project details**: `flavortown-cli projects get <id>`

### Devlogs

Browse development logs for specific projects.

*   **List devlogs**: `flavortown-cli devlogs list <projectId>`
    *   Options:
        *   `--page <number>`: Specify page number.
*   **Get devlog details**: `flavortown-cli devlogs get <projectId> <id>`

### Store

Explore items available in the Flavortown store.

*   **List store items**: `flavortown-cli store list`
    *   Options:
        *   `--sort <price-asc|price-desc|name>`: Sort items (default: price-asc).
        *   `--search <query>`: Search items by name or description.
        *   `--type <type>`: Filter by item type.
        *   `--no-group`: Disable automatic grouping of accessories and upgrades.
*   **Get item details**: `flavortown-cli store get <id>`

## Features

### Intelligent Grouping
The store list automatically groups accessories and upgrades under their parent items. For example, RAM upgrades and storage options will appear nested under the MacBook or Mac Mini they belong to.

### Authentication Management
*   **Check status**: `flavortown-cli whoami` shows your current login status.
*   **Logout**: `flavortown-cli logout` clears your saved API key.

## License

ISC
