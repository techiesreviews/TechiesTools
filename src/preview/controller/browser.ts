type PreviewBoundsDetail = {
  min?: number;
  max?: number;
  width?: number;
  status?: string;
};

const numberFrom = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const initializePreviewBrowser = (root: HTMLElement) => {
  const slider = root.querySelector<HTMLInputElement>("[data-preview-viewport-slider]");
  const widthLabel = root.querySelector<HTMLElement>("[data-preview-width]");
  const currentWidthLabel = root.querySelector<HTMLElement>("[data-preview-current-width]");
  const minWidthLabel = root.querySelector<HTMLElement>("[data-preview-min-width]");
  const maxWidthLabel = root.querySelector<HTMLElement>("[data-preview-max-width]");
  const statusLabel = root.querySelector<HTMLElement>("[data-preview-status]");
  const address = root.querySelector<HTMLInputElement>("[data-preview-address]");
  const addressForm = root.querySelector<HTMLFormElement>("[data-preview-address-form]");
  const suggestions = root.querySelector<HTMLElement>("[data-preview-suggestions]");
  const routes = Array.from(root.querySelectorAll<HTMLButtonElement>("[data-preview-route]"));
  let minimum = numberFrom(root.dataset.previewMinWidth, 320);
  let maximum = numberFrom(root.dataset.previewMaxWidth, 1440);
  let width = numberFrom(root.dataset.previewInitialWidth, maximum);
  const canonicalAddress = address?.defaultValue ?? address?.value ?? "";
  let activeRoute: HTMLButtonElement | undefined;

  const applyWidth = (requestedWidth: number, emit = true) => {
    width = Math.round(Math.min(maximum, Math.max(minimum, requestedWidth)));
    root.style.setProperty("--preview-browser-width", `${width}px`);
    if (slider) {
      slider.min = String(minimum);
      slider.max = String(maximum);
      slider.value = String(width);
    }
    if (widthLabel) widthLabel.textContent = `${width} px`;
    if (currentWidthLabel) currentWidthLabel.textContent = `${width} px`;
    if (minWidthLabel) minWidthLabel.textContent = `${minimum} px`;
    if (maxWidthLabel) maxWidthLabel.textContent = `${maximum} px`;
    root.querySelectorAll<HTMLButtonElement>("[data-preview-device]").forEach((button) => {
      const active = Number(button.dataset.previewDevice) === width;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    if (emit) {
      root.dispatchEvent(new CustomEvent("preview-browser:resize", {
        bubbles: true,
        detail: { width, min: minimum, max: maximum },
      }));
    }
  };

  root.querySelectorAll<HTMLButtonElement>("[data-preview-device]").forEach((button) => {
    button.addEventListener("click", () => applyWidth(numberFrom(button.dataset.previewDevice, maximum)));
  });
  slider?.addEventListener("input", () => applyWidth(Number(slider.value)));
  root.addEventListener("preview-browser:set-bounds", (event) => {
    const detail = (event as CustomEvent<PreviewBoundsDetail>).detail ?? {};
    minimum = Math.round(Math.min(detail.min ?? minimum, detail.max ?? maximum));
    maximum = Math.round(Math.max(detail.max ?? maximum, minimum + 1));
    if (statusLabel && detail.status) statusLabel.textContent = detail.status;
    applyWidth(detail.width ?? width, false);
  });

  const setActiveRoute = (route?: HTMLButtonElement) => {
    activeRoute = route;
    routes.forEach((candidate) => {
      const active = candidate === route;
      candidate.classList.toggle("is-active", active);
      candidate.setAttribute("aria-selected", String(active));
    });
    if (!address) return;
    if (route?.id) address.setAttribute("aria-activedescendant", route.id);
    else address.removeAttribute("aria-activedescendant");
  };

  const restoreCanonicalAddress = () => {
    if (address) address.value = canonicalAddress;
  };

  const closeSuggestions = (restoreAddress = false) => {
    if (!suggestions || !address) return;
    suggestions.hidden = true;
    address.setAttribute("aria-expanded", "false");
    setActiveRoute();
    if (restoreAddress) restoreCanonicalAddress();
  };

  const filterSuggestions = (showAll = false) => {
    if (!suggestions || !address) return;
    setActiveRoute();
    const query = address.value.trim().toLowerCase();
    let visible = 0;
    routes.forEach((route) => {
      const match = showAll || !query || `${route.dataset.previewRouteAddress} ${route.textContent}`.toLowerCase().includes(query);
      route.hidden = !match;
      if (match) visible += 1;
    });
    suggestions.hidden = visible === 0;
    address.setAttribute("aria-expanded", String(visible > 0));
  };

  const activateRoute = (route: HTMLButtonElement | undefined) => {
    const path = route?.dataset.previewRoute;
    if (path) window.location.assign(path);
    closeSuggestions();
  };

  if (routes.length && address && addressForm) {
    address.addEventListener("focus", () => {
      address.select();
      filterSuggestions(true);
    });
    address.addEventListener("click", () => filterSuggestions(true));
    address.addEventListener("input", () => filterSuggestions(false));
    address.addEventListener("keydown", (event) => {
      if ((event.key === "ArrowDown" || event.key === "ArrowUp") && suggestions?.hidden) filterSuggestions(true);
      const visibleRoutes = routes.filter((route) => !route.hidden);
      if (event.key === "Escape") {
        closeSuggestions(true);
        address.blur();
        return;
      }
      if (event.key === "Enter") {
        event.preventDefault();
        const selected = activeRoute ?? routes.find((route) => route.dataset.previewRouteAddress?.toLowerCase() === address.value.trim().toLowerCase());
        if (selected) activateRoute(selected);
        else closeSuggestions(true);
        return;
      }
      if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
      event.preventDefault();
      if (!visibleRoutes.length) return;
      const currentIndex = visibleRoutes.indexOf(activeRoute as HTMLButtonElement);
      const nextIndex = currentIndex < 0
        ? event.key === "ArrowDown" ? 0 : visibleRoutes.length - 1
        : (currentIndex + (event.key === "ArrowDown" ? 1 : -1) + visibleRoutes.length) % visibleRoutes.length;
      setActiveRoute(visibleRoutes[nextIndex]);
      activeRoute?.scrollIntoView({ block: "nearest" });
    });
    addressForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const selected = routes.find((route) => !route.hidden && route.dataset.previewRouteAddress?.toLowerCase() === address.value.trim().toLowerCase());
      if (selected) activateRoute(selected);
      else closeSuggestions(true);
    });
    addressForm.addEventListener("focusout", (event) => {
      const nextTarget = event.relatedTarget as Node | null;
      if (!nextTarget || !addressForm.contains(nextTarget)) closeSuggestions(true);
    });
    routes.forEach((route) => route.addEventListener("click", () => activateRoute(route)));
    document.addEventListener("pointerdown", (event) => {
      if (!addressForm.contains(event.target as Node)) closeSuggestions(true);
    });
  }

  applyWidth(width, false);
};

document.querySelectorAll<HTMLElement>("[data-preview-browser]").forEach(initializePreviewBrowser);
