---
tag:
  - AI
tags:
  - AI
categories:
  - AI
---

# windows 下 codex 的 ComputerUse 不可用

先诊断，确认问题不是配置项，而是 bundled 插件缓存半更新：`openai-bundled` 的 marketplace 和 `chrome` / `computer-use` cache 缺失。然后备份 `.codex` 关键文件，停止插件进程，从 Codex 安装目录里的 bundled 插件源重新复制 marketplace，重建插件 cache 和 `latest` junction。中途发现 Windows 目录带了 EFS 加密属性，导致 `Copy-Item` 报 “The specified file could not be encrypted”，所以改用 `robocopy /COPY:DAT` 并对新建的 bundled 插件目录移除加密属性。最后验证 `marketplace.json` 可解析、Chrome/Computer Use 插件文件存在、native host 没有指向 `.tmp` 或 `latest` 的坏路径。

在 Codex 用，可以直接复制下面这段提示词：

````text
你现在要在 Windows 本机环境中排查并尽量修复 Codex Desktop 的 bundled 插件异常，重点恢复 Computer Use / Chrome 插件。

请始终用中文回复，并按“先诊断、再备份、再修复、最后验证”的顺序执行。所有路径必须使用环境变量，例如 `$env:USERPROFILE`、`$env:LOCALAPPDATA`、`$env:ProgramFiles`，不要写死用户名。

目标症状可能包括：
- Computer Use 或 Chrome 插件消失、不可用、图标不加载。
- 插件页能看到 `computer-use@openai-bundled` / `chrome@openai-bundled`，但点进去报：
  `marketplace file "%USERPROFILE%\.codex\.tmp\bundled-marketplaces\openai-bundled\.agents\plugins\marketplace.json" does not exist`
- Settings 里 Computer Use 显示 unavailable。
- 日志里出现 `EBUSY`、`resource busy or locked`、`plugin_cache_windows_file_lock`、`os error 5`、`extension-host.exe`、`extension-host\windows\x64` 等关键词。
- 复制 WindowsApps 资源时报 `The specified file could not be encrypted`。

请执行以下流程：

1. 初始化变量：

```powershell
$CodexHome = Join-Path $env:USERPROFILE ".codex"
$BackupRoot = Join-Path $env:USERPROFILE "codex-plugin-backups"
$OpenAILocal = Join-Path $env:LOCALAPPDATA "OpenAI"
$CodexLocal = Join-Path $OpenAILocal "Codex"
$ExtensionManifest = Join-Path $OpenAILocal "extension\com.openai.codexextension.json"
$CodexNativeHosts = Join-Path $CodexHome "chrome-native-hosts.json"
$LocalNativeHosts = Join-Path $CodexLocal "chrome-native-hosts.json"
$BundledTmpRoot = Join-Path $CodexHome ".tmp\bundled-marketplaces\openai-bundled"
$BundledMarketplaceJson = Join-Path $BundledTmpRoot ".agents\plugins\marketplace.json"
$PluginCacheRoot = Join-Path $CodexHome "plugins\cache\openai-bundled"
$ChromeCacheRoot = Join-Path $PluginCacheRoot "chrome"
$ComputerUseCacheRoot = Join-Path $PluginCacheRoot "computer-use"
```

2. 先只读诊断，不要一开始删除目录：

- 检查 `$BundledMarketplaceJson` 是否存在并能否 `ConvertFrom-Json`。
- 检查 `$ChromeCacheRoot\latest\scripts`、`$ChromeCacheRoot\latest\extension-host` 是否存在。
- 检查 `$ComputerUseCacheRoot\latest\.codex-plugin\plugin.json`、`$ComputerUseCacheRoot\latest\scripts`、`$ComputerUseCacheRoot\latest\scripts\computer-use-client.mjs` 是否存在。
- 注意：新版 Computer Use 不一定有 `extension-host\windows\x64`，不要仅凭这个路径缺失就判断失败。
- 检查 native host / extension manifest 是否包含 `.tmp`、`chrome\latest`、`computer-use\latest` 坏引用。
- 搜索 Codex 日志关键词，但不要输出 token / API key / auth.json 内容。

3. 修复前必须备份：

```powershell
$Stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$BackupDir = Join-Path $BackupRoot "openai-bundled-lock-repair-$Stamp"
New-Item -ItemType Directory -Force -Path $BackupDir | Out-Null

$FilesToBackup = @(
  (Join-Path $CodexHome "config.toml"),
  (Join-Path $CodexHome ".codex-global-state.json"),
  $CodexNativeHosts,
  $LocalNativeHosts,
  $ExtensionManifest
)

foreach ($file in $FilesToBackup) {
  if (Test-Path -LiteralPath $file) {
    Copy-Item -LiteralPath $file -Destination $BackupDir -Force
  }
}
```

4. 停止插件进程：

```powershell
Get-Process extension-host -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process codex-computer-use -ErrorAction SilentlyContinue | Stop-Process -Force
```

5. 从 Codex 安装目录查找 bundled 插件源：

