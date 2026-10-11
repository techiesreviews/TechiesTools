/** One downloadable export file. `value` is text or packaged bytes. */
export interface ExportFile {
  name: string;
  mimeType: string;
  value: string | Uint8Array;
}

export type ExportResult = { success: true } | { success: false; message: string };

/** Browser side effects behind the export seam; tests substitute an in-memory adapter. */
export interface ExportIo {
  copy(value: string): Promise<ExportResult>;
  save(file: ExportFile): ExportResult;
}

const errorMessage = (error: unknown, fallback: string) => error instanceof Error && error.message ? error.message : fallback;

export const browserExportIo: ExportIo = {
  async copy(value) {
    if (!navigator.clipboard?.writeText) return { success: false, message: "Clipboard access is unavailable in this browser." };
    try {
      await navigator.clipboard.writeText(value);
      return { success: true };
    } catch (error) {
      return { success: false, message: errorMessage(error, "The browser blocked clipboard access.") };
    }
  },
  save(file) {
    let url: string | undefined;
    let link: HTMLAnchorElement | undefined;
    try {
      const value = typeof file.value === "string" ? file.value : file.value.slice().buffer as ArrayBuffer;
      url = URL.createObjectURL(new Blob([value], { type: file.mimeType }));
      link = document.createElement("a");
      link.href = url;
      link.download = file.name;
      link.hidden = true;
      document.body.append(link);
      link.click();
      return { success: true };
    } catch (error) {
      return { success: false, message: errorMessage(error, "The browser blocked the request.") };
    } finally {
      const objectUrl = url;
      const anchor = link;
      window.setTimeout(() => {
        anchor?.remove();
        if (objectUrl) URL.revokeObjectURL(objectUrl);
      }, 0);
    }
  },
};

export interface ExportActionsOptions<Id extends string> {
  /** The current file for `id`, or undefined while it is unavailable. */
  artifact(id: Id): ExportFile | undefined;
  /** Build the complete package. May throw; failures are reported. Return nothing when the package arrives later through `deliver`. */
  packageAll?(): ExportFile | undefined;
  /** Name reported when packaging throws before a file exists. */
  packageName?(): string;
  /** Present one outcome. `failed` marks messages that need assertive announcement. */
  report(message: string, failed: boolean): void;
  io?: ExportIo;
}

export interface ExportActions<Id extends string> {
  copy(id: Id): Promise<ExportResult>;
  save(id: Id): ExportResult;
  /** Undefined when the package is delivered later. */
  saveAll(): ExportResult | undefined;
  /** Save a file produced elsewhere, such as an asynchronously built package. */
  deliver(file: ExportFile): ExportResult;
}

const unavailable = (name: string): ExportResult => ({ success: false, message: `${name} is not available yet.` });

/** Copy, save, and package export files with one reporting contract for every tool. */
export const createExportActions = <Id extends string>(options: ExportActionsOptions<Id>): ExportActions<Id> => {
  const io = options.io ?? browserExportIo;
  const deliver = (file: ExportFile) => {
    const result = io.save(file);
    options.report(result.success ? `Download started for ${file.name}` : `Could not start download for ${file.name}. ${result.message}`, !result.success);
    return result;
  };
  return {
    async copy(id) {
      const file = options.artifact(id);
      if (!file || typeof file.value !== "string") return unavailable(id);
      const result = await io.copy(file.value);
      options.report(result.success ? `Copied ${file.name}` : `Could not copy ${file.name}. ${result.message}`, !result.success);
      return result;
    },
    save(id) {
      const file = options.artifact(id);
      return file ? deliver(file) : unavailable(id);
    },
    saveAll() {
      const name = options.packageName?.() ?? "the package";
      let file: ExportFile | undefined;
      try {
        if (!options.packageAll) return unavailable(name);
        file = options.packageAll();
      } catch (error) {
        const message = errorMessage(error, "The package could not be created.");
        options.report(`Could not start download for ${name}. ${message}`, true);
        return { success: false, message };
      }
      return file ? deliver(file) : undefined;
    },
    deliver,
  };
};

/** `data-*` attribute names used by the shared Settings export markup. */
export interface ExportDialogAttributes {
  dialog: string;
  open: string;
  close: string;
  file: string;
  copy: string;
  save: string;
  all: string;
  directCopy: string;
  code: string;
  previewName: string;
}

