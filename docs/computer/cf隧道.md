# cloudflared 隧道

## 安装

打开 cloudflared, 在 Zero Trust → Networks → Tunnels
创建一个隧道，选择一个域名，然后点击创建。

在创建成功后，cloudflared 会生成一个 token，复制这个 token。

在本地安装 cloudflared，然后运行以下命令：
windows:

```shell
cloudflared tunnel login
```

macos:

```shell
cloudflared login
```

然后输入刚才复制的 token，即可完成登录。

## 创建隧道

在 cloudflared 中创建一个隧道，选择一个域名，然后点击创建。

在创建成功后，cloudflared 会生成一个 token，复制这个 token。
在本地安装 cloudflared，然后运行以下命令：
windows:

```shell
cloudflared tunnel login
```

macos:

```shell
cloudflared login
```

然后输入刚才复制的 token，即可完成登录。

## 启动隧道

在本地安装 cloudflared，然后运行以下命令：
windows:

```shell
cloudflared tunnel run  http://localhost:8080
```

macos:

```shell
cloudflared tunnel run  http://localhost:8080
```

然后输入刚才复制的 token，即可完成登录。

## 访问隧道

在浏览器中输入刚才创建的域名，即可访问隧道。

## 停止隧道

在本地安装 cloudflared，然后运行以下命令：
windows:

```shell
cloudflared tunnel stop <tunnel-id>
```

macos:

```shell
cloudflared tunnel stop <tunnel-id>
```

其中 `<tunnel-id>` 是刚才创建的隧道的 ID。

## 删除隧道

在 cloudflared 中删除隧道，选择一个域名，然后点击删除。
在本地安装 cloudflared，然后运行以下命令：
windows:

```shell
cloudflared tunnel delete <tunnel-id>
```

macos:

```shell
cloudflared tunnel delete <tunnel-id>
```

其中 `<tunnel-id>` 是刚才创建的隧道的 ID。

## 隧道的 ID。

在 cloudflared 中查看隧道列表，选择一个域名，然后点击查看。
在本地安装 cloudflared，然后运行以下命令：

windows:

```shell
cloudflared tunnel list
```

macos:

```shell
cloudflared tunnel list
```

即可查看隧道列表，其中 `<tunnel-id>` 是刚才创建的隧道的 ID。

## 命名隧道+自定义域名

在 cloudflared 中创建隧道，选择一个域名，然后点击创建。
在本地安装 cloudflared，然后运行以下命令：

windows:

```shell
cloudflared tunnel run --url http://localhost:8080 --name <tunnel-name>
```

macos:

```shellshell
cloudflared tunnel run --url http://localhost:8080 --name <tunnel-name>
```

其中 `<tunnel-name>` 是你为隧道起的名字。

---

## 固定命名隧道 — 使用步骤总结

你当前用的是：**Zero Trust 命名隧道 + Windows 服务（Token）+ 控制台路由 → `127.0.0.1:8787`**。

---

### 一、一次性已做完（一般不用重复）

1. 在 **Zero Trust → Networks → Tunnels** 创建命名隧道
2. 配置路由（你用的是 **已发布应用程序路由** → `http://127.0.0.1:8787`；若有公网域名，再在 **您的主机名路由** 里绑域名）
3. 本机执行过一次（管理员 PowerShell）：

   ```powershell
   cloudflared service install <控制台给的 Token>
   ```

4. 服务装好后，配置会保存在 Windows 服务里，**不用每次 reinstall**。

---

### 二、每次要用外网访问时（日常流程）

**终端 1 — 启动本项目**

```powershell
cd D:\cloudflare\mdm-mcp-poc\mdm-worker
npm run dev
```

等到：`Ready on http://127.0.0.1:8787`

**终端 2 — 启动隧道（若已改为手动且服务是停止状态）**

```powershell
Start-Service Cloudflared
```

**验证**

```powershell
Get-Service Cloudflared          # Status = Running
```

控制台：**Tunnels → 你的隧道 → Healthy**

**外网访问**（用你在控制台配的固定域名，不是 trycloudflare）：

```text
https://你的域名/app-menu
https://你的域名/form-list
```

---

### 三、用完想关掉

```powershell
Stop-Service Cloudflared           # 关隧道
# npm run dev 窗口 Ctrl+C 停 Worker
```

---

### 四、改成「不自动启动」（手动才开）

在 **管理员 PowerShell** 执行一次即可（持久生效）：

```powershell
Set-Service Cloudflared -StartupType Manual
Stop-Service Cloudflared
```

或用图形界面：**`Win + R` → `services.msc`** → 找到 **Cloudflared** → 启动类型选 **手动** → 若正在运行可点停止。

| 启动类型                        | 重启电脑后                                       |
| ------------------------------- | ------------------------------------------------ |
| **自动**（默认 install 后常见） | 隧道自己起来（8787 没开则外网可能 502）          |
| **手动**（推荐 POC）            | 隧道不会自启，需要时 `Start-Service Cloudflared` |

查看当前设置：

```powershell
Get-Service Cloudflared | Select-Object Name, Status, StartType
```

---

### 五、和临时隧道的区别（备忘）

|      | 固定命名隧道（你现在）         | `cloudflared tunnel --url ...` |
| ---- | ------------------------------ | ------------------------------ |
| 域名 | 控制台固定域名                 | 随机 `*.trycloudflare.com`     |
| 配置 | Zero Trust 控制台              | 不用配                         |
| 本机 | Windows 服务 / `Start-Service` | 命令行窗口一直开着             |
| 自启 | 可选手动/自动                  | 无服务，关窗口即断             |

---

### 六、最小记忆版

```text
【一次性】service install Token + 控制台配 8787

【每次使用】
  1. npm run dev
  2. Start-Service Cloudflared   （手动模式下）

【不用了】
  Stop-Service Cloudflared

【不要自启】
  Set-Service Cloudflared -StartupType Manual
```

**注意**：隧道只转发到 **8787**；8787 上必须跑着 `npm run dev`，外网才能访问 mdm-worker。
