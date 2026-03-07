import { dialog, shell } from "@tauri-apps/api"
import { basename } from "path"

/**
 * 下载文件（保存到用户选择的位置）
 */
export async function downloadFile(filepath: string): Promise<string | null> {
  try {
    const filename = basename(filepath)
    
    const destination = await dialog.save({
      defaultPath: filename,
      title: "保存文件",
    })

    if (!destination) return null

    const copyCmd = process.platform === "win32" ? "copy" : "cp"
    await shell.execute(copyCmd, [filepath, destination])
    
    return destination
  } catch (error) {
    console.error("Download failed:", error)
    throw error
  }
}

/**
 * 下载文件夹（保存到用户选择的位置）
 */
export async function downloadFolder(folderpath: string): Promise<string | null> {
  try {
    const foldername = basename(folderpath)
    
    const destination = await dialog.save({
      defaultPath: foldername,
      title: "保存文件夹",
    })

    if (!destination) return null

    const copyCmd = process.platform === "win32"
      ? `xcopy "${folderpath}" "${destination}" /E /I /Y`
      : `cp -r "${folderpath}" "${destination}"`
    
    await shell.execute(copyCmd)
    
    return destination
  } catch (error) {
    console.error("Folder download failed:", error)
    throw error
  }
}

/**
 * 批量下载文件
 */
export async function downloadFiles(filepaths: string[]): Promise<number> {
  try {
    const folder = await dialog.open({
      multiple: false,
      directory: true,
      title: "选择保存位置",
    })

    if (!folder) return 0

    let successCount = 0
    
    for (const filepath of filepaths) {
      try {
        const filename = basename(filepath)
        const target = `${folder}/${filename}`
        
        const copyCmd = process.platform === "win32" ? "copy" : "cp"
        await shell.execute(copyCmd, [filepath, target])
        
        successCount++
      } catch (error) {
        console.error(`Failed to download ${basename(filepath)}:`, error)
      }
    }

    return successCount
  } catch (error) {
    console.error("Batch download failed:", error)
    throw error
  }
}
