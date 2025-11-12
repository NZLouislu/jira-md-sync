export interface RetryOptions {
    maxAttempts?: number;
    initialDelayMs?: number;
    maxDelayMs?: number;
    backoffMultiplier?: number;
    retryableErrors?: string[];
    retryableStatusCodes?: number[];
    onRetry?: (attempt: number, error: any, delayMs: number) => void;
}

const DEFAULT_OPTIONS: Required<Omit<RetryOptions, 'onRetry'>> = {
    maxAttempts: 3,
    initialDelayMs: 1000,
    maxDelayMs: 30000,
    backoffMultiplier: 2,
    retryableErrors: ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', 'ECONNREFUSED'],
    retryableStatusCodes: [408, 429, 500, 502, 503, 504]
};

export async function retryOperation<T>(
    operation: () => Promise<T>,
    options: RetryOptions = {}
): Promise<T> {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    let lastError: any;

    for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
        try {
            return await operation();
        } catch (error: any) {
            lastError = error;

            if (attempt === opts.maxAttempts) {
                break;
            }

            const isRetryable = isRetryableError(error, opts);
            if (!isRetryable) {
                throw error;
            }

            const delayMs = calculateDelay(attempt, opts);

            if (options.onRetry) {
                options.onRetry(attempt, error, delayMs);
            }

            await sleep(delayMs);
        }
    }

    throw lastError;
}

function isRetryableError(error: any, options: Required<Omit<RetryOptions, 'onRetry'>>): boolean {
    if (error.code && options.retryableErrors.includes(error.code)) {
        return true;
    }

    if (error.status && options.retryableStatusCodes.includes(error.status)) {
        return true;
    }

    if (error.response?.status && options.retryableStatusCodes.includes(error.response.status)) {
        return true;
    }

    const message = error.message?.toLowerCase() || '';
    if (message.includes('timeout') || message.includes('network') || message.includes('connection')) {
        return true;
    }

    return false;
}

function calculateDelay(attempt: number, options: Required<Omit<RetryOptions, 'onRetry'>>): number {
    const delay = options.initialDelayMs * Math.pow(options.backoffMultiplier, attempt - 1);
    return Math.min(delay, options.maxDelayMs);
}

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export class RetryableOperation<T> {
    private options: RetryOptions;

    constructor(options: RetryOptions = {}) {
        this.options = options;
    }

    async execute(operation: () => Promise<T>): Promise<T> {
        return retryOperation(operation, this.options);
    }
}
