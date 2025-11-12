export interface FetchWithTimeoutOptions extends RequestInit {
    timeoutMs?: number;
}

export async function fetchWithTimeout(
    url: string,
    options: FetchWithTimeoutOptions = {}
): Promise<Response> {
    const { timeoutMs = 30000, ...fetchOptions } = options;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const response = await fetch(url, {
            ...fetchOptions,
            signal: controller.signal
        });

        return response;
    } catch (error: any) {
        if (error.name === 'AbortError') {
            throw new Error(`Request timeout after ${timeoutMs}ms: ${url}`);
        }
        throw error;
    } finally {
        clearTimeout(timeoutId);
    }
}

export interface RateLimiterOptions {
    requestsPerSecond?: number;
    burstSize?: number;
}

export class RateLimiter {
    private queue: Array<{
        operation: () => Promise<any>;
        resolve: (value: any) => void;
        reject: (error: any) => void;
    }> = [];
    private processing = false;
    private lastRequestTime = 0;
    private requestsPerSecond: number;
    private burstSize: number;
    private tokensAvailable: number;

    constructor(options: RateLimiterOptions = {}) {
        this.requestsPerSecond = options.requestsPerSecond || 10;
        this.burstSize = options.burstSize || 5;
        this.tokensAvailable = this.burstSize;
    }

    async execute<T>(operation: () => Promise<T>): Promise<T> {
        return new Promise((resolve, reject) => {
            this.queue.push({ operation, resolve, reject });
            this.processQueue();
        });
    }

    private async processQueue(): Promise<void> {
        if (this.processing || this.queue.length === 0) {
            return;
        }

        this.processing = true;

        while (this.queue.length > 0) {
            await this.waitForToken();

            const item = this.queue.shift();
            if (!item) break;

            try {
                const result = await item.operation();
                item.resolve(result);
            } catch (error) {
                item.reject(error);
            }

            this.lastRequestTime = Date.now();
        }

        this.processing = false;
    }

    private async waitForToken(): Promise<void> {
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        const tokenRefillRate = 1000 / this.requestsPerSecond;

        const tokensToAdd = Math.floor(timeSinceLastRequest / tokenRefillRate);
        this.tokensAvailable = Math.min(this.tokensAvailable + tokensToAdd, this.burstSize);

        if (this.tokensAvailable > 0) {
            this.tokensAvailable--;
            return;
        }

        const waitTime = tokenRefillRate - (timeSinceLastRequest % tokenRefillRate);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        this.tokensAvailable = 0;
    }
}

export function createRateLimiter(requestsPerSecond: number = 10): RateLimiter {
    return new RateLimiter({ requestsPerSecond });
}
