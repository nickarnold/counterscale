interface CFAnalyticsEngine {
    writeDataPoint: (data: {
        indexes: string[],
        blobs: string[],
        doubles: number[],
    }) => void;
}

interface Environment {
    __STATIC_CONTENT: Fetcher;
    TALLYHO: CFAnalyticsEngine
    CF_BEARER_TOKEN: string
    CF_ACCOUNT_ID: string
}