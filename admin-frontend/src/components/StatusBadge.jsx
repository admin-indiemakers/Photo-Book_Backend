const STATUS_STYLES = {
  pending: 'bg-warning/10 text-warning',
  confirmed: 'bg-info/10 text-info',
  processing: 'bg-brand-100 text-brand-600',
  shipped: 'bg-info/10 text-info',
  delivered: 'bg-success/10 text-success',
  cancelled: 'bg-danger/10 text-danger',
  paid: 'bg-success/10 text-success',
  failed: 'bg-danger/10 text-danger',
  refunded: 'bg-muted/10 text-muted',
  active: 'bg-success/10 text-success',
  inactive: 'bg-muted/10 text-muted',
  blocked: 'bg-danger/10 text-danger',
};

export default function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || 'bg-muted/10 text-muted';
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${style}`}>
      {status?.replace('_', ' ')}
    </span>
  );
}
