import { useRef, useState } from 'react';
import { v4 as uuid } from "uuid";
import { pollCrawlerLog } from '../../api/logApi';
import { AdditionalDataHelperParams, runAdditionalDataHelper } from '../../api/carAdditionalDataApi';

interface CrawlLog {
    jobId?: string;
    ts?: number;
    message: string;
}

const AdditionalDataHelper = () => {
    const [version, setVersion] = useState('1');
    const [limit, setLimit] = useState('50');
    const [carIds, setCarIds] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [response, setResponse] = useState<any>(null);
    const [logs, setLogs] = useState<CrawlLog[]>([]);
    const logLastKey = useRef(0);

    const validate = () => {
        if (Number.isNaN(parseInt(version))) return "version should be a number";
        if (Number.isNaN(parseInt(limit))) return "limit should be a number";
        return null;
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setResponse(null);

        const v = validate();
        if (v) {
            setError(v);
            return;
        }

        const jobId = `addition-data-${uuid()}`;

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

                if (logs.some((l) => l.message === 'DONE' || l.message === 'END')) {
                    clearInterval(pollInterval);
                }
            }
        }, 3000);

        try {
            const requestBody: AdditionalDataHelperParams = {
                a_version: parseFloat(version),
                limit: parseInt(limit),
                job_id: jobId,
            }
            if (carIds) requestBody.car_ids = carIds;
            const res = await runAdditionalDataHelper(requestBody);


            const json = await res.json();
            if (!res.ok) {
                setError(json.error || JSON.stringify(json));
            } else {
                setResponse(json);
            }
        } catch (err: any) {
            setError(String(err.message || err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <h2>Add Additional Data</h2>

                <label>
                    <div>Version</div>
                    <input
                        value={version}
                        onChange={(e) => setVersion(e.target.value)}
                        placeholder="a number such as 1"
                    />
                </label>

                <label>
                    <div>Limit</div>
                    <input
                        value={limit}
                        onChange={(e) => setLimit(e.target.value)}
                        placeholder="suggesting 50, if it is hot wheels, it could be 100"
                    />
                </label>

                <label>
                    <div>Car Ids - Optional</div>
                    <input
                        value={carIds}
                        onChange={(e) => setCarIds(e.target.value)}
                        placeholder="2e8ea3f7-f183-49f8-9faa-11cdf8660526,28f547dc-6b90-4c47-95ef-f9b100eb386c"
                    />
                </label>


                <div>
                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "Submitting..." : "Start"}
                    </button>


                    <button
                        type="button"
                        onClick={() => { setVersion(""); setLimit(""); setError(null); setResponse(null); }}
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

export default AdditionalDataHelper;