/** Derive the shared attribute names from one prefix, such as `data-pattern-export`. */
export const exportDialogAttributes = (prefix: string, overrides: Partial<ExportDialogAttributes> = {}): ExportDialogAttributes => ({
  dialog: `${prefix}-dialog`,
  open: `${prefix}-open`,
  close: `${prefix}-close`,
  file: `${prefix}-file`,
  copy: `${prefix}-copy`,
  save: `${prefix}-save`,
  all: `${prefix}-all`,
  directCopy: `${prefix}-direct-copy`,
  code: `${prefix}-code`,
  previewName: `${prefix}-preview-name`,
  ...overrides,
});

const datasetValue = (element: Element, attribute: string) => element.getAttribute(attribute) ?? "";

export interface ExportDialogOptions<Id extends string> extends ExportActionsOptions<Id> {
  root: ParentNode;
  attributes: ExportDialogAttributes;
  initial: Id;
  /** Shown in the code preview while the selected file is unavailable. */
  placeholder?(id: Id): string;
  /** Artifact copied by the direct-copy action; defaults to the selected file. */
  directCopyArtifact?(): Id;
  /** Run before the dialog opens, such as flushing pending renders or validating. */
  beforeOpen?(): void;
  /** Wrap every copy and save action, such as a review step. Defaults to running it. */
  gate?(action: () => unknown, id?: Id): void;
  /** Extra tool-specific rendering after the shared preview updates. */
  afterRender?(selected: Id): void;
}

export interface ExportDialog<Id extends string> {
  readonly actions: ExportActions<Id>;
  readonly selected: Id;
  select(id: Id): void;
  open(): void;
  /** Re-render the open dialog, for example after the source changed. */
  refresh(): void;
}

/** Bind the shared Settings export dialog markup to one tool's artifacts. */
export const connectExportDialog = <Id extends string>(options: ExportDialogOptions<Id>): ExportDialog<Id> => {
  const { root, attributes } = options;
  const actions = createExportActions(options);
  const dialog = root.querySelector<HTMLDialogElement>(`[${attributes.dialog}]`);
  const code = root.querySelector<HTMLElement>(`[${attributes.code}]`);
  const previewName = root.querySelector<HTMLElement>(`[${attributes.previewName}]`);
  const gate = options.gate ?? ((action: () => unknown) => { void action(); });
  let selected = options.initial;

  const render = () => {
    const file = options.artifact(selected);
    if (code) code.textContent = typeof file?.value === "string" ? file.value : options.placeholder?.(selected) ?? "";
    if (previewName && file) previewName.textContent = file.name;
    root.querySelectorAll<HTMLButtonElement>(`[${attributes.file}]`).forEach((button) =>
      button.setAttribute("aria-pressed", String(datasetValue(button, attributes.file) === selected)));
    root.querySelectorAll<HTMLButtonElement>(`[${attributes.copy}], [${attributes.save}]`).forEach((button) => {
      const id = (datasetValue(button, attributes.copy) || datasetValue(button, attributes.save)) as Id;
      button.toggleAttribute("disabled", !options.artifact(id));
    });
    options.afterRender?.(selected);
  };
  const open = () => {
    options.beforeOpen?.();
    render();
    if (dialog && !dialog.open) dialog.showModal();
  };

  root.querySelectorAll(`[${attributes.open}]`).forEach((button) => button.addEventListener("click", open));
  root.querySelector(`[${attributes.close}]`)?.addEventListener("click", () => dialog?.close());
  dialog?.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
  root.querySelectorAll<HTMLButtonElement>(`[${attributes.file}]`).forEach((button) => button.addEventListener("click", () => {
    selected = datasetValue(button, attributes.file) as Id;
    render();
  }));
  root.querySelector(`[${attributes.directCopy}]`)?.addEventListener("click", () => {
    const id = options.directCopyArtifact?.() ?? selected;
    gate(() => actions.copy(id), id);
  });
  root.querySelectorAll<HTMLButtonElement>(`[${attributes.copy}]`).forEach((button) => button.addEventListener("click", () => {
    const id = datasetValue(button, attributes.copy) as Id;
    gate(() => actions.copy(id), id);
  }));
  root.querySelectorAll<HTMLButtonElement>(`[${attributes.save}]`).forEach((button) => button.addEventListener("click", () => {
    const id = datasetValue(button, attributes.save) as Id;
    gate(() => actions.save(id), id);
  }));
  root.querySelector(`[${attributes.all}]`)?.addEventListener("click", () => gate(() => actions.saveAll()));

  return {
    actions,
    get selected() { return selected; },
    select(id) { selected = id; render(); },
    open,
    refresh() { if (dialog?.open) render(); },
  };
};
