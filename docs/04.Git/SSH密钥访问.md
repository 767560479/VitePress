# SSH 密钥访问 GitHub/GitLab

首次使用配置全局用户名/邮箱：

```bash
git config --global user.name "你的GitHub用户名"
git config --global user.email "你的GitHub注册邮箱"
```

查看 Git 配置

```bash
git config --list
```

## 2. 生成 SSH 密钥

```bash
ssh-keygen -t rsa -C "你的GitHub注册邮箱"
```

## 3. 添加 SSH 密钥到 ssh-agent

```bash
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_rsa
```

## 4. 添加 SSH 密钥到 GitHub/GitLab

将 SSH 公钥添加到 GitHub/GitLab 账户中，以便 GitHub/GitLab 可以验证你的身份。

查看公钥：cat ~/.ssh/id_rsa.pub（Windows 也可用 notepad ~/.ssh/id_rsa.pub）

将公钥添加到 GitHub / GitLab / Gitee 等平台：Settings → SSH and GPG keys → New SSH key

测试连接：

bash

```bash
ssh -T git@github.com
```

## 5. 配置 SSH 密钥

```bash
git remote set-url origin git@github.com:用户名/仓库名.git
```

## 关于用户名/邮箱的影响

- 全局配置会影响所有仓库的提交记录（显示在 GitHub/GitLab 的提交历史中）。

- 不会影响各平台的登录账号（登录凭据由 SSH 或 HTTPS 单独管理）。

- 建议：为工作仓库单独设置局部配置，避免混淆：

```bash
cd 公司项目目录
git config user.name "公司用户名"
git config user.email "公司邮箱@example.com"
```

## SSH 密钥在多平台使用

同一个公钥可以添加到多个平台（GitHub、GitLab 等），技术上可行。

更推荐：每个平台单独生成密钥对，便于管理和撤销权限。

单独生成示例（GitLab）：

```bash
ssh-keygen -t ed25519 -C "your_email@example.com" -f ~/.ssh/id_ed25519_gitlab
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519_gitlab
```

管理多个密钥：创建 ~/.ssh/config

```bash
Host gitlab.com
    HostName gitlab.com
    User git
    IdentityFile ~/.ssh/id_ed25519_gitlab
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_github
```

## SSH 密钥的撤销

GitHub/GitLab 等平台提供了 SSH 密钥的撤销功能，但无法撤销已经添加到 ssh-agent 的密钥。

如果需要撤销 SSH 密钥，需要手动删除密钥文件（~/.ssh/id_rsa 和 ~/.ssh/id_rsa.pub）。
