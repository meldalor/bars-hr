export const MEETINGS = [
  {
    id: 1,
    candidateId: "c1",
    date: "2026-07-06",
    startTime: "09:30",
    endTime: "10:30",
    fullName: "Скворцова Арина",
    vacancy: "Junior-разработчик мобильных приложений",
    type: "pink",
  },
  {
    id: 2,
    candidateId: "c2",
    date: "2026-07-07",
    startTime: "11:00",
    endTime: "12:00",
    fullName: "Петров Виктор",
    vacancy: "Product Manager",
    type: "blue",
  },
  {
    id: 3,
    candidateId: "c6",
    date: "2026-07-08",
    startTime: "10:30",
    endTime: "11:30",
    fullName: "Смирнов Дмитрий",
    vacancy: "Android-разработчик",
    type: "purple",
  },
  {
    id: 4,
    candidateId: "c4",
    date: "2026-07-09",
    startTime: "14:00",
    endTime: "15:00",
    fullName: "Долгорукова София",
    vacancy: "Data Analyst",
    type: "green",
  },
  {
    id: 5,
    candidateId: "c5",
    date: "2026-07-10",
    startTime: "16:00",
    endTime: "17:00",
    fullName: "Соколова Варвара",
    vacancy: "DevOps-инженер",
    type: "orange",
  },
];

export function getMeetings() {
  return MEETINGS.map((meeting) => ({ ...meeting }));
}

export function getMeetingById(id) {
  return MEETINGS.find((meeting) => String(meeting.id) === String(id)) || null;
}
