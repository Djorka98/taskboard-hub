export default function handler(_req: unknown, res: {
	status?: (code: number) => { json?: (payload: unknown) => void };
	setHeader?: (name: string, value: string) => void;
	end?: (body?: string) => void;
	statusCode?: number;
}) {
	const payload = {
		status: 'ok',
		service: 'taskboard-hub-api',
		mode: 'vercel-health-function',
	};

	if (typeof res.status === 'function') {
		const response = res.status(200);
		if (typeof response.json === 'function') {
			response.json(payload);
			return;
		}
	}

	if (typeof res.setHeader === 'function') {
		res.setHeader('content-type', 'application/json; charset=utf-8');
	}

	if (typeof res.statusCode === 'number') {
		res.statusCode = 200;
	}

	if (typeof res.end === 'function') {
		res.end(JSON.stringify(payload));
	}
}