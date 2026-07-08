function Svg({ size = 20, children }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            {children}
        </svg>
    );
}

export function IconArrowUpRight({ size }) {
    return (
        <Svg size={size}>
            <path d="M7 17 17 7" />
            <path d="M8 7h9v9" />
        </Svg>
    );
}

export function IconUsers({ size }) {
    return (
        <Svg size={size}>
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </Svg>
    );
}

export function IconRuble({ size }) {
    return (
        <Svg size={size}>
            <path d="M8 21V4h5a4.5 4.5 0 0 1 0 9H8" />
            <path d="M5 13h9" />
            <path d="M5 17h7" />
        </Svg>
    );
}

export function IconCalendar({ size }) {
    return (
        <Svg size={size}>
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M16 2v4M8 2v4M3 10h18" />
        </Svg>
    );
}

export function IconEdit({ size }) {
    return (
        <Svg size={size}>
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </Svg>
    );
}

export function IconSearch({ size }) {
    return (
        <Svg size={size}>
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
        </Svg>
    );
}

export function IconFilter({ size }) {
    return (
        <Svg size={size}>
            <path d="M3 4h18l-7 8v7l-4 2v-9Z" />
        </Svg>
    );
}

export function IconSort({ size }) {
    return (
        <Svg size={size}>
            <path d="M4 6h13" />
            <path d="M4 12h8" />
            <path d="M4 18h4" />
        </Svg>
    );
}

export function IconPlus({ size }) {
    return (
        <Svg size={size}>
            <path d="M12 5v14M5 12h14" />
        </Svg>
    );
}

export function IconChevronDown({ size }) {
    return (
        <Svg size={size}>
            <path d="m6 9 6 6 6-6" />
        </Svg>
    );
}

export function IconInfo({ size }) {
    return (
        <Svg size={size}>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 16v-4M12 8h.01" />
        </Svg>
    );
}

export function IconPrinter({ size }) {
    return (
        <Svg size={size}>
            <path d="M6 9V4h12v5" />
            <path d="M6 18H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-1" />
            <rect x="7" y="15" width="10" height="6" rx="1" />
        </Svg>
    );
}

export function IconUser({ size }) {
    return (
        <Svg size={size}>
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" />
        </Svg>
    );
}

export function IconClock({ size }) {
    return (
        <Svg size={size}>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
        </Svg>
    );
}

export function IconFlask({ size }) {
    return (
        <Svg size={size}>
            <path d="M9 3h6" />
            <path d="M10 3v6l-5 9a1.5 1.5 0 0 0 1.3 2.2h11.4A1.5 1.5 0 0 0 19 18l-5-9V3" />
            <path d="M7 15h10" />
        </Svg>
    );
}

export function IconPhone({ size }) {
    return (
        <Svg size={size}>
            <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.4-1.4a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2Z" />
        </Svg>
    );
}

export function IconMail({ size }) {
    return (
        <Svg size={size}>
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="m3 7 9 6 9-6" />
        </Svg>
    );
}

export function IconCheckCircle({ size }) {
    return (
        <Svg size={size}>
            <circle cx="12" cy="12" r="9" />
            <path d="m8.5 12 2.5 2.5 4.5-5" />
        </Svg>
    );
}

export function IconXCircle({ size }) {
    return (
        <Svg size={size}>
            <circle cx="12" cy="12" r="9" />
            <path d="m9 9 6 6M15 9l-6 6" />
        </Svg>
    );
}

export function IconBriefcase({ size }) {
    return (
        <Svg size={size}>
            <rect x="3" y="7" width="18" height="13" rx="2" />
            <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <path d="M3 13h18" />
        </Svg>
    );
}

export function IconBuilding({ size }) {
    return (
        <Svg size={size}>
            <path d="M6 21V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v17" />
            <path d="M3 21h18" />
            <path d="M9 7h1M14 7h1M9 11h1M14 11h1M9 15h1M14 15h1" />
        </Svg>
    );
}

export function IconBulb({ size }) {
    return (
        <Svg size={size}>
            <path d="M9 18h6" />
            <path d="M10 22h4" />
            <path d="M15.1 14a5 5 0 1 0-6.2 0c.5.4 1.1 1.2 1.1 2h4c0-.8.6-1.6 1.1-2Z" />
        </Svg>
    );
}

export function IconDocument({ size }) {
    return (
        <Svg size={size}>
            <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" />
            <path d="M14 3v5h5" />
            <path d="M9 13h6M9 17h6" />
        </Svg>
    );
}
