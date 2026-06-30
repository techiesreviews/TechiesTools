# Techies Tools

Techies Tools is a local design-system lab for building and exporting reusable design variables. Its language separates where people start from where they configure a selected tool.

## Language

**Main menu**:
The persistent starting rail for moving between resources and tools. It can resize or collapse into an icon rail while keeping the selected workflow available.
_Avoid_: Sidebar, app sidebar, primary sidebar

**Framework**:
The tool for building a portable variable framework. It starts with core variables, then grows into type, space, component, and utility output.
_Avoid_: Dashboard, theme generator

**Framework sidebar**:
The contextual panel attached to the **Main menu** when the **Framework** tool is active. It contains the controls for editing framework variables.
_Avoid_: Settings bar, secondary sidebar, settings sidebar

**Variable framework**:
The named set of CSS variables exported from the **Framework** tool. It follows the CoreFramework style: root theme selectors first, variables before components, and reusable semantic names.
_Avoid_: Token dump, CSS blob

**Primary color**:
The first color variable in the **Variable framework** and the current starting point for color-system export. It produces `--primary` plus light and dark steps.
_Avoid_: Brand color, main color, primary token

**Color variable**:
An editable named color in the **Framework sidebar**. The framework starts with one **Primary color**; additional color variables can be added or removed, but the final remaining color is kept so the export always has a base.
_Avoid_: Color thing, swatch row

**Color scale**:
The generated light-to-dark family derived from a color variable. In CoreFramework-style export, primary scale steps are named with `--primary-l-*` and `--primary-d-*`.
_Avoid_: Gradient, palette strip

**Accordion section**:
A collapsible group in the **Framework sidebar** with the section name on the left, a compact preview on the right, and a chevron that opens or closes the content.
_Avoid_: Dropdown, settings row

**Export modal**:
The focused dialog that shows generated framework output after the user asks to export. Export code is not shown inline in the **Framework sidebar**.
_Avoid_: Export section, inline preview

## Flagged Ambiguities

**Sidebar**:
Resolved to two separate concepts: **Main menu** for the app-starting navigation rail and **Framework sidebar** for contextual Framework controls.

**Settings**:
Resolved away from the current Framework workflow. The contextual panel is not a generic settings area; it is the **Framework sidebar**.

## Example Dialogue

Designer: "I opened Framework from the Main menu. Why did another panel appear?"

Developer: "That is the Framework sidebar. It is attached to the Main menu because it only belongs to the active Framework tool."

Designer: "If I change the Primary color, what should export?"

Developer: "The Variable framework should export CoreFramework-style variables first: `--primary`, then `--primary-l-*` and `--primary-d-*`, inside the root theme selectors."

Designer: "Can I remove colors?"

Developer: "Yes, you can remove added Color variables, but the final remaining Primary color stays so the Variable framework always has a valid starting point."
