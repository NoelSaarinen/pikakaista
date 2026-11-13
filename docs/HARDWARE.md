# Hardware

Public sources and the Hardware Lab catalogue checked on 2026-11-13. **Announced** describes organizer or sponsor information. Team checkout, bench stock and exact models are separate checks.

## Hardware Lab by Arduino

The event schedule places hardware sessions on the fifth floor. Arduino’s Friday session is listed for 20:30–21:00 and has limited capacity. See [workshops and support](RESOURCES.md). [Official event site](https://2026.hackjunction.com/)

| Equipment | Model and capability | Event status | Software / drivers | Access and source |
| --- | --- | --- | --- | --- |
| Arduino development board | **UNO Q**. Qualcomm QRB2210 runs Debian; STM32U585 runs real-time Arduino sketches over Zephyr. Vendor variants have 2/4 GB RAM and 16/32 GB eMMC. | The loan brief lists 2 GB RAM and 16 GB eMMC. Count and team allocation unknown. | Arduino App Lab for Linux + MCU apps. Arduino IDE 2+ supports MCU sketches only. | Confirm a bench unit and USB-C data/power setup. [Event](https://2026.hackjunction.com/) · [Arduino manual](https://docs.arduino.cc/tutorials/uno-q/user-manual/) |
| NVIDIA edge AI boards | **Jetson** family. Exact dev kit, RAM and accelerators depend on model. | Announced in Junction’s lab launch post. On-site stock and allocation unknown. | Match JetPack to the exact board and existing image. | Confirm kit, power supply and approved imaging workflow. [Junction launch post reproduced on Arduino’s page](https://gb.linkedin.com/company/arduino/) · [JetPack](https://developer.nvidia.com/embedded/jetpack) |
| Arduino modules | **Modulino Buzzer, Modulino Knob and Modulino Thermo**. | Listed in the Arduino loan brief. Stock and team allocation unknown. | App Lab or compatible Arduino libraries as directed by staff. | Limited workshop seats. [Workshop schedule](https://2026.hackjunction.com/#workshops) · [Modulino docs](https://docs.arduino.cc/hardware/modulino/) |
| Electronics | Assorted prototyping components. Exact sensors, wiring, modules and counts unknown. | Category announced. | Depends on component and bus. | Confirm part numbers, voltage and connectors at the bench. [Event](https://2026.hackjunction.com/) |
| Robot arms | **LeRobot** arms announced. Exact model, degrees of freedom and payload unknown. | Announced. Ignite Next × Intel’s challenge also mentions robot arms and cameras. Whether those are the same units is unknown. | Check the arm model, serial adapters, firmware and vendor-supplied environment before setup. | Ask staff about checkout, calibration and supervision. [Event](https://2026.hackjunction.com/) · [Junction announcements](https://gt.linkedin.com/company/hackjunction) · [LeRobot docs](https://huggingface.co/docs/lerobot/index) |
| Robotics cameras | Camera models, resolution and interface unknown. | Announced for Ignite Next × Intel’s challenge. General checkout unknown. | Confirm whether USB/UVC or a vendor SDK is required. | Confirm whether cameras are reserved for challenge teams. [Junction announcements](https://gt.linkedin.com/company/hackjunction) |
| Motion capture | ROKOKO Smartgloves and ROKOKO Suit. Exact versions and accessories unspecified. | Listed in the Hardware Lab catalogue. Allocation unknown. | Confirm Rokoko Studio and export workflow at the booth. | Ask Rokoko for access and mentoring. [Junction announcements](https://gt.linkedin.com/company/hackjunction) · [Rokoko help](https://support.rokoko.com/) |
| 3D printing | On-site printers for mounts, enclosures and custom parts. See the catalogue printer list below. Materials and nozzle sizes unknown. | Announced. Queue and per-team time limits unknown. | Use the lab’s approved slicer, profile and file format. | Ask who operates printers and how jobs are queued. [Event](https://2026.hackjunction.com/) |
| Other fabrication and bench tools | Soldering stations, multimeters, hand tools, laser cutting and CNC are possibilities. Exact capabilities unknown. | Unknown. | Depends on equipment. | Ask lab staff about access and training before including a tool in the design. |
| Other MCU boards | ESP32, Raspberry Pi and other Arduino boards are possible alternatives. | Unknown. | Model-specific. | Confirm local stock or record a teammate-owned unit in [TEAM.md](TEAM.md). |

### Arduino UNO Q loan kit

The Arduino participant brief lists these items on 2026-11-13:

- Arduino UNO Q (2 GB RAM, 16 GB eMMC)
- Arduino USB-C Cable
- Arduino USB-C Hub (8 in 1)
- USB-C Power Supply (45 W)
- Arduino USB Camera
- Modulino Buzzer
- Modulino Knob
- Modulino Thermo

Kits can be borrowed from the Arduino Hardware Lab on the 5th floor. Stock and team allocation need confirmation. [Booking and pickup instructions](https://2026.hackjunction.com/hardware) · [Arduino participant brief](https://hackjunction.app/participate/45/hackerpacks/65)

### Other equipment in the Hardware Lab catalogue

Catalogue checked on 2026-11-13. Availability and team allocation can change. [Live catalogue and checkout](https://2026.hackjunction.com/hardware#catalogue)

| Equipment | Listed models or kit contents | Loan limit |
| --- | --- | --- |
| Atech dev kit | Motherboard, 4 DC motors, 1 distance module (catalogue wording does not identify the model), 2 LED arrays, 2 orientation sensors, 2 buttons, speaker, knob and screen. | No time limit listed |
| Intel Core Ultra X9 Series 3 AI PC | Dell XPS 16 (DA16260) and HP OmniBook Ultra (C2NM8AV). | No time limit listed |
| Meta Ray-Ban Display | Black Standard Frame. | 120 min |
| Ray-Ban Meta GEN2 | Wayfarer, Shiny Black Frame, Transitions Graphite Green Lens. | 240 min |
| ROKOKO Smartgloves | Model generation unspecified. | No time limit listed |
| ROKOKO Suit | Model unspecified. | No time limit listed |

**Desk-managed 3D printers** listed on the same page: Prusa Core One (2), Bambu Lab P1S (5), Original Prusa MK4 (2), Original Prusa I3 (1), Bambu Lab P2S (1) and Prusa Core One Plus (2). Ask at the desk about the queue, materials and printer profiles.

## Keep the prototype quick to build

- Validate the electronics and software on the bench first. For the demo, print a small bracket, spacer or adapter if it solves a concrete problem. Use stock fasteners or a temporary mount for early iterations.
- Minimize part height and volume. Orient flat faces to avoid supports. With the staff-approved profile, use a draft layer height and modest infill when the part’s loads allow it.
- Slice early and review the estimated time, material and supports. Print a small test of critical holes or mating surfaces before committing a long job. Include queue time in the build plan.
- Save editable CAD and agreed exports under [hardware/cad](../hardware/cad/) and reproducible firmware under [hardware/firmware](../hardware/firmware/). Record exact parts, pin mappings and the working board or printer profile once verified.
