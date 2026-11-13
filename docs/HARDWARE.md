# Hardware

Last verified against public sources on 2026-11-13. **Announced** describes organizer or sponsor information. Team checkout, bench stock and exact models are separate checks.

## Hardware Lab by Arduino

The event schedule places hardware sessions on the fifth floor. Arduino’s Friday session is listed for 20:30–21:00 and has limited capacity. See [workshops and support](RESOURCES.md). [Official event site](https://2026.hackjunction.com/)

| Equipment | Model and capability | Event status | Software / drivers | Access and source |
| --- | --- | --- | --- | --- |
| Arduino development board | **UNO Q**. Qualcomm QRB2210 runs Debian; STM32U585 runs real-time Arduino sketches over Zephyr. Vendor variants have 2/4 GB RAM and 16/32 GB eMMC. | Announced. Lab variant, count and team allocation unknown. | Arduino App Lab for Linux + MCU apps. Arduino IDE 2+ supports MCU sketches only. | Confirm a bench unit and USB-C data/power setup. [Event](https://2026.hackjunction.com/) · [Arduino manual](https://docs.arduino.cc/tutorials/uno-q/user-manual/) |
| NVIDIA edge AI boards | **Jetson** family. Exact dev kit, RAM and accelerators depend on model. | Announced in Junction’s lab launch post. On-site stock and allocation unknown. | Match JetPack to the exact board and existing image. | Confirm kit, power supply and approved imaging workflow. [Junction launch post reproduced on Arduino’s page](https://gb.linkedin.com/company/arduino/) · [JetPack](https://developer.nvidia.com/embedded/jetpack) |
| Arduino sensors | **Modulino** family for UNO Q hands-on exercises. Sensor variants unknown. | Announced for the Arduino workshop. Takeaway and general checkout unknown. | App Lab or compatible Arduino libraries as directed by staff. | Limited workshop seats. [Workshop schedule](https://2026.hackjunction.com/#workshops) · [Modulino docs](https://docs.arduino.cc/hardware/modulino/) |
| Electronics | Assorted prototyping components. Exact sensors, wiring, modules and counts unknown. | Category announced. | Depends on component and bus. | Confirm part numbers, voltage and connectors at the bench. [Event](https://2026.hackjunction.com/) |
| Robot arms | **LeRobot** arms announced. Exact model, degrees of freedom and payload unknown. | Announced. Ignite Next × Intel’s challenge also mentions robot arms and cameras. Whether those are the same units is unknown. | Check the arm model, serial adapters, firmware and vendor-supplied environment before setup. | Ask staff about checkout, calibration and supervision. [Event](https://2026.hackjunction.com/) · [Junction announcements](https://gt.linkedin.com/company/hackjunction) · [LeRobot docs](https://huggingface.co/docs/lerobot/index) |
| Robotics cameras | Camera models, resolution and interface unknown. | Announced for Ignite Next × Intel’s challenge. General checkout unknown. | Confirm whether USB/UVC or a vendor SDK is required. | Confirm whether cameras are reserved for challenge teams. [Junction announcements](https://gt.linkedin.com/company/hackjunction) |
| Motion capture | Rokoko gear for translating movement into data. Models and accessories unknown. | Announced for participants in the partner post. Allocation unknown. | Confirm Rokoko Studio and export workflow at the booth. | Ask Rokoko for access and mentoring. [Junction announcements](https://gt.linkedin.com/company/hackjunction) · [Rokoko help](https://support.rokoko.com/) |
| 3D printing | On-site printers for mounts, enclosures and custom parts. Exact models, materials and nozzle sizes unknown. | Announced. Queue and per-team time limits unknown. | Use the lab’s approved slicer, profile and file format. | Ask who operates printers and how jobs are queued. [Event](https://2026.hackjunction.com/) |
| Other fabrication and bench tools | Soldering stations, multimeters, hand tools, laser cutting and CNC are possibilities. Exact capabilities unknown. | Unknown. | Depends on equipment. | Ask lab staff about access and training before including a tool in the design. |
| Other MCU boards | ESP32, Raspberry Pi and other Arduino boards are possible alternatives. | Unknown. | Model-specific. | Confirm local stock or record a teammate-owned unit in [TEAM.md](TEAM.md). |

## Keep the prototype quick to build

- Validate the electronics and software on the bench first. For the demo, print a small bracket, spacer or adapter if it solves a concrete problem. Use stock fasteners or a temporary mount for early iterations.
- Minimize part height and volume. Orient flat faces to avoid supports. With the staff-approved profile, use a draft layer height and modest infill when the part’s loads allow it.
- Slice early and review the estimated time, material and supports. Print a small test of critical holes or mating surfaces before committing a long job. Include queue time in the build plan.
- Save editable CAD and agreed exports under [hardware/cad](../hardware/cad/) and reproducible firmware under [hardware/firmware](../hardware/firmware/). Record exact parts, pin mappings and the working board or printer profile once verified.
