export interface ProgressOptions {
    total: number;
    current?: number;
    label?: string;
}

export class ProgressReporter {
    private current: number = 0;
    private total: number;
    private label: string;
    private startTime: number;
    private lastReportTime: number = 0;
    private reportIntervalMs: number = 1000;

    constructor(options: ProgressOptions) {
        this.total = options.total;
        this.current = options.current || 0;
        this.label = options.label || 'Processing';
        this.startTime = Date.now();
    }

    increment(count: number = 1): void {
        this.current += count;
    }

    setCurrent(value: number): void {
        this.current = value;
    }

    report(logger?: any): void {
        const now = Date.now();
        if (now - this.lastReportTime < this.reportIntervalMs && this.current < this.total) {
            return;
        }

        this.lastReportTime = now;
        const percentage = Math.round((this.current / this.total) * 100);
        const elapsed = Math.round((now - this.startTime) / 1000);
        const rate = this.current / elapsed;
        const remaining = Math.round((this.total - this.current) / rate);

        const message = `${this.label}: ${this.current}/${this.total} (${percentage}%) - ` +
            `Elapsed: ${elapsed}s, Remaining: ~${remaining}s`;

        if (logger?.info) {
            logger.info(message);
        } else {
            console.log(message);
        }
    }

    complete(logger?: any): void {
        const elapsed = Math.round((Date.now() - this.startTime) / 1000);
        const message = `${this.label}: Completed ${this.total} items in ${elapsed}s`;

        if (logger?.info) {
            logger.info(message);
        } else {
            console.log(message);
        }
    }
}

export function createProgressReporter(total: number, label?: string): ProgressReporter {
    return new ProgressReporter({ total, label });
}
