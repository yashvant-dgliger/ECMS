export interface OfflineAction {
  id: string;
  endpoint: string;
  method: 'POST' | 'PATCH';
  payload: unknown;
}

const queue: OfflineAction[] = [];

export function enqueue(action: OfflineAction) {
  queue.push(action);
}

export function drain() {
  return [...queue];
}
