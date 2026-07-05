const warmPool = new Map<string, HTMLVideoElement>();

export function warmVideoUrls(urls: string[]): void {
  const active = new Set(urls.filter(Boolean));

  for (const url of active) {
    if (warmPool.has(url)) continue;
    const video = document.createElement("video");
    video.preload = "auto";
    video.muted = true;
    video.playsInline = true;
    video.setAttribute("aria-hidden", "true");
    video.style.cssText = "position:fixed;width:0;height:0;opacity:0;pointer-events:none;";
    video.src = url;
    video.load();
    document.body.appendChild(video);
    warmPool.set(url, video);
  }

  for (const [url, video] of warmPool) {
    if (active.has(url)) continue;
    video.src = "";
    video.remove();
    warmPool.delete(url);
  }
}

export function clearVideoWarmPool(): void {
  for (const [, video] of warmPool) {
    video.src = "";
    video.remove();
  }
  warmPool.clear();
}
