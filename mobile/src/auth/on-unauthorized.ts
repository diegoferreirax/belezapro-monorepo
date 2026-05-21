type Handler = () => void | Promise<void>;

let handler: Handler | null = null;

export function setUnauthorizedHandler(fn: Handler | null): void {
  handler = fn;
}

export function notifyUnauthorized(): void {
  void handler?.();
}
