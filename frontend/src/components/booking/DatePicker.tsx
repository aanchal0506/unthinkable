"use client";

interface DatePickerProps {
  selectedDate: string;
  onChange: (date: string) => void;
}

const getNextDays = () => {
  const dates: string[] = [];

  const today = new Date();

  for (let i = 0; i < 14; i++) {
    const date = new Date(today);

    date.setDate(today.getDate() + i);

    const year = date.getFullYear();
    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0");
    const day = String(date.getDate()).padStart(
      2,
      "0"
    );

    dates.push(`${year}-${month}-${day}`);
  }

  return dates;
};

const formatDay = (dateString: string) => {
  const date = new Date(`${dateString}T00:00:00`);

  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
  }).format(date);
};

const formatDate = (dateString: string) => {
  const date = new Date(`${dateString}T00:00:00`);

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
  }).format(date);
};

export default function DatePicker({
  selectedDate,
  onChange,
}: DatePickerProps) {
  const dates = getNextDays();

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex min-w-max gap-2">
        {dates.map((date) => {
          const selected = date === selectedDate;

          return (
            <button
              key={date}
              type="button"
              onClick={() => onChange(date)}
              className={`
                w-[76px] rounded-lg border px-3 py-3 text-center
                transition
                ${
                  selected
                    ? "border-[#176b87] bg-[#176b87] text-white"
                    : "border-[#e4e7ec] bg-white text-[#344054] hover:border-[#b8d5dc]"
                }
              `}
            >
              <p
                className={`text-xs ${
                  selected
                    ? "text-white/80"
                    : "text-[#98a2b3]"
                }`}
              >
                {formatDay(date)}
              </p>

              <p className="mt-1 text-sm font-medium">
                {formatDate(date)}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}