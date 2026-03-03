import { Link } from 'react-router-dom';

export const NotFoundPage = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-6 text-center">
      <h1 className="text-4xl font-semibold">404</h1>
      <p className="text-muted-foreground">The requested view does not exist.</p>
      <Link to="/dashboard" className="rounded-lg bg-primary px-4 py-2 text-primary-foreground">
        Go to Dashboard
      </Link>
    </div>
  );
};
