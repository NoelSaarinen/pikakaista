# Software inventory

Checked 2026-11-13. **Installed** means the CLI returned a version or the macOS app bundle was present on the listed teammate’s machine. App versions come from bundle metadata. Hardware connections, account entitlements and project compatibility require their own checks.

| Tool | Purpose | Installation | Version | Team member | Platforms | Source |
| --- | --- | --- | --- | --- | --- | --- |
| Codex desktop | Coding, review and repo context | Installed (active session) | 26.1106.51428 (desktop host) | Patrik | macOS verified locally | [Desktop help](https://help.openai.com/en/articles/20001275-chatgpt-work-and-codex) |
| VS Code | Editor and debugging | Installed | 1.141.0 | Patrik | macOS, Windows, Linux | [Docs](https://code.visualstudio.com/docs) |
| Cursor | AI editor | Unknown | — | Unknown | macOS, Windows, Linux | [Docs](https://cursor.com/docs) |
| PyCharm | Python IDE | Installed | 2026.2.1 | Patrik | macOS, Windows, Linux | [Docs](https://www.jetbrains.com/help/pycharm/) |
| Python | Scripting, backends, ML | Installed | 3.14.7 | Patrik | macOS, Windows, Linux | [Docs](https://docs.python.org/3/) |
| Node.js | JavaScript runtime and build tools | Installed | 26.8.1 | Patrik | macOS, Windows, Linux | [Releases](https://nodejs.org/en/about/previous-releases) |
| Git | Version control | Installed | 2.54.0 (Apple Git-157) | Patrik | macOS, Windows, Linux | [Docs](https://git-scm.com/doc) |
| Arduino IDE | Build/upload MCU sketches and use serial monitor | Installed | 2.3.11 | Patrik | macOS, Windows, Linux | [Downloads](https://www.arduino.cc/en/software) |
| Arduino App Lab | UNO Q apps combining Linux, Python and MCU sketches | Installed | 1.0.0 (bundle) | Patrik | macOS verified locally. See vendor builds for other hosts. | [UNO Q guide](https://docs.arduino.cc/tutorials/uno-q/user-manual/) |
| Autodesk Fusion | Parametric CAD and part export | Unknown | — | Unknown | macOS, Windows desktop | [Requirements](https://www.autodesk.com/support/technical/article/caas/sfdcarticles/sfdcarticles/System-requirements-for-Autodesk-Fusion-360.html) |
| OrcaSlicer | Slice models and estimate print time | Installed | 2.5.0 | Patrik | macOS, Windows, Linux | [Project and releases](https://github.com/OrcaSlicer/OrcaSlicer) |
| FastAPI | Optional Python API framework | Unknown | — | Unknown | Supported Python environments | [Docs](https://fastapi.tiangolo.com/) |
| Vite | Optional web prototype tooling | Unknown | — | Unknown | Supported Node environments | [Docs](https://vite.dev/guide/) |
| LeRobot | Robotics control, teleoperation and learning | Unknown | — | Unknown | Python and supported robot/driver combinations | [Docs](https://huggingface.co/docs/lerobot/index) |
| NVIDIA JetPack | Jetson board SDK and drivers | Unknown | — | Unknown | Linux on supported Jetson targets | [JetPack](https://developer.nvidia.com/embedded/jetpack) |
| OpenVINO | Edge inference toolkit | Unknown | — | Unknown | Depends on target and release | [Docs](https://docs.openvino.ai/) |
| Tinkercad | Browser-based CAD for quick parts | Web app | — | Patrik (account reported) | Browser | [Tinkercad](https://www.tinkercad.com/) |
| Tailscale | Private networking between development or demo devices | Unknown | — | Patrik (reported) | Desktop and mobile clients | [Tailscale](https://tailscale.com/) |
| Blender | 3D modeling and rendering | Unknown | — | Patrik (reported) | macOS, Windows, Linux | [Blender](https://www.blender.org/) |
| Hermes Agent | AI agent for tool-assisted workflows | Unknown | — | Patrik (reported) | See upstream setup guide | [Hermes Agent](https://github.com/NousResearch/hermes-agent) |
| Notion | Shared notes and planning | Unknown (web or app) | — | Patrik (reported) | Browser and apps | [Notion](https://www.notion.com/) |
| PowerPoint | Pitch deck and demo slides | Unknown (web or app) | — | Patrik (reported) | Browser and apps | [PowerPoint](https://www.microsoft.com/en-us/microsoft-365/powerpoint) |
| Google Workspace tools | Shared documents, slides and files | Web apps | — | Patrik (reported) | Browser | [Google Workspace](https://workspace.google.com/) |

Patrik reported the tools above on 2026-11-13. Local installs, versions and project-specific access remain unverified where marked unknown. See [RESOURCES.md](RESOURCES.md#team-accounts) for OpenRouter and Vercel accounts.

## Joel’s development environment

Verified locally on 2026-11-13 on macOS 26.6.2 (arm64).

| Tool | Version | Verification |
| --- | --- | --- |
| ChatGPT desktop with Codex | 26.1029.61003 | App bundle and active Codex session in this repository |
| VS Code | 1.145.2 | App bundle |
| Git | 2.50.1 (Apple Git-155) | CLI |
| Node.js | 26.9.0 | CLI |
| npm | 11.19.1 | CLI |
| pnpm | 12.5.1 | CLI |
| Python | 3.9.6 | System CLI (`/usr/bin/python3`) |

Record each confirmed teammate/device, version, and check date. Pick compatible runtime versions after stack selection. In particular, check native dependencies before adopting the installed Python or Node major version. Confirm GitHub clone/push access and the actual printer or board connection before relying on a local installation.
