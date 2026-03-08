import z from "zod"
import { Tool } from "./tool"
import { $ } from "bun"
import path from "path"
import fs from "fs"
import DESCRIPTION from "./duckdb.txt"
import { Instance } from "../project/instance"

const DUCKDB_CLI_NAME = process.platform === "win32" ? "duckdb.exe" : "duckdb"

function getDuckDBCliPath(): string {
  const sidecarName = process.platform === "darwin" 
    ? "duckdb-aarch64-apple-darwin"
    : process.platform === "win32"
    ? "duckdb-x86_64-pc-windows-msvc.exe"
    : `duckdb-${process.arch}-linux-gnu`
  
  const sidecarPath = path.join(Instance.directory, "sidecars", sidecarName)
  if (fs.existsSync(sidecarPath)) {
    return sidecarPath
  }
  
  const binPath = path.join(Instance.directory, "bin", DUCKDB_CLI_NAME)
  if (fs.existsSync(binPath)) {
    return binPath
  }
  
  return "duckdb"
}

export const DuckDBTool: Tool.Info = {
  id: "duckdb",
  init: async () => ({
    description: DESCRIPTION,
    parameters: z.object({
      query: z.string().describe("SQL query to execute"),
    }),
    execute: async (args, ctx) => {
      const { query } = args
      const cliPath = getDuckDBCliPath()
      const dbPath = path.join(Instance.directory, "data.db")
      
      const dbDir = path.dirname(dbPath)
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true })
      }
      
      const tempFile = path.join(Instance.directory, ".duckdb_query.sql")
      fs.writeFileSync(tempFile, query, "utf-8")
      
      try {
        const result = await $`${cliPath} -noheader -markdown "${dbPath}" -f "${tempFile}"`.quiet()
        
        const output = result.stdout.toString().trim()
        const error = result.stderr.toString().trim()
        
        if (result.exitCode !== 0) {
          return {
            title: "DuckDB query failed",
            metadata: {},
            output: error || `DuckDB exited with code ${result.exitCode}`,
          }
        }
        
        return {
          title: "DuckDB query executed",
          metadata: {},
          output: output || "Query executed successfully (no output)",
        }
      } catch (error) {
        return {
          title: "DuckDB error",
          metadata: {},
          output: `Failed to execute query: ${error instanceof Error ? error.message : String(error)}`,
        }
      } finally {
        try {
          fs.unlinkSync(tempFile)
        } catch {}
      }
    },
  }),
}
