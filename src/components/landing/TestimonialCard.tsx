import { Star } from "lucide-react";

interface TestimonialCardProps {
  quote: string;
  author: string;
  role: string;
  company: string;
  rating: number;
  delay?: string;
}

const TestimonialCard = ({ quote, author, role, company, rating, delay = "0s" }: TestimonialCardProps) => {
  return (
    <div
      className="animate-slide-up group relative rounded-2xl border border-emerald-500/20 bg-slate-900/60 p-6 backdrop-blur-md transition-all duration-300 hover:border-emerald-400/40 hover:bg-slate-900/80"
      style={{ animationDelay: delay }}
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-0 transition-opacity group-hover:opacity-100" />

      <div className="relative">
        {/* Stars */}
        <div className="mb-4 flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600'}`}
            />
          ))}
        </div>

        {/* Quote */}
        <p className="mb-6 text-gray-300 leading-relaxed">"{quote}"</p>

        {/* Author */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-sm font-bold text-white">
            {author.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <p className="font-semibold text-white">{author}</p>
            <p className="text-sm text-gray-400">{role}, {company}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestimonialCard;
