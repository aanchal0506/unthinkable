interface AppointmentStatusProps {
  status: string;
}

const statusStyles: Record<string, string> = {
  BOOKED: "stamp-pine",
  COMPLETED: "stamp-slate",
  CANCELLED: "stamp-clay",
  PENDING: "stamp-amber",
};

const formatStatus = (status: string) => {
  return status
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export default function AppointmentStatus({
  status,
}: AppointmentStatusProps) {
  return (
    <span className={`stamp ${statusStyles[status] || "stamp-neutral"}`}>
      {formatStatus(status)}
    </span>
  );
}
