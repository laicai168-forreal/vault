import { useCallback, useRef, useState } from 'react';
import { CrawlerParams, runPopraceTask } from '../../../api/carDataCrawlerApi';
import { v4 as uuid } from "uuid";
import { pollCrawlerLog } from '../../../api/logApi';
import "./MGTCrawlHelper.scss";
import { DisplayUrl } from './shared/crawlerTypes';
import dayjs from 'dayjs';
import { LinearProgress } from '@mui/material';
import { FaExternalLinkAlt } from "react-icons/fa";

interface CrawlLog {
    jobId?: string;
    ts?: number;
    message: string;
}

const PopraceCrawlHelper = () => {
    const [productPageUrl, setProductPageUrl] = useState("");
    const [override, setOverride] = useState(false);
    const [range, setRange] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [response, setResponse] = useState<any>(null);
    const [logs, setLogs] = useState<CrawlLog[]>([]);
    const logLastKey = useRef(0);
    const [history, setHistory] = useState<any>([]);
    const [showProgress, setShowProgress] = useState(false);
    const [urlDisplay, setUrlDisplay] = useState<DisplayUrl[]>([]);

    const validate = () => {
        if (
            !productPageUrl.trim() &&
            !range.trim()
        ) return "catalog URL or productPage URL or range is required";
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
        const isNotChanged = (url: DisplayUrl) => {
            return !(url.finished || url.hasError || url.notFound || url.skipped);
        }
        logs.forEach(l => {
            if (l.message.includes("### Crawled")) {
                setUrlDisplay(prev =>
                    prev.map(u =>
                        isNotChanged(u) && l.message.includes(u.url)
                            ? { ...u, finished: true }
                            : u
                    )
                );
            } else if (l.message.includes("### Crawl Error")) {
                setUrlDisplay(prev =>
                    prev.map(u =>
                        isNotChanged(u) && l.message.includes(u.url)
                            ? { ...u, hasError: true }
                            : u
                    )
                );
            } else if (l.message.includes("### Skip Crawling")) {
                setUrlDisplay(prev =>
                    prev.map(u =>
                        isNotChanged(u) && l.message.includes(u.url)
                            ? { ...u, skipped: true }
                            : u
                    )
                );
            } else if (l.message.includes("### Page not found")) {
                setUrlDisplay(prev =>
                    prev.map(u =>
                        isNotChanged(u) && l.message.includes(u.url)
                            ? { ...u, notFound: true }
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
        setResponse(null);

        const v = validate();
        if (v) {
            setError(v);
            return;
        }

        setLoading(true);
        setLogs([]);
        logLastKey.current = 0;

        if (productPageUrl || range) {
            let urls;
            if (productPageUrl) {
                if (productPageUrl.startsWith("[")) {
                    try {
                        urls = JSON.parse(productPageUrl);
                    } catch (err: any) {
                        setError(err);
                    }
                } else {
                    urls = [...productPageUrl.split(",").map(u => u.trimStart().trimEnd())];
                }
            } else if (range) {
                urls = getRangeUrls(range);
            }


            // We allow to put in JSON array and also urls joint by ","

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
                    runPopraceTask(crawlBody).catch(err => console.log(err));
                } catch (err: any) {
                    setError(String(err.message || err));
                }

                await pollLogs(jobId);
            }
        }

        setLoading(false);
    };

    const getRangeUrls = (range: string) => {
        const [left, right] = range.split('-').map(r => parseInt(r));

        if (Number.isNaN(left) || Number.isNaN(right)) {
            setError('Range input is not number');
        } else if (!left || !right) {
            setError('Range should be using this pattern "number-number", such as "10-20"');
        } else if (left > right) {
            setError('Range should be from a smaller number to a bigger number');
        } else {
            return new Array(right - left + 1)
                .fill(null)
                .map((u, index) => `https://www.poprace.jp/view/item/${String(left + index).padStart(12, "0")}`);
        }

        return [];
    }

    const toggleProgress = () => {
        setShowProgress(prev => !prev);
    }

    return (
        <div className='crawler-container'>
            <form onSubmit={handleSubmit}>
                <h2>Crawl Pop Race</h2>
                <label>
                    <div>Product Page Url</div>
                    <textarea
                        className='url-text-area'
                        name="urls"
                        value={productPageUrl}
                        onChange={(e) => { setProductPageUrl(e.target.value); setRange(''); }}
                        placeholder="page urls"
                    />
                    <div>
                        For example
                        <ul>
                            <li>https://www.poprace.jp/view/item/000000000021</li>
                        </ul>
                    </div>
                    <div>Use a Range</div>
                    <input
                        value={range}
                        onChange={(e) => { setRange(e.target.value); setProductPageUrl(''); }}
                        placeholder="1-10"
                    />
                    <div>
                        For example
                        <ul>
                            <li>1-10</li>
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
                        onClick={() => { setProductPageUrl(""); setRange(""); setError(null); setResponse(null); }}
                    >
                        Reset
                    </button>
                </div>


                {error && (
                    <div>{error}</div>
                )}

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
                                urlDisplay.map((u: DisplayUrl) => {
                                    return (
                                        <div
                                            className={
                                                `
                                                    ${u.finished ? 'finished ' : ''}
                                                    ${u.hasError ? 'crawler-url-error ' : ''}
                                                    ${u.skipped ? 'skipped ' : ''}
                                                    ${u.notFound ? 'notfound ' : ''}
                                                `
                                            }>
                                            {`${u.url}`}
                                            <a
                                                href={u.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <FaExternalLinkAlt />
                                            </a>
                                        </div>
                                    )
                                })
                            }
                        </>
                    }
                </div>

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

export default PopraceCrawlHelper;
