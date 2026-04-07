import { useCallback, useRef, useState } from 'react';
import { CrawlerParams, runInnoTask } from '../../../api/carDataCrawlerApi';
import { v4 as uuid } from "uuid";
import { pollCrawlerLog } from '../../../api/logApi';
import "./MGTCrawlHelper.scss";
import { LinearProgress } from '@mui/material';
import dayjs from "dayjs";
import { DisplayUrl } from './shared/crawlerTypes';

interface CrawlLog {
    jobId?: string;
    ts?: number;
    message: string;
}

const InnoCrawlHelper = () => {
    const [productPageUrl, setProductPageUrl] = useState("");
    const [productUrlJson, setProductUrlJson] = useState(false);
    const [override, setOverride] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [productUrlRes, setProductUrlRes] = useState<any>(null);
    const [logs, setLogs] = useState<CrawlLog[]>([]);
    const [urlDisplay, setUrlDisplay] = useState<DisplayUrl[]>([]);
    const logLastKey = useRef(0);
    const [history, setHistory] = useState<any>([]);
    const [showProgress, setShowProgress] = useState(false);

    const validateCrawUrls = () => {
        if (!productPageUrl.trim()) return "productPage URL is required";
        return null;
    };

    const chunkArray = (arr: any[], n: number) => {
        const chunkedArr = [];
        for (let i = 0; i < arr.length; i += n) {
            chunkedArr.push(arr.slice(i, i + n));
        }
        return chunkedArr;
    }

    const checkFinished = useCallback((logs: CrawlLog[]) => {
        logs.forEach(l => {
            if (l.message.includes("### Crawled")) {
                setUrlDisplay(prev =>
                    prev.map(u =>
                        !u.finished && l.message.includes(u.url)
                            ? { ...u, finished: true }
                            : u
                    )
                );
            }
        })
    }, [urlDisplay])

    const pollLogs = (jobId: string) => {
        return new Promise((resolve) => {
            const pollInterval = setInterval(async () => {
                const res = await pollCrawlerLog({
                    jobId: jobId,
                    lastTs: logLastKey.current,
                });

                setLogs((prev) => [...prev, ...(res.logs ?? [])]);
                const logs: CrawlLog[] = res.logs;
                checkFinished(logs);

                if (logs && logs.length > 0) {
                    if (logs.at(-1)?.ts === undefined) {
                        clearInterval(pollInterval);
                        setLogs((prev) => [...prev, { message: 'No last key detected. Ending the polling ' }]);
                    } else {
                        logLastKey.current = logs.at(-1)?.ts ?? Infinity;
                    }

                    if (logs.some((l) => (l.message === 'DONE' || l.message.includes("Failed to crawl")) && l.jobId === jobId)) {
                        if (logs.some((l) => l.message === 'DONE' && l.jobId === jobId)) {
                            setHistory({ jobId: jobId, status: "Success" });
                        } else {
                            setHistory({ jobId: jobId, status: "Failed" })
                        }
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
        let urls;
        // We allow to put in JSON array and also urls joint by ","
        if (productPageUrl.startsWith("[")) {
            try {
                urls = JSON.parse(productPageUrl);
            } catch (err: any) {
                setError(err);
            }
        } else {
            urls = [...productPageUrl.split(",").map(u => u.trimStart().trimEnd())];
        }
        setUrlDisplay(urls.map((u: any) => ({ url: u, finished: false })));
        const urlChunks = chunkArray(urls, 5);

        for (const uc of urlChunks) {
            const jobId = `crawl-${uuid()}`;
            const crawlBody: CrawlerParams = {
                job_id: jobId,
                product_urls: uc,
                override,
            }
            try {
                runInnoTask(crawlBody).catch(err => console.log(err));
            } catch (err: any) {
                setError(String(err.message || err));
            }

            await pollLogs(jobId);
        }

        setLoading(false);
    };

    const toggleProgress = () => {
        setShowProgress(prev => !prev);
    }

    return (
        <div className='crawler-container'>
            <form onSubmit={handleSubmit}>
                <h2>Crawl Inno by url</h2>
                <label>
                    <h3>Product Page Url</h3>
                    <textarea
                        className='url-text-area'
                        name="urls"
                        value={productPageUrl}
                        onChange={(e) => setProductPageUrl(e.target.value)}
                        placeholder="page urls"
                    />
                    <div>
                        <h3>For example</h3>
                        <ul>
                            <li>https://www.inno-models.com/product/nissan-180sx-black/</li>
                            <li>Split by ","</li>
                            <li>You can also put in json array</li>
                            <li>["https://www.inno-models.com/product/nissan-180sx-black/"]</li>
                            <li>https://www.inno-models.com/product-sitemap.xml</li>
                        </ul>
                    </div>
                    <h3>Override</h3>
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
                        onClick={() => { setError(null); setProductUrlRes(null); }}
                    >
                        Reset
                    </button>
                </div>

                <div className='progress'>
                    <div className="progress-toggle" onClick={toggleProgress}>{showProgress ? "Close " : "Show "}Progress</div>
                    <div>
                        <LinearProgress
                            variant="determinate"
                            value={Math.round(urlDisplay.filter(u => u.finished).length * 100 / urlDisplay.length)}
                        />
                    </div>
                    {
                        showProgress &&
                        <>
                            {
                                urlDisplay.map((u: any) => {
                                    return (<div className={`${u.finished ? 'finished' : ''}`}>{`${u.url}`}</div>)
                                })
                            }
                        </>
                    }
                </div>


                {error && (
                    <div>{error}</div>
                )}

                <div style={{ height: 700, width: '100%', overflowY: 'scroll', border: "1px solid #444", borderRadius: "8px", padding: "0 1rem", boxSizing: "border-box" }}>
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
                                    <td className='time-cell'>{dayjs(l.ts).format("YYYY-MM-DD HH:mm:ss")}</td>
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

export default InnoCrawlHelper;