```powershell
$Source = Get-ChildItem -Path (Join-Path $env:ProgramFiles "WindowsApps") -Directory -Filter "OpenAI.Codex*" |
  ForEach-Object {
    $candidate = Join-Path $_.FullName "app\resources\plugins\openai-bundled"
    $marketplace = Join-Path $candidate ".agents\plugins\marketplace.json"
    if (Test-Path -LiteralPath $marketplace) {
      [pscustomobject]@{ Path = $candidate; Package = $_.Name; LastWriteTime = $_.LastWriteTime }
    }
  } |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 1

if (-not $Source) {
  throw "没有找到 Codex bundled 插件源：`$env:ProgramFiles\WindowsApps\OpenAI.Codex*\app\resources\plugins\openai-bundled"
}
```

6. 重建 bundled marketplace。优先用 `robocopy`，不要用普通 `Copy-Item`，因为 WindowsApps 复制时可能触发 EFS 加密错误：

```powershell
if (Test-Path -LiteralPath $BundledTmpRoot) {
  Remove-Item -LiteralPath $BundledTmpRoot -Recurse -Force
}

New-Item -ItemType Directory -Force -Path $BundledTmpRoot | Out-Null
$RoboLog = Join-Path $BackupDir "robocopy-bundled-marketplace.log"

robocopy $Source.Path $BundledTmpRoot /MIR /COPY:DAT /DCOPY:DAT /R:2 /W:1 /XJ /NP /NFL /NDL /LOG:$RoboLog | Out-Null

if ($LASTEXITCODE -ge 8) {
  throw "robocopy bundled marketplace failed: $RoboLog"
}
```

7. 重建 plugin cache：

```powershell
$SourceChrome = Join-Path $BundledTmpRoot "plugins\chrome"
$SourceComputerUse = Join-Path $BundledTmpRoot "plugins\computer-use"

if (-not (Test-Path -LiteralPath $SourceChrome)) {
  $SourceChrome = Join-Path $BundledTmpRoot ".agents\plugins\chrome"
}
if (-not (Test-Path -LiteralPath $SourceComputerUse)) {
  $SourceComputerUse = Join-Path $BundledTmpRoot ".agents\plugins\computer-use"
}

if (-not (Test-Path -LiteralPath $SourceChrome)) {
  throw "bundled source missing chrome plugin directory"
}
if (-not (Test-Path -LiteralPath $SourceComputerUse)) {
  throw "bundled source missing computer-use plugin directory"
}

if (Test-Path -LiteralPath $ChromeCacheRoot) {
  Remove-Item -LiteralPath $ChromeCacheRoot -Recurse -Force
}
if (Test-Path -LiteralPath $ComputerUseCacheRoot) {
  Remove-Item -LiteralPath $ComputerUseCacheRoot -Recurse -Force
}

$ChromeCacheVersion = Join-Path $ChromeCacheRoot "current"
$ComputerUseCacheVersion = Join-Path $ComputerUseCacheRoot "current"

New-Item -ItemType Directory -Force -Path $ChromeCacheVersion | Out-Null
New-Item -ItemType Directory -Force -Path $ComputerUseCacheVersion | Out-Null

robocopy $SourceChrome $ChromeCacheVersion /MIR /COPY:DAT /DCOPY:DAT /R:2 /W:1 /XJ /NP /NFL /NDL | Out-Null
if ($LASTEXITCODE -ge 8) { throw "robocopy chrome cache failed" }

robocopy $SourceComputerUse $ComputerUseCacheVersion /MIR /COPY:DAT /DCOPY:DAT /R:2 /W:1 /XJ /NP /NFL /NDL | Out-Null
if ($LASTEXITCODE -ge 8) { throw "robocopy computer-use cache failed" }

New-Item -ItemType Junction -Path (Join-Path $ChromeCacheRoot "latest") -Target $ChromeCacheVersion | Out-Null
New-Item -ItemType Junction -Path (Join-Path $ComputerUseCacheRoot "latest") -Target $ComputerUseCacheVersion | Out-Null
```

8. 如果目录带 `Encrypted` 属性，递归移除本次涉及目录的 EFS 加密属性：

```powershell
foreach ($p in @($BundledTmpRoot, $PluginCacheRoot)) {
  if (Test-Path -LiteralPath $p) {
    cipher /d /s:$p | Out-Null
  }
}
```

9. 不要盲目修改 `[windows] sandbox`。除非明确发现配置本身就是根因，否则不要动 config.toml 的 sandbox 配置。

10. 最终验证：

- `$BundledMarketplaceJson` 存在。
- `$BundledMarketplaceJson` 可以 `ConvertFrom-Json`。
- marketplace 内容包含 `chrome` 和 `computer-use`。
- `$ChromeCacheRoot\latest\scripts` 存在。
- `$ChromeCacheRoot\latest\extension-host` 存在。
- `$ComputerUseCacheRoot\latest\.codex-plugin\plugin.json` 存在。
- `$ComputerUseCacheRoot\latest\scripts` 存在。
- `$ComputerUseCacheRoot\latest\scripts\computer-use-client.mjs` 存在。
- native host / extension manifest 不再指向 `.tmp`、`chrome\latest`、`computer-use\latest`。
- 最后提示用户重启 Codex Desktop，再检查 Plugins 和 Settings 里的 Computer Use 状态。

如果 PowerShell 无法直接执行，请把以上流程生成一个 `.ps1` 脚本，并提醒用户用普通 PowerShell 或管理员 PowerShell 执行。

```

````
