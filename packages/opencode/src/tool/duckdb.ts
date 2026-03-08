import z from "zod"
import { Tool } from "./tool"
import { $ } from "bun"
import path from "path"
import fs from "fs"
import DESCRIPTION from "./duckdb.txt"
import { Instance } from "../project/instance"

const DUCKDB_VERSION = "1.4.4"
const DUCKDB_CLI_NAME = process.platform === "win32" ? "duckdb.exe" : "duckdb"

function getDuckDBCliPath(): string {
  const sidecarName = process.platform === "darwin" 
    ? "duckdb-universal-apple-darwin"
    : process.platform === "win32"
    ? "duckdb-x86_64-pc-windows-msvc.exe"
    : `duckdb-${process.arch}-linux-gnu`
  
  // First check sidecars directory
  const sidecarPath = path.join(Instance.directory, "sidecars", sidecarName)
  if (fs.existsSync(sidecarPath)) {
    return sidecarPath
  }
  
  // Then check bin directory (for CLI builds)
  const binPath = path.join(Instance.directory, "bin", DUCKDB_CLI_NAME)
  if (fs.existsSync(binPath)) {
    return binPath
  }
  
  // Fallback to system duckdb
  return "duckdb"
}

export const DuckDBTool: Tool.Info = {
  id: "duckdb",
  init: async () => ({
    description: DESCRIPTION,
    parameters: z.object({
      query: z.string().describe("SQL query to execute"),
    }),
    generate: async (args) => {
      const { query } = args
      const cliPath = getDuckDBCliPath()
      const dbPath = path.join(Instance.directory, "data.db")
      
      // Ensure directory exists
      const dbDir = path.dirname(dbPath)
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true })
      }
      
      // Create a temporary SQL file for the query
      // This avoids shell escaping issues with complex queries
      const tempFile = path.join(Instance.directory, ".duckdb_query.sql")
      fs.writeFileSync(tempFile, query, "utf-8")
      
      try {
        // Execute query using DuckDB CLI
        // -f: read SQL from file
        // -noheader: don't print column headers
        // -markdown: output in markdown table format
        const result = await $`${cliPath} -noheader -markdown "${dbPath}" -f "${tempFile}"`.quiet()
        
        const output = result.stdout.toString().trim()
        const error = result.stderr.toString().trim()
        
        if (result.exitCode !== 0) {
          return {
            ok: false,
            result: error || `DuckDB exited with code ${result.exitCode}`,
          }
        }
        
        return {
          ok: true,
          result: output || "Query executed successfully",
        }
      } catch (error) {
        return {
          ok: false,
          result: `Failed to execute query: ${error instanceof Error ? error.message : String(error)}`,
        }
      } finally {
        // Clean up temp file
        try {
          fs.unlinkSync(tempFile)
        } catch {
          // Ignore cleanup errors
        }
      }
    },
  }),
}
