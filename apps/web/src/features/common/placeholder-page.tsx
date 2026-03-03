import { motion } from 'framer-motion';

type PlaceholderPageProps = {
  title: string;
  description: string;
};

export const PlaceholderPage = ({ title, description }: PlaceholderPageProps) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: 'easeOut' }}
      className="rounded-2xl border border-border/80 bg-card/70 p-6 shadow-panel"
    >
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">{description}</p>
    </motion.section>
  );
};
