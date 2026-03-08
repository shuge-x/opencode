import z from "zod"
import { Tool } from "./tool"
import { DuckDBInstance } from "@duckdb/node-api"
import path from "path"
import DESCRIPTION from "./duckdb.txt"
import { Instance } from "../project/instance"

const databases = new Map<string, DuckDBInstance>()

function formatValue(value: any): string {
  if (value === null || value === undefined) return "NULL"
  if (typeof value === "string") return value
  if (typeof value === "number" || typeof value === "boolean") return String(value)
  if (value instanceof Date) return value.toISOString()
  if (typeof value === "object") return JSON.stringify(value)
  return String(value)
}

export const DuckDBTool: Tool.Info = {
  id: "duckdb",
  init: async () => ({
    description: DESCRIPTION,
    parameters: z.object({
      query: z.string().describe("SQL query to execute"),
      database: z
        .string()
        .describe(
          "Path to .duckdb file for persistent storage. If not provided, uses in-memory database. The file will be created if it doesn't exist.",
        )
        .optional(),
    }),
    execute: async (args: { query: string; database?: string }, ctx) => {
      const dbKey = args.database || "in-memory"

      try {
        if (args.database) {
          let dbPath = args.database
          if (!path.isAbsolute(dbPath)) {
            dbPath = path.resolve(Instance.directory, dbPath)
          }

          if (!databases.has(dbKey)) {
            databases.set(dbKey, await DuckDBInstance.create(dbPath))
          }
        } else {
          if (!databases.has(dbKey)) {
            databases.set(dbKey, await DuckDBInstance.create())
          }
        }

        const db = databases.get(dbKey)!
        const connection = await db.connect()

        try {
          const result = await connection.run(args.query)
          const rows = await result.getRows()
          const columns = await result.columnNames()

          if (rows.length === 0) {
            return "Query executed successfully. No rows returned."
          }

          const maxRows = 100
          const displayRows = rows.slice(0, maxRows)

          const lines: string[] = []
          lines.push("Columns: " + columns.join(", "))
          lines.push("")
          lines.push(`Results (${rows.length} rows):`)
          lines.push("")

          for (const row of displayRows) {
            lines.push(
              row
                .map((value, idx) => {
                  const formatted = formatValue(value)
                  return `${columns[idx]}: ${formatted}`
                })
                .join(" | "),
            )
          }

          if (rows.length > maxRows) {
            lines.push("")
            lines.push(`... and ${rows.length - maxRows} more rows`)
          }

          lines.push("")
          lines.push("JSON representation:")
          lines.push(
            JSON.stringify(
              displayRows.map((row) => {
                const obj: Record<string, any> = {}
                columns.forEach((col, idx) => {
                  obj[col] = row[idx]
                })
                return obj
              }),
              null,
              2,
            ),
          )

          return lines.join("\n")
        } finally {
          await connection.disconnect()
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        throw new Error(`DuckDB query failed: ${errorMessage}\nQuery: ${args.query}`)
      }
    },
  }),
}
