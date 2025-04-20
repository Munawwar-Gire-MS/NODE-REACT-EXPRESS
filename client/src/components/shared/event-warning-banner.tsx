interface EventWarningBannerProps {
  type: 'booked_out' | 'on_set' | 'episode_airing' | 'availability_hold' | 'pinned';
  message: string;
}

const getBannerStyles = (type: EventWarningBannerProps['type']) => {
  switch (type) {
    case 'booked_out':
      return {
        bg: 'bg-red-50',
        border: 'border-red-400',
        text: 'text-red-700',
        icon: 'text-red-400'
      };
    case 'on_set':
      return {
        bg: 'bg-purple-100',
        border: 'border-purple-400',
        text: 'text-purple-700',
        icon: 'text-purple-400'
      };
    case 'episode_airing':
      return {
        bg: 'bg-blue-50',
        border: 'border-blue-400',
        text: 'text-blue-900',
        icon: 'text-blue-400'
      };
    case 'availability_hold':
      return {
        bg: 'bg-cyan-50',
        border: 'border-cyan-400',
        text: 'text-cyan-700',
        icon: 'text-cyan-400'
      };
    case 'pinned':
      return {
        bg: 'bg-amber-50',
        border: 'border-amber-400',
        text: 'text-amber-700',
        icon: 'text-amber-400'
      };
  }
};

export const EventWarningBanner = ({ type, message }: EventWarningBannerProps) => {
  const styles = getBannerStyles(type);

  return (
    <div className={`${styles.bg} border-l-4 ${styles.border} p-4 mb-4`}>
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <svg className={`h-5 w-5 ${styles.icon}`} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className={`text-sm ${styles.text}`}>
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}; 