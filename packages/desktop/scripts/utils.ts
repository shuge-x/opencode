import { $ } from "bun"

export const SIDECAR_BINARIES: Array<{ rustTarget: string; ocBinary: string; assetExt: string }> = [
  {
    rustTarget: "aarch64-apple-darwin",
    ocBinary: "opencode-darwin-arm64",
    assetExt: "zip",
  },
  {
    rustTarget: "x86_64-apple-darwin",
    ocBinary: "opencode-darwin-x64-baseline",
    assetExt: "zip",
  },
  {
    rustTarget: "x86_64-pc-windows-msvc",
    ocBinary: "opencode-windows-x64-baseline",
    assetExt: "zip",
  },
  {
    rustTarget: "x86_64-unknown-linux-gnu",
    ocBinary: "opencode-linux-x64-baseline",
    assetExt: "tar.gz",
  },
  {
    rustTarget: "aarch64-unknown-linux-gnu",
    ocBinary: "opencode-linux-arm64",
    assetExt: "tar.gz",
  },
]

export const RUST_TARGET = Bun.env.RUST_TARGET

export function getCurrentSidecar(target = RUST_TARGET) {
  if (!target && !RUST_TARGET) throw new Error("RUST_TARGET not set")

  const binaryConfig = SIDECAR_BINARIES.find((b) => b.rustTarget === target)
  if (!binaryConfig) throw new Error(`Sidecar configuration not available for Rust target '${RUST_TARGET}'`)

  return binaryConfig
}

export async function copyBinaryToSidecarFolder(source: string, target = RUST_TARGET) {
  await $`mkdir -p src-tauri/sidecars`
  const dest = windowsify(`src-tauri/sidecars/opencode-cli-${target}`)
  await $`cp ${source} ${dest}`

  console.log(`Copied ${source} to ${dest}`)
  
  // Also copy DuckDB dynamic libraries with target-specific naming
  // Tauri expects external binaries to have the format: name-{target}
  const sourceDir = source.substring(0, source.lastIndexOf("/"))
  
  // macOS dylib
  const dylibSource = `${sourceDir}/libduckdb.dylib`
  if (await Bun.file(dylibSource).exists()) {
    const dylibDest = `src-tauri/sidecars/libduckdb-${target}`
    await $`cp ${dylibSource} ${dylibDest}`
    console.log(`Copied ${dylibSource} to ${dylibDest}`)
  }
  
  // Linux .so
  const soSource = `${sourceDir}/libduckdb.so`
  if (await Bun.file(soSource).exists()) {
    const soDest = `src-tauri/sidecars/libduckdb-${target}`
    await $`cp ${soSource} ${soDest}`
    console.log(`Copied ${soSource} to ${soDest}`)
  }
  
  // Windows DLL
  const dllSource = `${sourceDir}/duckdb.dll`
  if (await Bun.file(dllSource).exists()) {
    const dllDest = `src-tauri/sidecars/duckdb-${target}.dll`
    await $`cp ${dllSource} ${dllDest}`
    console.log(`Copied ${dllSource} to ${dllDest}`)
  }
}

export function windowsify(path: string) {
  if (path.endsWith(".exe")) return path
  return `${path}${process.platform === "win32" ? ".exe" : ""}`
}
