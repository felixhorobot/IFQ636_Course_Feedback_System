// badge colour for each status
const BADGE = {
  Open: 'bg-qut-skytint text-qut-poly',
  Replied: 'bg-qut-brand text-white',
  Archived: 'bg-qut-bg text-qut-copy',
};

// show one check-in, use in student page and staff page
const CheckInCard = ({ checkIn, name }) => {
  const status = checkIn.archived ? 'Archived' : checkIn.status;
  return (
    <div className="bg-white border-l-4 border-qut-denim p-4 mb-4">
      <div className="flex justify-between mb-2">
        <h2 className="font-bold">Week {checkIn.week} {name && `from ${name}`}</h2>
        <span className={`text-xs font-semibold px-2 py-1 ${BADGE[status]}`}>{status}</span>
      </div>
      <p>Pace: {checkIn.pace} | Clarity: {checkIn.clarity} | Workload: {checkIn.workload}</p>
      {checkIn.request && <p>Request: {checkIn.request}</p>}
      {checkIn.anonymous && <p className="text-sm text-qut-copy">Sent as anonymous</p>}
      {checkIn.reply && <p className="mt-2 bg-qut-bg p-2">Reply: {checkIn.reply}</p>}
    </div>
  );
};

export default CheckInCard;
