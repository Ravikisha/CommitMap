import simpleGit from "simple-git";
import fs from "fs";
import path from "path";
import gitconfig from "git-config-path";
import parse from "parse-git-config";
import extend from "extend-shallow";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";


// Getting the current working directory
const currentDirectory = process.cwd();

// Constants
const outOfRange = 99999;
function calculateDaysInLastSixMonths() {
  const today = new Date();

  // Create a date object representing six months ago
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(today.getMonth() - 6);

  // Calculate the difference in time (in milliseconds)
  const timeDifference = today - sixMonthsAgo;

  // Convert milliseconds to days
  const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

  return daysDifference;
}

const daysInLastSixMonths = calculateDaysInLastSixMonths();

function calculateWeeksInLastSixMonths() {
  return Math.ceil(daysInLastSixMonths / 7);
}

const weeksInLastSixMonths = calculateWeeksInLastSixMonths();

const commits = new Map();

// Get beginning of day
function getBeginningOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

// Count days since a given date
function countDaysSinceDate(date) {
  let days = 0;
  let now = getBeginningOfDay(new Date());
  date = getBeginningOfDay(date);

  while (date < now) {
    date.setDate(date.getDate() + 1);
    days++;
    if (days > daysInLastSixMonths) {
      return outOfRange;
    }
  }
  return days;
}

function getSixMonthsAgoDate() {
  const now = new Date();
  // Subtract 6 months from the current date
  now.setMonth(now.getMonth() - 6);
  return now;
}

// Fill commits by processing the repository at the given path
async function fillCommits(email, repoPath) {
  let git;
  let log;
  try {
    git = await simpleGit(repoPath);
    log = await git.log();
  } catch (err) {
    // check the error is type of GitError
    if (err instanceof simpleGit.GitError) {
      // write message in red color with bold text
      console.error("\x1b[1;31m Error in processing repository: ", repoPath);
      console.error("\x1b[1;31m", err);
    }
    // crash the application
    // process.exit(1);
  }
  // const sixMonthsAgo = getSixMonthsAgoDate();
  

  let offset = calcOffset();

  log.all.forEach((commit) => {
    const authorDate = new Date(commit.date);
    const daysAgo = countDaysSinceDate(authorDate) + offset;
    if (commit.author_email !== email) return;

    if (daysAgo !== outOfRange) {
      commits.set(daysAgo, (commits.get(daysAgo) || 0) + 1);
    }
  });
}


// Process repositories for a given email
async function processRepositories(email, repoPath) {
  await fillCommits(email, repoPath);
}

// Calculate the offset for the current day of the week
function calcOffset() {
  const now = new Date();
  switch (now.getDay()) {
    case 0:
      return 7; // Sunday
    case 1:
      return 6; // Monday
    case 2:
      return 5; // Tuesday
    case 3:
      return 4; // Wednesday
    case 4:
      return 3; // Thursday
    case 5:
      return 2; // Friday
    case 6:
      return 1; // Saturday
  }
}

// Print cells with different colors based on commit counts
function printCell(val, today) {
  let escape = "\x1b[1;37;41m"; // Default color
  if (val > 0 && val < 5) escape = "\x1b[1;30;47m";
  if (val >= 5 && val < 10) escape = "\x1b[1;30;43m";
  if (val >= 10) escape = "\x1b[1;30;42m";
  if (today) escape = "\x1b[1;37;45m";

  if (val === 0) {
    process.stdout.write(`${escape} ${String("0").padStart(2, " ")} \x1b[0m`);
  } else {
    process.stdout.write(`${escape} ${String(val).padStart(2, " ")} \x1b[0m`);
  }
}

// Print commit stats
function printCommitsStats() {
  const keys = Array.from(commits.keys()).sort((a, b) => a - b);
  const cols = buildCols(keys);
  printCells(cols);
}

// Build columns for displaying commits
function buildCols(keys) {
  const cols = {};
  let col = [];

  keys.forEach((k) => {
    let week = Math.floor(k / 7);
    let dayInWeek = k % 7;

    if (dayInWeek === 0) col = [];
    col.push(commits.get(k) || 0);
    if (dayInWeek === 6) cols[week] = col;
  });

  return cols;
}

