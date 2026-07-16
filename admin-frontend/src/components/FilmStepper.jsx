import { Check } from 'lucide-react';

const STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

export default function FilmStepper({ status }) {
  if (status === 'cancelled') {
    return (
      <div className="rounded-xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm font-semibold text-danger">
        This order was cancelled.
      </div>
    );
  }

  const currentIndex = STEPS.indexOf(status);

  return (
    <div className="film-edge rounded-xl border border-border bg-cream/50 px-5 py-5">
      <div className="flex items-center">
        {STEPS.map((step, i) => {
          const done = i < currentIndex;
          const active = i === currentIndex;
          return (
            <div key={step} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition ${
                    done
                      ? 'border-brand-500 bg-brand-500 text-white'
                      : active
                      ? 'border-brand-500 bg-white text-brand-600'
                      : 'border-border bg-white text-muted'
                  }`}
                >
                  {done ? <Check size={14} strokeWidth={3} /> : i + 1}
                </div>
                <span
                  className={`whitespace-nowrap text-[11px] font-semibold capitalize ${
                    active ? 'text-brand-600' : done ? 'text-ink' : 'text-muted'
                  }`}
                >
                  {step}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`mx-2 h-0.5 flex-1 rounded ${done ? 'bg-brand-500' : 'bg-border'}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
