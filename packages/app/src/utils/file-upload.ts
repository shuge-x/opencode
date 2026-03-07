import { dialog, shell } from "@tauri-apps/api"
import { basename } from "path"

/**
 * 上传文件到指定目录
 */
export async function uploadFiles(targetDir: string): Promise<number> {
  try {
    const selected = await dialog.open({
      multiple: true,
      directory: false,
      defaultPath: targetDir,
      title: "选择要上传的文件",
    })

    if (!selected) return 0

    const files = Array.isArray(selected) ? selected : [selected]
    let successCount = 0

    for (const file of files) {
      try {
        const filename = basename(file)
        const target = `${targetDir}/${filename}`
        
        const copyCmd = process.platform === "win32" ? "copy" : "cp"
        await shell.execute(copyCmd, [file, target])
        
        successCount++
      } catch (error) {
        console.error(`Failed to upload ${basename(file)}:`, error)
      }
    }

    return successCount
  } catch (error) {
    console.error("Upload failed:", error)
    throw error
  }
}

/**
 * 上传文件夹到指定目录
 */
export async function uploadFolder(targetDir: string): Promise<boolean> {
  try {
    const selected = await dialog.open({
      multiple: false,
      directory: true,
      defaultPath: targetDir,
      title: "选择要上传的文件夹",
    })

    if (!selected) return false

    const foldername = basename(selected as string)
    const target = `${targetDir}/${foldername}`
    
    const copyCmd = process.platform === "win32" 
      ? `xcopy "${selected}" "${target}" /E /I /Y`
      : `cp -r "${selected}" "${target}"`
    
    await shell.execute(copyCmd)
    
    return true
  } catch (error) {
    console.error("Folder upload failed:", error)
    throw error
  }
}
