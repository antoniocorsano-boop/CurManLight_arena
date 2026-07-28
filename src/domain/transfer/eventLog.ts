import type { TransferEvent } from './types';
import type { TransferArea } from './vocabularies';
import type { TransferId } from './types';

export interface TransferEventLog {
  append(event: TransferEvent): void;
  list(): readonly TransferEvent[];
  getByTransferId(id: TransferId): readonly TransferEvent[];
  getByArea(area: TransferArea): readonly TransferEvent[];
  getRecent(n: number): readonly TransferEvent[];
}

class TransferEventLogImpl implements TransferEventLog {
  private readonly events: TransferEvent[] = [];
  private readonly maxEvents: number;

  constructor(maxEvents: number) {
    this.maxEvents = maxEvents;
  }

  append(event: TransferEvent): void {
    this.events.push(event);
    if (this.events.length > this.maxEvents) {
      this.events.splice(0, this.events.length - this.maxEvents);
    }
  }

  list(): readonly TransferEvent[] {
    return Object.freeze([...this.events]);
  }

  getByTransferId(id: TransferId): readonly TransferEvent[] {
    return Object.freeze(this.events.filter(e => e.transferId === id));
  }

  getByArea(area: TransferArea): readonly TransferEvent[] {
    return Object.freeze(this.events.filter(e => e.fromArea === area || e.toArea === area));
  }

  getRecent(n: number): readonly TransferEvent[] {
    const start = Math.max(0, this.events.length - n);
    return Object.freeze(this.events.slice(start));
  }
}

export function createTransferEventLog(maxEvents: number = 100): TransferEventLog {
  return new TransferEventLogImpl(maxEvents);
}
