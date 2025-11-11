#!/usr/bin/env node

/**
 * CLI Script to analyze test files in a local directory and export results to CSV
 * Replicates the functionality of the "/export-csv-local" API endpoint
 * 
 * Usage: node export-csv-local.js <directory> [outputFile]
 * Example: node export-csv-local.js ./src/tests output.csv
 */

import path from "node:path";
import fs from "node:fs";
import helpers from "./src/common/helpers/index.js";
import analyzeService from "./src/services/analyze.service.js";
import astService from "./src/services/ast.service.js";
import { detectors } from "./src/common/detectors/index.js";
import { Parser } from "@json2csv/plainjs";

const csvParser = new Parser({});

async function exportCSVLocal(directory, outputFile = "analysis-results.csv") {
  try {
    // Validate input
    if (!directory) {
      console.error("Error: You must provide a directory path");
      console.log("Usage: node export-csv-local.js <directory> [outputFile]");
      process.exit(1);
    }

    // Validate directory
    const isValidDirectory = helpers.isValidDirectory(directory);
    if (!isValidDirectory) {
      console.error(`Error: Invalid directory format: ${directory}`);
      process.exit(1);
    }

    // Check if directory exists
    const absolutePath = path.resolve(directory);
    if (!fs.existsSync(absolutePath)) {
      console.error(`Error: Directory does not exist: ${absolutePath}`);
      process.exit(1);
    }

    console.log(`\n📁 Analyzing directory: ${absolutePath}`);

    // Perform analysis
    const result = await analyzeService.handleAnalyzeLocal(directory);
    console.log(`✓ Found ${result.length} analysis results`);

    // Filter results to only include files with smells
    const filteredResult = result.filter(
      (re) => !!re.smells && re.smells.length > 0
    );
    console.log(`✓ Filtered to ${filteredResult.length} results with smells`);

    // Split filtered results (one smell per row for CSV)
    const output = await analyzeService.splitFilteredResults(filteredResult);
    console.log(`✓ Split results to ${output.length} CSV rows`);

    // Convert to CSV
    const csv = csvParser.parse(output);

    // Write to file
    const outputPath = path.resolve(outputFile);
    fs.writeFileSync(outputPath, csv, "utf-8");
    console.log(`✓ CSV exported successfully to: ${outputPath}\n`);

    // Print summary
    console.log("📊 Summary:");
    console.log(`   - Total rows in CSV: ${output.length}`);
    console.log(`   - Unique files analyzed: ${new Set(output.map(o => o.file)).size}`);
    
    // Group by type
    const typeGroups = {};
    output.forEach(row => {
      if (!typeGroups[row.type]) {
        typeGroups[row.type] = 0;
      }
      typeGroups[row.type]++;
    });
    console.log("   - Smells by type:");
    Object.entries(typeGroups).forEach(([type, count]) => {
      console.log(`     • ${type}: ${count}`);
    });
    console.log();

    return true;
  } catch (error) {
    console.error("\n❌ An error occurred while analyzing files:");
    console.error(error.message);
    process.exit(1);
  }
}

// Get command line arguments
const args = process.argv.slice(2);
const directory = args[0];
const outputFile = args[1] || "analysis-results.csv";

// Run the script
exportCSVLocal(directory, outputFile);
