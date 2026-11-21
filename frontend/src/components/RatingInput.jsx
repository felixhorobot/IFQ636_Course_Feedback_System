// 1 to 5 button for one question, so student can not pick other number
const RatingInput = ({ label, low, high, value, onChange }) => (
  <div className="mb-4">
    <p className="font-semibold mb-2">{label}</p>
    <div className="flex items-center gap-2">
      <span className="text-sm text-qut-copy w-20">{low}</span>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          type="button"
          key={n}
          onClick={() => onChange(n)}
          className={`w-10 h-10 border font-semibold ${
            value === n ? 'bg-qut-denim border-qut-denim text-white' : 'bg-white border-qut-outline'
          }`}
        >
          {n}
        </button>
      ))}
      <span className="text-sm text-qut-copy">{high}</span>
    </div>
  </div>
);

export default RatingInput;