// Print the cells of the commit graph
function printCells(cols) {
  printMonths();
  for (let j = 6; j >= 0; j--) {
    for (let i = weeksInLastSixMonths - 1; i > 0; i--) {
      if (i === weeksInLastSixMonths - 1) {
        printDayCol(j);
      }
      if (cols[i]) {
        const today = i === 0 && j === calcOffset() - 1;
        printCell(cols[i][j] || 0, today);
      } else {
        printCell(0, false);
      }
    }
    console.log();
  }
}

// Print months at the top of the commit graph
function printMonths() {
  let week = getBeginningOfDay(new Date());
  week.setDate(week.getDate() - daysInLastSixMonths);
  let month = week.getMonth();

  process.stdout.write("       ");
  while (week < new Date()) {
    if (week.getMonth() !== month) {
      process.stdout.write(
        `${week.toLocaleString("default", { month: "short" })} `
      );
      month = week.getMonth();
    } else {
      process.stdout.write("    ");
    }
    week.setDate(week.getDate() + 7);
  }
  console.log();
}

// Print day labels (Monday, Wednesday, Friday)
function printDayCol(day) {
  switch (day) {
    case 1:
      process.stdout.write(" Mon ");
      break;
    case 3:
      process.stdout.write(" Wed ");
      break;
    case 5:
      process.stdout.write(" Fri ");
      break;
    default:
      process.stdout.write("     ");
  }
}

// create a report with total days, months, commits and average commits per day
function createReport() {
  const totalDays = daysInLastSixMonths;
  const totalMonths = Math.floor(totalDays / 30);
  const totalCommits = Array.from(commits.values()).reduce((a, b) => a + b, 0);
  const averageCommitsPerDay = totalCommits / totalDays;

  return {
    totalDays,
    totalMonths,
    totalCommits,
    averageCommitsPerDay,
  };
}

// Print the report in table format
function printReport() {
  const { totalDays, totalMonths, totalCommits, averageCommitsPerDay } =
    createReport();
  const tableHeader = "┌─────────────────────────────┐";
  const tableTitle = "│             Stats           │";
  const tableSeparator = "├─────────────────────────────┤";

  const rows = [
    `│ totalDays:           ${totalDays.toString()}   `
      .padEnd(30, " ")
      .concat("│"),
    `│ totalMonths:         ${totalMonths.toString()} `
      .padEnd(30, " ")
      .concat("│"),
    `│ totalCommits:        ${totalCommits.toString()}`
      .padEnd(30, " ")
      .concat("│"),
    `│ avgCommitsPerDay:    ${averageCommitsPerDay.toFixed(2).toString()} `
      .padEnd(30, " ")
      .concat("│"),
  ];

  const tableFooter = "└─────────────────────────────┘";

  console.log(tableHeader);
  console.log(tableTitle);
  console.log(tableSeparator);

  rows.forEach((row) => {
    console.log(row);
  });

  console.log(tableFooter);
}

function gitUserEmail(opts) {
  opts = extend({ cwd: "/", path: gitconfig("global") }, opts);
  var config = parse.sync(opts);
  if (typeof config === "object" && config.hasOwnProperty("user")) {
    return config.user.email;
  }
  return null;
}

// Main function to trigger stats generation
async function stats(email, rootPath) {
  await processRepositories(email, rootPath);
  printCommitsStats();
  printReport();
  
}

// Set up yargs to handle command-line flags
const argv = yargs(hideBin(process.argv))
  .option("email", {
    alias: "e",
    description: "Your email address (optional)",
    type: "string",
    demandOption: false, // Optional flag
  })
  .option("folder", {
    alias: "f",
    description: "Path to the folder (optional)",
    type: "string",
    demandOption: false, // Optional flag
  })
  .check((argv) => {
    // If the email is provided, validate its format
    const emailPattern =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@(([^<>()[\]\.,;:\s@"]{2,})\.[^<>()[\]\.,;:\s@"]{2,})$/;
    if (argv.email && !emailPattern.test(argv.email)) {
      throw new Error("Invalid email format.");
    }

    if (argv.folder && typeof argv.folder !== "string") {
      throw new Error("Invalid folder path.");
    }

    return true;
  })
  .help()
  .alias("help", "h").argv;

// Extract email from the flags
let email = argv.email;
let rootPath = argv.folder;

// check if email is not provided
if (!email) {
  // get email from git config
  email = gitUserEmail();
}

// check if rootPath is not provided
if (!rootPath) {
  rootPath = currentDirectory;
}
stats(email, rootPath);