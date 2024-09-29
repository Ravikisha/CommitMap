
# CommitMap

<p float="left">

<a href="https://www.npmjs.com/package/commitmap">
<img src="https://img.shields.io/npm/v/commitmap.svg?style=flat-square">
</a>
<a href="https://www.npmjs.com/package/commitmap">
<img src="https://img.shields.io/npm/l/commitmap.svg?style=flat-square">
</a>
<a href="https://www.npmjs.com/package/commitmap">
<img src="https://img.shields.io/npm/dm/commitmap.svg?style=flat-square">
</a>
<a href="https://www.npmjs.com/package/commitmap">
<img src="https://img.shields.io/david/Ravikisha/commitmap.svg?style=flat-square">
</a>
<img src="https://img.shields.io/github/last-commit/Ravikisha/commitmap?style=flat-square">
<img src="https://img.shields.io/github/issues/Ravikisha/commitmap?style=flat-square">
<img src="https://img.shields.io/github/issues-pr/Ravikisha/commitmap?style=flat-square">
<img src="https://img.shields.io/badge/JavaScript-ES6-yellow?style=flat-square&logo=javascript">
</p>

**CommitMap** is an NPX package that generates a graphical representation of the commits made in the last 6 months across your repositories in Console. It can visualize commit density and patterns for a user-defined or repository-specific email.

<img src="./docs/sample.png" alt="Sample Output" width="100%">

## Features

- Visualizes commits over the last 6 months in a graphical heatmap format.
- Supports multiple repositories.
- Optionally filters commits by email.
- Lightweight and simple to use.

## Installation

You can run `commitmap` directly via NPX, without needing to install it globally:

```bash
npx commitmap --email user@example.com
```

You can also add `commitmap` to your project by installing it via npm:

```bash
npm install commitmap
```

## Usage

### Command-Line Usage

Run the following command in your terminal to generate the commit graph:

```bash
npx commitmap [--email user@example.com]
```

- **--email**: Optional flag to filter commits by a specific email address. If not provided, the graph includes all commits.

### Example

```bash
npx commitmap --email johndoe@example.com
```

This will visualize the commit history for the email `johndoe@example.com` across the last 6 months.

### Options

- `--email` (optional): Provide an email address to filter commits by author.
- If no email is specified, it will show the graph for all commits.

## Requirements

- **Node.js** (version 12 or later)
- Git repositories

## Example Output

The graph generated will resemble a heatmap, showing the density of commits over the last 6 months, with different colors representing different ranges of commits per day.

## Development

If you'd like to contribute, clone the repository and follow these steps:

```bash
git clone https://github.com/Ravikisha/commitmap.git
cd commitmap
npm install
```

### Running Locally

After cloning the repository, you can run the project locally:

```bash
node index.js --email your-email@example.com
```

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more information.

---

Feel free to open issues or submit pull requests to help improve `commitmap`!
