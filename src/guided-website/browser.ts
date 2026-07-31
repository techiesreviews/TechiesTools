import {
  applyGuidedWebsiteAction,
  compileGuidedWebsiteGenerationContext,
  createGuidedWebsiteDraft,
  guidedWebsiteDecisionLabels,
  guidedWebsiteLastAvailableStep,
  guidedWebsiteProgress,
  guidedWebsiteSteps,
  parseGuidedWebsiteDraft,
  type GuidedWebsiteDecisionId,
  type GuidedWebsiteDecisionValue,
  type GuidedWebsiteDraft,
  type GuidedWebsiteFrameworkContext,
  type GuidedWebsiteProject,
  type GuidedWebsiteStep,
} from "./model.ts";
import type { FrameworkCompilation } from "../framework/compiler/index.ts";

const STORAGE_KEY = "techies-tools:guided-website:v1";
const root = document.querySelector<HTMLElement>("[data-guided-website]");

if (root) {
  const decisionSteps: GuidedWebsiteDecisionId[] = ["composition", "density", "surface", "voice"];
  const stepAfter: Record<GuidedWebsiteStep, GuidedWebsiteStep> = {
    project: "composition",
    composition: "density",
    density: "surface",
    surface: "voice",
    voice: "review",
    review: "review",
  };
  const stepBefore: Record<GuidedWebsiteStep, GuidedWebsiteStep> = {
    project: "project",
    composition: "project",
    density: "composition",
    surface: "density",
    voice: "surface",
    review: "voice",
  };

  const restore = (): GuidedWebsiteDraft => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return createGuidedWebsiteDraft();
      return parseGuidedWebsiteDraft(JSON.parse(stored)) ?? createGuidedWebsiteDraft();
    } catch {
      return createGuidedWebsiteDraft();
    }
  };

  let draft = restore();
  let frameworkContext: GuidedWebsiteFrameworkContext | null = null;
  const lastAvailableStep = guidedWebsiteLastAvailableStep(draft);
  if (guidedWebsiteSteps.indexOf(draft.currentStep) > guidedWebsiteSteps.indexOf(lastAvailableStep)) {
    draft = applyGuidedWebsiteAction(draft, { type: "set-step", step: lastAvailableStep });
  }

  const persist = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    } catch {
      // The workflow remains usable in-memory when storage is unavailable.
    }
  };

  const resolved = (decision: GuidedWebsiteDecisionId) => draft.decisions[decision].status !== "unanswered";
  const projectComplete = () => Object.values(draft.project).every((value) => value.trim().length > 0);
  const currentStepCanContinue = () => draft.currentStep === "project"
    ? projectComplete()
    : decisionSteps.includes(draft.currentStep as GuidedWebsiteDecisionId)
      ? resolved(draft.currentStep as GuidedWebsiteDecisionId)
      : guidedWebsiteProgress(draft).readyForFirstDraft;

  const focusCurrentHeading = () => {
    const heading = root.querySelector<HTMLElement>("[data-guided-step]:not([hidden]) h1");
    if (!heading) return;
    heading.dataset.guidedFocus = "true";
    heading.addEventListener("blur", () => delete heading.dataset.guidedFocus, { once: true });
    heading.focus({ preventScroll: true });
  };

  const syncProjectCopy = () => {
    const values: GuidedWebsiteProject = draft.project;
    root.querySelectorAll<HTMLElement>("[data-guided-project-output]").forEach((output) => {
      const field = output.dataset.guidedProjectOutput as keyof GuidedWebsiteProject | undefined;
      if (!field) return;
      const fallback = output.dataset.guidedFallback ?? "Your project";
      output.textContent = values[field].trim() || fallback;
    });
  };

  const syncChoiceInputs = () => {
    root.querySelectorAll<HTMLInputElement>("input[data-guided-choice]").forEach((input) => {
      const decision = input.dataset.guidedDecision as GuidedWebsiteDecisionId | undefined;
      if (!decision) return;
      const evidence = draft.decisions[decision];
      input.checked = evidence.status === "selected" && evidence.value === input.value;
    });
  };

  const syncReview = () => {
    const progress = guidedWebsiteProgress(draft);
    const list = root.querySelector<HTMLElement>("[data-guided-review]");
    if (list) {
      const label = (decision: GuidedWebsiteDecisionId) => {
        const evidence = draft.decisions[decision];
        if (evidence.status === "selected") return guidedWebsiteDecisionLabels[decision][evidence.value];
        if (evidence.status === "skipped") return "Framework default";
        return "Unanswered";
      };
      const items = decisionSteps.map((decision) => {
        const item = document.createElement("li");
        const name = document.createElement("span");
        const value = document.createElement("strong");
        name.textContent = decision;
        value.textContent = label(decision);
        item.append(name, value);
        return item;
      });
      list.replaceChildren(...items);
    }
    root.querySelectorAll<HTMLButtonElement>("[data-guided-download]").forEach((button) => {
      button.disabled = !progress.readyForFirstDraft || !frameworkContext;
    });
  };

  const render = (announce = false) => {
    const progress = guidedWebsiteProgress(draft);
    root.dataset.guidedCurrentStep = draft.currentStep;
    root.dataset.composition = draft.decisions.composition.status === "selected" ? draft.decisions.composition.value : "framework";
    root.dataset.density = draft.decisions.density.status === "selected" ? draft.decisions.density.value : "framework";
    root.dataset.surface = draft.decisions.surface.status === "selected" ? draft.decisions.surface.value : "framework";
    root.dataset.voice = draft.decisions.voice.status === "selected" ? draft.decisions.voice.value : "framework";

    root.querySelectorAll<HTMLElement>("[data-guided-step]").forEach((panel) => {
      panel.hidden = panel.dataset.guidedStep !== draft.currentStep;
    });
    root.querySelectorAll<HTMLButtonElement>("[data-guided-step-link]").forEach((button) => {
      const step = button.dataset.guidedStepLink as GuidedWebsiteStep;
      button.setAttribute("aria-current", step === draft.currentStep ? "step" : "false");
      const stepIndex = guidedWebsiteSteps.indexOf(step);
      const availableIndex = guidedWebsiteSteps.indexOf(guidedWebsiteLastAvailableStep(draft));
      const complete = step === "project"
        ? progress.completedProjectFields === progress.totalProjectFields
        : decisionSteps.includes(step as GuidedWebsiteDecisionId)
          ? draft.decisions[step as GuidedWebsiteDecisionId].status !== "unanswered"
          : progress.readyForFirstDraft;
      button.disabled = stepIndex > availableIndex;
      button.toggleAttribute("data-complete", complete);
    });
    root.querySelectorAll<HTMLElement>("[data-guided-progress]").forEach((meter) => {
      meter.style.setProperty("--guided-progress", `${Math.max(0, guidedWebsiteSteps.indexOf(draft.currentStep)) / (guidedWebsiteSteps.length - 1) * 100}%`);
    });
    root.querySelectorAll<HTMLElement>("[data-guided-progress-copy]").forEach((copy) => {
      copy.textContent = draft.currentStep === "project"
        ? "Project basics"
        : draft.currentStep === "review"
          ? "Ready to review"
          : `Visual direction · ${decisionSteps.indexOf(draft.currentStep as GuidedWebsiteDecisionId) + 1} of ${decisionSteps.length}`;
    });
    root.querySelectorAll<HTMLButtonElement>("[data-guided-continue]").forEach((button) => {
      button.hidden = draft.currentStep === "review";
      button.disabled = !currentStepCanContinue();
      button.textContent = draft.currentStep === "voice" ? "Review direction" : "Continue";
    });
    root.querySelectorAll<HTMLButtonElement>("[data-guided-back]").forEach((button) => {
      button.disabled = draft.currentStep === "project";
    });
    root.querySelectorAll<HTMLButtonElement>("[data-guided-skip]").forEach((button) => {
      const decision = button.dataset.guidedSkip as GuidedWebsiteDecisionId;
      const skipped = draft.decisions[decision]?.status === "skipped";
      button.textContent = skipped ? "Using Framework default" : "Use Framework default";
      button.setAttribute("aria-pressed", String(skipped));
    });
    root.querySelectorAll<HTMLInputElement>("[data-guided-project-field]").forEach((input) => {
      const field = input.dataset.guidedProjectField as keyof GuidedWebsiteProject;
      if (document.activeElement !== input) input.value = draft.project[field];
    });

    syncProjectCopy();
    syncChoiceInputs();
    syncReview();
    persist();

    if (announce) {
      const status = root.querySelector<HTMLElement>("[data-guided-status]");
      if (status) status.textContent = `${draft.currentStep[0].toUpperCase()}${draft.currentStep.slice(1)} step ready.`;
    }
  };

  root.addEventListener("input", (event) => {
    const input = event.target instanceof HTMLInputElement ? event.target : null;
    const field = input?.dataset.guidedProjectField as keyof GuidedWebsiteProject | undefined;
    if (!input || !field) return;
    draft = applyGuidedWebsiteAction(draft, {
      type: "set-project",
      project: { ...draft.project, [field]: input.value },
    });
    render();
  });

  root.querySelector<HTMLFormElement>("[data-guided-project-form]")?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!projectComplete()) return;
    draft = applyGuidedWebsiteAction(draft, { type: "set-step", step: "composition" });
    render(true);
    focusCurrentHeading();
  });

  root.addEventListener("change", (event) => {
    const selected = event.target instanceof HTMLInputElement ? event.target : null;
    if (!selected?.matches("input[data-guided-choice]")) return;
    const decision = selected.dataset.guidedDecision as GuidedWebsiteDecisionId;
    root.querySelectorAll<HTMLInputElement>(`input[data-guided-decision="${CSS.escape(decision)}"]`).forEach((input) => {
      input.checked = input.value === selected.value;
    });
    draft = applyGuidedWebsiteAction(draft, {
      type: "choose",
      decision,
      value: selected.value as GuidedWebsiteDecisionValue,
    });
    render();
  });

  root.addEventListener("click", (event) => {
    const button = event.target instanceof Element ? event.target.closest<HTMLButtonElement>("button") : null;
    if (!button) return;

    if (button.matches("[data-guided-skip]")) {
      draft = applyGuidedWebsiteAction(draft, {
        type: "skip",
        decision: button.dataset.guidedSkip as GuidedWebsiteDecisionId,
      });
      render();
      return;
    }
    if (button.matches("[data-guided-continue]")) {
      if (!currentStepCanContinue()) return;
      draft = applyGuidedWebsiteAction(draft, { type: "set-step", step: stepAfter[draft.currentStep] });
      render(true);
      focusCurrentHeading();
      return;
    }
    if (button.matches("[data-guided-back]")) {
      draft = applyGuidedWebsiteAction(draft, { type: "set-step", step: stepBefore[draft.currentStep] });
      render(true);
      focusCurrentHeading();
      return;
    }
    if (button.matches("[data-guided-step-link]")) {
      draft = applyGuidedWebsiteAction(draft, {
        type: "set-step",
        step: button.dataset.guidedStepLink as GuidedWebsiteStep,
      });
      render(true);
      focusCurrentHeading();
      return;
    }
    if (button.matches("[data-guided-reset]")) {
      if (!window.confirm("Clear the project facts and visual decisions for this guided website?")) return;
      draft = applyGuidedWebsiteAction(draft, { type: "reset" });
      render(true);
      focusCurrentHeading();
      return;
    }
    if (button.matches("[data-guided-download]")) {
      if (!frameworkContext) return;
      const blob = new Blob([compileGuidedWebsiteGenerationContext(draft, frameworkContext)], { type: "text/markdown;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "guided-website-context.md";
      document.body.append(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 0);
    }
  });

  const setFrameworkStatus = (ready: boolean) => {
    root.querySelectorAll<HTMLElement>("[data-guided-framework-status]").forEach((node) => {
      const label = ready ? "Active Framework applied" : "Framework context unavailable";
      node.dataset.state = ready ? "ready" : "unavailable";
      node.lastChild!.textContent = node.querySelector("i") ? ` ${label}` : label;
    });
  };
  const captureFrameworkContext = (event: Event) => {
    const detail = (event as CustomEvent<{
      artifacts: FrameworkCompilation["artifacts"];
      identity: FrameworkCompilation["identity"];
    }>).detail;
    if (!detail?.artifacts.context.available) {
      frameworkContext = null;
      setFrameworkStatus(false);
      syncReview();
      return;
    }
    frameworkContext = {
      markdown: detail.artifacts.context.value.value,
      ...detail.identity,
    };
    setFrameworkStatus(true);
    syncReview();
  };
  window.addEventListener("framework-elements:outputs", captureFrameworkContext);
  window.dispatchEvent(new CustomEvent("framework-elements:request-state", { detail: { reason: "guided-website" } }));

  render();
}
