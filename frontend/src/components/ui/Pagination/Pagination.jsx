import "./Pagination.css";

export default function Pagination({ page, totalPages, onChange }) {
    if (totalPages <= 1) {
        return null;
    }

    const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

    return (
        <div className="pager">
            <button
                type="button"
                className="pager-more"
                onClick={() => onChange(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}
            >
                Загрузить ещё
            </button>

            <div className="pager-pages">
                {pages.map((item) => (
                    <button
                        type="button"
                        key={item}
                        className={`pager-page ${item === page ? "active" : ""}`}
                        onClick={() => onChange(item)}
                    >
                        {item}
                    </button>
                ))}
            </div>
        </div>
    );
}
