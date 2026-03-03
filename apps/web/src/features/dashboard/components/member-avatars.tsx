import type { TaskMember } from '@/features/dashboard/dashboard.types';

type MemberAvatarsProps = {
  members: TaskMember[];
};

export const MemberAvatars = ({ members }: MemberAvatarsProps) => {
  return (
    <div className="flex items-center justify-start sm:justify-end">
      {members.slice(0, 4).map((member, index) => (
        <div
          key={member.id}
          title={member.name}
          className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-xs font-semibold shadow-sm sm:h-10 sm:w-10 sm:text-sm"
          style={{ marginLeft: index === 0 ? 0 : -10 }}
        >
          {member.initials}
        </div>
      ))}
      {members.length > 4 ? (
        <div className="relative -ml-2.5 inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-muted/70 text-xs font-medium text-muted-foreground shadow-sm sm:-ml-3 sm:h-10 sm:w-10 sm:text-sm">
          +{members.length - 4}
        </div>
      ) : null}
    </div>
  );
};
