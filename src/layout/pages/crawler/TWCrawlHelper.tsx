import { useRef, useState } from 'react';
import { CrawlerParams, runTarmacTask } from '../../../api/carDataCrawlerApi';
import { v4 as uuid } from "uuid";
import { pollCrawlerLog } from '../../../api/logApi';
import "./MGTCrawlHelper.scss";

interface CrawlLog {
    jobId?: string;
    ts?: number;
    message: string;
}

//https://tarmacworks.fandom.com/wiki/TG-51084 is not 2016 standard

const TWCrawlHelper = () => {
    const [catalogUrl, setCatalogUrl] = useState("");
    const [productPageUrl, setProductPageUrl] = useState("");
    const [showProductUrls, setShowProductUrls] = useState(false);
    const [override, setOverride] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [productUrlRes, setProductUrlRes] = useState<any>(null);
    const [logs, setLogs] = useState<CrawlLog[]>([]);
    const logLastKey = useRef(0);

    const validateFetchProductUrl = () => {
        if (
            !catalogUrl.trim()
        ) return "catalog URL is required";

        return null;
    };

    const validateCrawUrls = () => {
        if (!productPageUrl.trim()) return "productPage URL is required";
        return null;
    };

    const applyProductUrls = () => {
        const urls: [] = productUrlRes?.['product_urls'].map((pu: any) => pu.url) || [];
        setProductPageUrl(urls.join(","));
    }

    const chunkArray = (arr: any[], n: number) => {
        const chunkedArr = [];
        for (let i = 0; i < arr.length; i += n) {
            chunkedArr.push(arr.slice(i, i + n));
        }
        return chunkedArr;
    }


    const handleFetchProductUrlSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setProductUrlRes(null);

        const v = validateFetchProductUrl();
        if (v) {
            setError(v);
            return;
        }

        const jobId = `crawl-${uuid()}`;

        setLoading(true);
        setLogs([]);
        logLastKey.current = 0;

        const pollInterval = setInterval(async () => {
            const res = await pollCrawlerLog({
                jobId: jobId,
                lastTs: logLastKey.current,
            });

            setLogs((prev) => [...prev, ...(res.logs ?? [])]);
            const logs: CrawlLog[] = res.logs;

            if (logs && logs.length > 0) {
                if (logs.at(-1)?.ts === undefined) {
                    clearInterval(pollInterval);
                    setLogs((prev) => [...prev, { message: 'No last key detected. Ending the polling ' }]);
                } else {
                    logLastKey.current = logs.at(-1)?.ts ?? Infinity;
                }

                if (logs.some((l) => l.message === 'DONE' || l.message.includes("Failed to crawl"))) {
                    clearInterval(pollInterval);
                }
            }
        }, 3000);

        const crawlBody: CrawlerParams = {
            job_id: jobId,
            task_type: 'get_product_url',
        }

        crawlBody.catalog_url = catalogUrl;

        try {
            const res = await runTarmacTask(crawlBody);
            setProductUrlRes(res);
        } catch (err: any) {
            setError(String(err.message || err));
        } finally {
            setLoading(false);
        }
    };

    const pollLogs = (jobId: string) => {
        return new Promise((resolve) => {
            const pollInterval = setInterval(async () => {
                const res = await pollCrawlerLog({
                    jobId: jobId,
                    lastTs: logLastKey.current,
                });

                setLogs((prev) => [...prev, ...(res.logs ?? [])]);
                const logs: CrawlLog[] = res.logs;

                if (logs && logs.length > 0) {
                    if (logs.at(-1)?.ts === undefined) {
                        clearInterval(pollInterval);
                        setLogs((prev) => [...prev, { message: 'No last key detected. Ending the polling ' }]);
                    } else {
                        logLastKey.current = logs.at(-1)?.ts ?? Infinity;
                    }

                    if (logs.some((l) => (l.message === 'DONE' || l.message.includes("Failed to crawl")) && l.jobId === jobId)) {
                        clearInterval(pollInterval);
                        resolve(`Task ${jobId} succeeds!`);
                    }
                }
            }, 3000);
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const v = validateCrawUrls();
        if (v) {
            setError(v);
            return;
        }

        

        setLoading(true);
        setLogs([]);
        logLastKey.current = 0;

        // pollLogs(jobId);

        const urls = [...productPageUrl.split(",").map(u => u.trimStart().trimEnd())];
        const urlChunks = chunkArray(urls, 5);

        for (const uc of urlChunks) {
            const jobId = `crawl-${uuid()}`;
            const crawlBody: CrawlerParams = {
                task_type: 'crawl_fandom_pages',
                job_id: jobId,
                product_urls: uc,
                override,
            }
            try {
                runTarmacTask(crawlBody).catch(err => console.log(err));
            } catch (err: any) {
                setError(String(err.message || err));
            }

            await pollLogs(jobId);

        }
        setLoading(false);
    };

    return (
        <div className='crawler-container'>
            <form onSubmit={handleFetchProductUrlSubmit}>
                <h2>Fetch product page url (Fandom)</h2>
                <label>
                    <div>Catalog Url</div>
                    <input
                        value={catalogUrl}
                        onChange={(e) => setCatalogUrl(e.target.value)}
                        placeholder="catalog page url"
                    />
                    <div>
                        For example
                        <ul>
                            <li>https://tarmacworks.fandom.com/wiki/2020</li>
                        </ul>
                    </div>
                </label>

                <button type="button" onClick={() => setShowProductUrls((prev) => !prev)}>Toggle</button>
                <button type="button" disabled={productUrlRes && productUrlRes['product_urls'].length === 0} onClick={() => applyProductUrls()}>Use Urls</button>
                {
                    showProductUrls &&
                    <div>
                        {JSON.stringify(productUrlRes && productUrlRes['product_urls'])}
                    </div>
                }
                <div>
                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "Processing..." : "Start"}
                    </button>


                    <button
                        type="button"
                        onClick={() => { setCatalogUrl(""); setError(null); setProductUrlRes(null); }}
                    >
                        Reset
                    </button>
                </div>
            </form>

            <form onSubmit={handleSubmit}>
                <h2>Crawl by url (Fandom)</h2>

                <label>
                    <div>Product Page Url</div>
                    <textarea
                        value={productPageUrl}
                        onChange={(e) => setProductPageUrl(e.target.value)}
                        placeholder="a single product page url"
                    />
                    <div>
                        For example
                        <ul>
                            <li>https://tarmacworks.fandom.com/wiki/T09-CUP</li>
                        </ul>
                    </div>
                    <div>Override</div>
                    <input type="checkbox" checked={override} onChange={(e) => setOverride(e.target.checked)} /> {JSON.stringify(override)}
                </label>

                <div>
                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "Submitting..." : "Crawl"}
                    </button>
                    <button
                        type="button"
                        onClick={() => { setCatalogUrl(""); setError(null); setProductUrlRes(null); }}
                    >
                        Reset
                    </button>
                </div>


                {error && (
                    <div>{error}</div>
                )}

                <div style={{ height: 700, width: '100%', overflowY: 'scroll' }}>
                    <table>
                        <thead>
                            <tr>
                                <th>Time</th>
                                <th>Message</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map((l) => (
                                <tr key={`${l.ts === undefined ? (new Date()).getTime() : l.ts}-${l.message.slice(0, 10)}`}>
                                    <td>{l.ts}</td>
                                    <td>{l.message}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                </div>

            </form>
        </div>
    )
}

export default TWCrawlHelper;
