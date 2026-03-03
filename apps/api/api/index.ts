import type { Request, Response } from 'express';

export default async function handler(req: Request, res: Response) {
	try {
		const { app } = await import('../src/app.js');
		return app(req, res);
	} catch (error) {
		console.error('Serverless bootstrap failed', error);
		const message = error instanceof Error ? error.message : 'Unknown startup error';

		return res.status(500).json({
			error: 'SERVERLESS_BOOTSTRAP_FAILED',
			message,
		});
	}
}
