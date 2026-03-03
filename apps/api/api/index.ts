type GenericRequest = {
	url?: string;
	method?: string;
};

type GenericResponse = {
	status?: (code: number) => GenericResponse;
	json?: (payload: unknown) => void;
	setHeader?: (name: string, value: string) => void;
	end?: (body?: string) => void;
	statusCode?: number;
};

const sendJson = (res: GenericResponse, statusCode: number, payload: unknown) => {
	if (typeof res.status === 'function' && typeof res.json === 'function') {
		res.status(statusCode).json(payload);
		return;
	}

	if (typeof res.setHeader === 'function') {
		res.setHeader('content-type', 'application/json; charset=utf-8');
	}

	if (typeof res.statusCode === 'number') {
		res.statusCode = statusCode;
	}

	if (typeof res.end === 'function') {
		res.end(JSON.stringify(payload));
	}
};

export default async function handler(req: GenericRequest, res: GenericResponse) {
	const url = req.url ?? '';

	if (url === '/health' || url.startsWith('/health?')) {
		sendJson(res, 200, { status: 'ok', service: 'taskboard-hub-api', mode: 'serverless' });
		return;
	}

	try {
		const { app } = await import('../src/app');
		app(req as never, res as never);
	} catch (error) {
		console.error('Serverless bootstrap failed', error);
		const message = error instanceof Error ? error.message : 'Unknown startup error';

		sendJson(res, 500, {
			error: 'SERVERLESS_BOOTSTRAP_FAILED',
			message,
		});
	}
}
