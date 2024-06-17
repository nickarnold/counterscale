import { useFetcher } from "@remix-run/react";

import { ArrowRight, ArrowLeft } from "lucide-react";

import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";

export async function loader({ context, request }: LoaderFunctionArgs) {
    const { analyticsEngine } = context;

    const { interval, site, page = 1 } = paramsFromUrl(request.url);
    const tz = context.requestTimezone as string;

    const countByReferrer = await analyticsEngine.getCountByReferrer(
        site,
        interval,
        tz,
        Number(page),
    );

    return json({
        countByReferrer: countByReferrer,
        page: Number(page),
    });
}

import { useEffect } from "react";
import TableCard from "~/components/TableCard";
import { Card } from "~/components/ui/card";
import { paramsFromUrl } from "~/lib/utils";

export const ReferrerCard = ({
    siteId,
    interval,
}: {
    siteId: string;
    interval: string;
}) => {
    const dataFetcher = useFetcher<typeof loader>();
    const countByReferrer = dataFetcher.data?.countByReferrer || [];
    const page = dataFetcher.data?.page || 1;

    useEffect(() => {
        // Your code here
        if (dataFetcher.state === "idle") {
            dataFetcher.load(
                `/resources/referrer?site=${siteId}&interval=${interval}`,
            );
        }
    }, []);

    useEffect(() => {
        // NOTE: intentionally resets page to default when interval or site changes
        if (dataFetcher.state === "idle") {
            dataFetcher.load(
                `/resources/referrer?site=${siteId}&interval=${interval}`,
            );
        }
    }, [siteId, interval]);

    function handlePagination(page: number) {
        // TODO: is there a way of updating the query string with this state without triggering a navigation?
        dataFetcher.load(
            `/resources/referrer?site=${siteId}&interval=${interval}&page=${page}`,
        );
    }

    const hasMore = countByReferrer.length === 10;
    return (
        <Card className={dataFetcher.state === "loading" ? "opacity-60" : ""}>
            {countByReferrer ? (
                <div className="grid grid-rows-[auto,40px] h-full">
                    <TableCard
                        countByProperty={countByReferrer}
                        columnHeaders={["Referrer", "Visitors"]}
                    />
                    <div className="p-2 pr-0 grid grid-cols-[auto,2rem,2rem] text-right">
                        <div></div>
                        <a
                            onClick={() => {
                                if (page > 1) handlePagination(page - 1);
                            }}
                            className={
                                page > 1 ? `text-primary` : `text-orange-300`
                            }
                        >
                            <ArrowLeft />
                        </a>
                        <a
                            onClick={() => {
                                if (hasMore) handlePagination(page + 1);
                            }}
                            className={
                                hasMore ? `text-primary` : `text-orange-300`
                            }
                        >
                            <ArrowRight />
                        </a>
                    </div>
                </div>
            ) : null}
        </Card>
    );
};
